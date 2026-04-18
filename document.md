# Ketan (formerly PMS Pro) Data Architecture & Process Flow Document

**Author:** Staff Data Engineer / Lead Analyst
**Subject:** Comprehensive Production Management System (PMS) Architecture, State Machines, Data Pipelines, and Temporal Logics.

---

## 1. Executive Summary

The Ketan Production Management System is a robust state-machine-driven Next-Gen web application. It orchestrates garment production workflows from initial requirement gathering through cutting, job assignment, receiving (Jama), and final financial/quantity settlement. 

The architecture is built upon a **React (Vite) frontend**, backed by a **Supabase (PostgreSQL) operational database**, and features advanced **temporal calculation engines** for Service Level Agreement (SLA) tracking based on localized working hours.

---

## 2. Core Data Architecture & Pipeline

### 2.1 Supabase Schema (`jobs` table)
The atomic unit of data in the system is a **Job**. The `jobs` table uses a flattened, wide-column structure utilizing `snake_case` in the database, mapping to `camelCase` in the Node/React application layer.

**Key Identifiers:**
- `job_no`: The primary key. It utilizes an auto-incrementing integer logic determined dynamically at query time by parsing existing string numbers to find the true max integer, preventing race conditions natively without locking tables (implemented in `getNextJobNo`).
- `date`: The immutable creation timestamp (ISO 8601).

### 2.2 Data Synchronization Engine (`sync.js`)
The system was designed with a dual-database architecture: bridging Supabase with Google Sheets (FFMS sheet) via the Google Sheets API.
- **Bi-directional capabilities:** The app supports pushing (upsert/append) to Sheets using the `FMS_COLUMNS` index mapper, and pulling massive manual updates back into Supabase.
- **Current State [FROZEN]:** To preserve FMS sheet integrity and enforce Supabase as the Single Source of Truth (SSOT), the `appendRow` functionality for new jobs is currently *disabled*. The logic logs `Sync: Appending new row disabled for Job #[X] (FFMS freeze)` but still allows positional updates for legacy jobs.

---

## 3. The 7-Step State Machine Workflow

The production lifecycle is strictly enforced through a determinable state machine (`detectStep` function).

### Step 1: New Requirement
- **Data Captured:** `progBy`, `item`, `itemGroup`, `size`, `qty` (Requirement), `reason`, `specialInstruction`.
- **System Action:** Job is assigned a tracking number.
- **Temporal Event:** `s2_planned` deadline is statically generated as `Submission Time + 63 working hours`.

### Step 2: Production Approval
- **Data Captured:** `s2_yes_no`, `s2_inhouse`, `s2_instructions`.
- **Metrics Calculated:** Exact `s2_actual` timestamp recorded. Calculates `s2_delay` in precise working hours.
- **Routing Logic:** 
  - If **NO**: Job transitions directly to **Step 7 (Done - Rejected)**.
  - If **YES** & **Inhouse = YES**: Job routes to **Step 3 (Inhouse Cutting)**.
  - If **YES** & **Inhouse = NO**: Job skips cutting, routes directly to **Step 4 (Naame)**.
- **Temporal Event:** If proceeding to Step 3, `s3_planned` is set to `s2_actual + 36 working hours`.

### Step 3: Inhouse Cutting
- **Data Captured:** `s3_dukan_cutting` (pieces), `s3_size_details`, `s3_cutting_person`.
- **Constraints:** Cannot be modified once `s3_actual` is logged.
- **Temporal Event:** `s4_planned` is set to `s3_actual + 18 working hours`.

### Step 4: Naame (Production Assignment)
- **Data Captured:** `s4_thekedar` (Contractor), `s4_lead_time` (dynamic TAT in hours), `s4_cutting_pcs`, `s4_cut_to_pack`.
- **Metrics Result:** Logs `s4_start_date` and `s4_delay`.
- **Temporal Event:** `s5_jama_planned` is calculated specifically using the user-provided dynamic lead time: `s4_start_date + s4_lead_time working hours`.

### Step 5: Finished Maal Jama (Receiving)
- **Data Captured:** `s5_jama_qty`, `s5_press`, `s5_status = 'Complete'`.
- **State Transition:** The moment `s5_jama_qty` is populated, the job enters the critical **Step 6 (Settle)** queue.

### Step 6: Settle (Financial & Quantity Reconciliation)
- **Objective:** Ensures 100% data integrity between requested pieces and received pieces.
- **Data Captured:** `s6_settle_qty` (can accept negative variance), `s6_reason`, `s6_name`.
- **Balance Equation:** `Remaining Balance = Requirement (qty) - Jama (s5_jama_qty) - Settle (s6_settle_qty)`.
- **State Constraint:** The job is strictly locked in Step 6 until the balance is numerically exactly 0 or less.

### Step 7: Done (Completion)
- **Conditions for absolute completion:**
  1. Job was rejected at Step 2.
  2. For successful production: **Both** `s5_jama_qty` and `s6_settle_qty` fields must be explicitly populated in the database.
  3. `Jama + Settle >= Requirement`.

---

## 4. Analytical Time Engine (`workingHours.js`)

To calculate accurate delays and SLAs, a highly specialized temporal engine is embedded into the utility layer to ignore non-working hours. A standard `Date.now() - timestamp` calculation provides false negatives in manufacturing.

### Engine Rules:
1. **Working Days:** Monday through Saturday. **Sundays are completely skipped** (0 hours elapsed).
2. **Working Hours:** 10:00 AM to 07:00 PM (19:00). Total: **9 hours per working day**.
3. **Clamping Mechanism (`clampToWorkingTime`):** 
   - If an action occurs at 08:00 AM, the system clamps the timestamp to 10:00 AM the same day.
   - If an action occurs at 21:00 (9PM), the timestamp is clamped and pushed to 10:00 AM the *next* working day.
4. **Delay Calculation (`workingHoursBetween`):** 
   - Advances minute-by-minute segment calculations within working windows to return exact floating-point delays (e.g., `3.45 hours` late).

---

## 5. UI Observability & Dashboard Analytics

### Real-Time Constraints:
- Dashboard status detection (`getJobStatus`) continuously evaluates the Job state:
  - **Complete:** If `detectStep() === 7`.
  - **Late:** If `Date.now() - PlannedTimestamp > DELAY_THRESHOLDS[step]`. (Thresholds: Step 1: 3d, 2: 2d, 3: 2d, 4: 14d, 5: 3d in actual 24h ms difference).
  - **On-track:** Otherwise.

### Reporting Layer (`CuttingReports.jsx`):
- Features a **10-day active observation window** for completed cutting tasks to maintain DOM performance, with a full-data load toggle.
- **Hisab Generation:** Client-side dynamic PDF generation using `jsPDF` and `jspdf-autotable`. Uses complex array mapping to generate structured financial grids specifically filtered by `s3_cutting_person`. Enforces rate-card validity (disables download if a recorded piece lacks an inputted rate).

---
*End of Documentation*
