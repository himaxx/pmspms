# PMS Pro — Production Management System
### Complete Product Documentation

---

> **Designed for garment manufacturers who need full visibility, accountability, and speed across their production pipeline — from the moment a requirement is raised to the final settlement.**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem We Solve](#2-the-problem-we-solve)
3. [Product Overview](#3-product-overview)
4. [How It Works — The 6-Step Pipeline](#4-how-it-works--the-6-step-pipeline)
5. [Core Modules & Features](#5-core-modules--features)
   - 5.1 [Live Dashboard](#51-live-dashboard)
   - 5.2 [Production Forms](#52-production-forms)
   - 5.3 [Cutting Reports](#53-cutting-reports)
   - 5.4 [Production Pipeline View](#54-production-pipeline-view)
   - 5.5 [Admin Analytics Dashboard](#55-admin-analytics-dashboard)
   - 5.6 [Master Data Management](#56-master-data-management)
6. [Smart Delay Detection Engine](#6-smart-delay-detection-engine)
7. [Real-Time Data Architecture](#7-real-time-data-architecture)
8. [Google Sheets Integration](#8-google-sheets-integration)
9. [Access Control & Security](#9-access-control--security)
10. [Who Is This For?](#10-who-is-this-for)
11. [Key Business Benefits](#11-key-business-benefits)
12. [Technical Specifications](#12-technical-specifications)
13. [Frequently Asked Questions](#13-frequently-asked-questions)

---

## 1. Executive Summary

**PMS Pro** (Production Management System) is a cloud-based, mobile-first web application built specifically for garment manufacturing businesses. It digitises and automates the entire production lifecycle — from the initial requirement entry to fabric cutting, stitching dispatch to karigar/thekedar, goods collection (jama), and final settlement.

PMS Pro eliminates the chaos of paper registers, WhatsApp messages, and Excel sheets. Every team member, at every stage of production, works from a single digital system. Managers get real-time visibility into every job's current status, who is responsible for it, and whether it is running on time or is delayed.

**In short:** PMS Pro tells you *exactly* where every job is, who has it, and whether it's on time — at any moment, from any device.

---

## 2. The Problem We Solve

Garment manufacturing involves multiple handoffs between departments and people:

| Stage | Who Handles It | Traditional Problem |
|---|---|---|
| New requirement raised | Salesperson / Owner | Written in a register, easily lost |
| Fabric ready, approval needed | Production head | Phone calls, WhatsApp, confusion |
| Fabric sent for cutting | Cutting person | No record of exactly how many pieces were cut |
| Goods dispatched to karigar | Thekedar / Owner | No clear dispatch log or lead time tracking |
| Finished goods collected | Storekeeper | Quantities manually tallied, errors common |
| Final settlement | Accounts / Owner | Delays in reconciliation, loss of pieces |

The result is **lost jobs, delivery delays, disputes over piece counts, and no ability to identify which stage is the bottleneck.**

PMS Pro solves all of this by:
- Creating a **digital record** at every step
- Giving **one clear view** to everyone
- **Automatically flagging** jobs that are taking longer than they should
- Providing **management analytics** so business owners can make data-driven decisions

---

## 3. Product Overview

PMS Pro is a **Progressive Web App (PWA)** — it runs in any web browser on any device (mobile, tablet, desktop) without needing to install anything from an app store. It feels like a native mobile app, with smooth animations, pull-to-refresh, and real-time updates.

### Technology at a Glance

| Component | Technology |
|---|---|
| Platform | Web App (works on any device, any browser) |
| Database | Supabase (PostgreSQL cloud database) |
| Real-time sync | Live WebSocket subscriptions — data updates instantly across all devices |
| Data export | Google Sheets integration (two-way sync) |
| Authentication | Secure admin login with session management |
| Deployment | Hosted on Netlify CDN — always fast, always online |

### User Roles

| Role | Access |
|---|---|
| **Production Team** | Can view jobs, fill in forms for their step |
| **Admin** | Full access including analytics, data corrections, and system settings |

---

## 4. How It Works — The 6-Step Pipeline

Every order/job in PMS Pro follows a defined 6-step production pipeline. The system automatically tracks which step each job is at and alerts when a step is taking too long.

```
Step 1: New Requirement (Yeh Maal Banwana Hai)
    ↓
Step 2: Production Approval (Fabric Ready — Approve or Reject)
    ↓
Step 3: Inhouse Cutting (Only if cutting is done in-house)
    ↓
Step 4: Naame — Goods Dispatched to Karigar/Thekedar
    ↓
Step 5: Jama — Finished Goods Collected Back
    ↓
Step 6: Settle — Final Reconciliation & Closure
    ↓
   DONE ✅
```

> **Note:** Step 3 (Inhouse Cutting) is conditional. If the production approval specifies that cutting will be done by the thekedar directly (not in-house), the job skips Step 3 and goes directly from Step 2 → Step 4.

### Pipeline Stages in Detail

#### Step 1 — New Requirement
A team member raises a new production requirement by filling a form. They enter:
- **Item name** (selected from a structured catalog of Categories → Subcategories → Items)
- **Size and Quantity** (supports multiple size sets, e.g., S×50, M×80, L×40)
- **Reason** (New Order / Refill)
- **Special Instructions** (e.g., "urgent", "particular colour only")
- **Who is filling the form** (Prog. By — selected from a managed list)

The system auto-generates a Job Number and records the timestamp.

#### Step 2 — Production Approval
The production head reviews the job and approves or rejects it. They record:
- **Approved or Rejected** (Yes/No decision)
- **Instructions** (if any, e.g., fabric details, design notes)
- **Is cutting Inhouse?** (Yes → job goes to Step 3; No → job skips to Step 4)

If the job is **rejected**, it is marked as closed (Done) and does not proceed further.

#### Step 3 — Inhouse Cutting
The cutting person logs the actual cutting done:
- **Who did the cutting** (selected from managed list)
- **Actual pieces cut per size** (size-wise breakdown with totals)

The system records the date and time of cutting.

#### Step 4 — Naame (Dispatch to Karigar)
The job is dispatched to a karigar (stitcher / thekedar) for production:
- **Thekedar / Karigar name** (selected from managed list of registered thekedars)
- **Number of pieces dispatched** (size-wise)
- **Lead time** (how many working hours the karigar is expected to take)
- **Cut-to-Pack?** (Yes/No — whether pieces are sent cut-to-pack or loose)

The system uses this lead time to calculate the expected Jama date automatically.

#### Step 5 — Jama (Finished Goods Collection)
When the karigar returns the finished goods:
- **Quantity collected** (Jama Qty)
- **Press Hua?** (Yes/No — were the goods pressed/ironed?)

The system automatically calculates any quantity balance still pending with the karigar.

#### Step 6 — Settle
Final closure of the job:
- **Settled Quantity** (any remaining pieces settled)
- **Reason** (if less pieces returned)
- **Settled by** (person handling settlement)

Once both Jama Qty + Settle Qty ≥ Required Qty, the job is marked **Complete ✅**.

---

## 5. Core Modules & Features

### 5.1 Live Dashboard

The main screen of PMS Pro. It shows **all active jobs** in real-time with powerful filtering and search.

**Key Features:**
- **Live job list** — every job with its current step displayed
- **Search** — find any job instantly by Job Number or Item Name
- **Date range filter** — view jobs from specific periods
- **Step filter** — show only jobs at a specific stage (e.g., "show all jobs at Step 4")
- **Status filter** — filter by On Track, Late, or Complete
- **Job detail view** — tap any job to see its full production timeline in a beautiful bottom sheet
  - Shows each step with the date, responsible person, and key data
  - Highlights the current active step
  - Shows balance quantity and time delay at a glance
  - Displays any special instructions prominently

**"Aaj Ke Naame" — Daily Dispatch Log:**
A dedicated section showing all jobs dispatched to karigars on any selected date, including the karigar name, item, and number of pieces. This is the daily dispatch summary that production managers check every morning.

**Live Insights — Analytics Hub:**
Below the job list, a set of real-time charts shows:
- Step distribution (how many jobs are at each stage)
- Status breakdown (On Track vs. Late vs. Complete)
- Instant health overview of the entire production floor

**Pull-to-Refresh:**
On mobile, simply pull down to refresh all data from the server.

**Google Sheets Sync:**
Two dedicated buttons allow managers to:
- **Pull** all edits from Google Sheets into the system database
- **Push** all job records from the database to Google Sheets

---

### 5.2 Production Forms

The data-entry heart of PMS Pro. This module allows any team member to find a job and fill in the relevant step form.

**How it works:**
1. Select which step you want to fill (Step 1 through Step 6)
2. For Steps 2–6: Search for and select the relevant pending job
3. Fill in the form fields for that step
4. Review the confirmation popup showing exactly what will be saved
5. Confirm — data is saved instantly

**Step Selector — Color-Coded Tabs:**
Each step has a distinct color for easy navigation:
- Step 1 (Indigo) — New Requirement
- Step 2 (Blue) — Production Approval
- Step 3 (Orange) — Inhouse Cutting
- Step 4 (Purple) — Naame
- Step 5 (Green) — Jama
- Step 6 (Gray) — Settle

**Smart Job Routing:**
The pending job list for each step automatically shows only the jobs that are *actually pending at that step* — no confusion, no showing jobs from other stages.

**Cascade Item Catalog:**
Step 1's item selection uses a 3-level cascade:
- **Category** → **Subcategory** → **Item Name**
- The catalog is fully managed by the admin and can be updated without touching any code.

**Confirmation Popup:**
Before any form is submitted, a confirmation screen shows a structured summary of all data. This prevents accidental wrong entries.

**Multi-Size Support:**
Step 1, 3, and 4 all support entering quantities for multiple sizes in a single job (e.g., S:50, M:80, L:40). The system maintains size-wise breakdowns throughout the pipeline.

---

### 5.3 Cutting Reports

A dedicated module for the cutting team with three tabs:

#### Tab 1: Pending
Shows all jobs that are currently waiting for inhouse cutting (Step 3). Includes:
- Job number and item name
- Quantity and size details
- How many days the job has been waiting
- An animated "Awaiting Cutting" indicator

**Quick Cutting Entry:** Tap any pending job to open a cutting entry sheet directly — no need to navigate to the Forms module.

#### Tab 2: Completed
Shows all cutting jobs that have been logged and completed. Defaults to last 10 days but can switch to "View All Data."

#### Tab 3: Hisab (Cutting Bill Calculator)
A financial tool for calculating and downloading the cutting bill for a specific cutting person:
- Select date range and cutting person
- Enter per-piece rate for each job
- The system automatically calculates totals
- **Download Hisab PDF** — generates a formatted PDF document with the complete bill, including date, item, pieces, rate, amount, and grand total

---

### 5.4 Production Pipeline View

A high-level overview of the entire production floor, organized by stage.

**Two View Modes:**

#### Pipeline by Stage
All active jobs are grouped into 5 pipeline stages:
- 📝 Awaiting Production Approval
- 🧵 Fabric Ready (Awaiting Cutting)
- 📦 Inhouse Cut (Waiting for Naame)
- 🏭 In Production (With Karigar)
- ✅ Jama Complete (Unsettled)

Each stage card shows:
- Total active jobs
- Number of **late** jobs with a red pulsing indicator
- A progress bar showing how far through the pipeline jobs have progressed

Tap any stage to see the detailed list of all jobs in that stage, sorted by most delayed first.

#### Thekedar Insights
Groups all active production jobs (Steps 4-6) by karigar/thekedar name. Shows:
- How many jobs each thekedar has active
- Searchable thekedar list

This gives production managers a **per-karigar workload view** — useful for understanding who is overloaded and who has capacity.

**Category Filter:**
A horizontal scrolling filter bar allows filtering the pipeline by garment category (Full Bottom, Capri, Shorts, Tops/T-shirts, etc.)

---

### 5.5 Admin Analytics Dashboard

A powerful, password-protected analytics dashboard for business owners and senior management. Uses a dark midnight theme with 10 sections of interactive charts and tables.

#### 1. Executive KPI Bar
Six key performance indicators displayed prominently:
- **Total Jobs** — all jobs ever created
- **Active Jobs** — jobs currently in progress
- **Completed This Month** — jobs completed in the current calendar month
- **Approval Rate** — percentage of jobs approved vs. submitted for approval
- **Pieces in Production** — total pieces currently with karigars
- **Avg. Delay** — average delay hours across all steps

#### 2. Production Volume Trend (Area Chart)
A 12-week area chart showing:
- New jobs created per week
- Jobs completed per week

This reveals whether the business is growing, stagnating, or facing a backlog.

#### 3. Live Pipeline Funnel (Bar Chart)
A horizontal bar chart showing exactly how many jobs are currently pending at each step (New Requirement, Approval, Cutting, Naame, Jama, Settle). Instantly identifies the most congested stage.

#### 4. Delay Analysis by Step (Grouped Bar Chart)
For each production step, shows:
- **Average delay** (in hours)
- **Maximum delay** (in hours)

This pinpoints which step consistently causes the most delays — enabling targeted process improvement.

#### 5. Thekedar Performance
A ranked list of all thekedars (karigars) by active jobs, showing:
- Total jobs given (all time)
- Currently active jobs
- Total pieces produced
- Average lead time

#### 6. Cutting Person Stats (Donut + Bar)
- A donut chart showing the share of total pieces cut by each cutting person
- A stacked weekly bar chart showing per-person cutting volumes over 8 weeks

#### 7. Item Group Distribution (Pie Chart)
Shows how jobs and pieces are distributed across garment categories (Full Bottom, Capri, Tops, etc.). Helps identify the most produced product lines.

#### 8. Activity Heatmap (18-Week Grid)
A GitHub-style activity calendar showing production activity intensity over the past 18 weeks. Darker cells = more activity on that day. Identifies busy periods and production gaps.

#### 9. Bottleneck Jobs Table
A live, sortable table of all jobs with recorded delays. Shows:
- Job number, item, step, and thekedar
- Delay amount with color-coded severity (yellow → amber → red)
- Sort by "Most Delayed" or "Latest Step"

This is the action screen — where managers identify and chase the most critical stuck jobs.

#### 10. Approval & Rejection Flow (Bar Chart)
Shows for a selected period (week, month, all-time):
- Total approved jobs
- Total rejected jobs
- Of approved: how many went to inhouse cutting vs. directly to thekedar

#### Raw Data Explorer
A full sortable table of every job in the database with all fields visible. Includes a **CSV Export** button to download all data to a spreadsheet in one click.

#### System Modifications (Data Correction)
A powerful admin-only tool that allows searching for any job and directly editing any of its raw field values in the database. This provides a safety net for correcting data entry errors made at any step.

---

### 5.6 Master Data Management

The admin can manage all dropdown lists used in production forms — no code changes required:

| List | Used In |
|---|---|
| **Prog. By Names** | Step 1 — who raised the requirement |
| **Inhouse Cutting Names** | Step 3 — who did the cutting |
| **Thekedar / Karigar Names** | Step 4 — who received the goods |

Changes take effect instantly across all devices.

**Product Catalog Management:**
The admin can also manage the 3-level item catalog (Category → Subcategory → Item) used in Step 1:
- Add / rename / delete categories
- Add / rename / delete subcategories
- Add / remove individual item names

This means the catalog always stays up to date with new products without needing a developer.

---

## 6. Smart Delay Detection Engine

One of PMS Pro's most powerful features is its **built-in time intelligence**. Every job has a defined maximum time it should spend at each step, based on working hours (Monday–Saturday, 10 AM–7 PM). The system automatically calculates whether each job is on time or delayed.

### Working Hours Definition
- **Working Days:** Monday to Saturday
- **Working Hours:** 10:00 AM to 7:00 PM (9 hours/day)
- **Sunday:** Completely excluded from all time calculations

This ensures that a job started on Saturday afternoon is not counted as "late" just because Sunday passed.

### Delay Thresholds (Per Step)

| Step | Step Name | Max Allowed Time |
|---|---|---|
| Step 2 | Pending Approval | 27 working hours (≈ 3 working days) |
| Step 3 | Pending Cutting | 18 working hours (≈ 2 working days) |
| Step 4 | Pending Naame | 18 working hours (≈ 2 working days) |
| Step 5 | Pending Jama | 126 working hours (≈ 14 working days) |
| Step 6 | Pending Settle | 27 working hours (≈ 3 working days) |

### Visual Status Indicators
- 🟡 **On Track** — job is within the allowed time
- 🔴 **Late** — job has exceeded the allowed time for its current step
- 🟢 **Complete** — job has been fully settled

These indicators are visible throughout the app — on every job card, in the pipeline view, and in the admin analytics.

### Planned Date Calculation
The system also automatically calculates when each step *should* complete based on when the previous step was done:
- Step 2 should complete within **63 working hours** of job creation
- Step 3 should complete within **36 working hours** of Step 2 completion
- Step 4 should start within **18 working hours** of Step 3 completion
- Step 5 (Jama) is calculated based on the **lead time entered by the production team** in Step 4

---

## 7. Real-Time Data Architecture

PMS Pro uses **Supabase** as its backend — a powerful PostgreSQL cloud database with built-in real-time capabilities.

### How Real-Time Works
- The app maintains a live WebSocket connection to the database
- When **any user saves a form** on any device, every other open instance of the app **automatically refreshes** within seconds
- No need to manually refresh — data flows instantly

### Shared Data Cache
All modules (Dashboard, Forms, Cutting Reports, Pipeline) share the same data cache. When one page loads data, all other pages use the same copy — making the app fast and consistent.

---

## 8. Google Sheets Integration

PMS Pro supports **bi-directional sync with Google Sheets** as a legacy bridge or reporting tool.

### Pull from Sheets → Database
Reads all rows from a connected Google Sheet and upserts them into the Supabase database. Useful for:
- Migrating historical data from an existing spreadsheet
- Allowing non-app users to still update data via Sheets

### Push from Database → Sheets
Exports all job records from the database into the Google Sheet. Useful for:
- Sharing data with parties who prefer spreadsheets
- Creating a backup copy in Google Sheets

Both operations are available directly from the Dashboard and can be triggered with one button click.

---

## 9. Access Control & Security

### Two-Tier Access
| Access Level | Can Do |
|---|---|
| **General (No Login)** | View all jobs, fill step forms, view cutting reports, view pipeline |
| **Admin (Password Protected)** | Everything above + Analytics, Raw Data, CSV Export, Master Data Management, Data Correction |

### Admin Authentication
- Admin login via secure email/password through Supabase Auth
- Session is persisted across browser sessions (stay logged in)
- Admin-only routes are protected — accessing `/admin` without logging in redirects to the login page
- Session is auto-restored on app reload

---

## 10. Who Is This For?

PMS Pro is designed for:

### Small to Mid-Size Garment Manufacturers
Companies producing garments in-house or through a network of karigars, with order volumes ranging from tens to thousands of jobs per month.

### Businesses Currently Using:
- Paper registers → **PMS Pro replaces them completely**
- WhatsApp for job tracking → **PMS Pro provides structured, searchable records**
- Excel sheets → **PMS Pro is a live, real-time system with no manual updates**
- Multiple disconnected tools → **PMS Pro is one integrated system for everyone**

### Typical Team Roles That Benefit

| Role | How They Use PMS Pro |
|---|---|
| **Business Owner** | Views KPIs, analytics, and bottlenecks from the Admin Dashboard |
| **Production Manager** | Monitors the pipeline, checks late jobs, approves requirements |
| **Sales/Planning Team** | Raises new requirements (Step 1) |
| **Cutting Person** | Logs cutting entries (Step 3) |
| **Dispatch Manager** | Logs naame to karigar (Step 4) |
| **Store/Jama Person** | Logs goods received back (Step 5) |
| **Accounts/Admin** | Handles settlements (Step 6) |

---

## 11. Key Business Benefits

### ✅ Zero Lost Jobs
Every production requirement is digitally recorded from Day 1. Nothing can "fall through the cracks" of a paper register.

### ✅ Instant Visibility
The business owner or production manager can check the status of any job — at any time, from their phone — without calling anyone.

### ✅ Accountability at Every Step
Every step records *who* performed it and *when*. No more "I didn't know it was my turn."

### ✅ Proactive Delay Alerts
The system flags jobs that are taking too long *before* they become a crisis. Managers can intervene early rather than chasing jobs after the delivery date has passed.

### ✅ Accurate Piece Count Tracking
Multi-size piece counts are tracked from cutting through jama to settlement. Discrepancies are immediately visible (balance quantity shown on every job).

### ✅ Karigar Performance Tracking
The admin dashboard shows exactly how many pieces each karigar handles and how well they meet their lead times. This enables informed decisions about who to give more work to.

### ✅ Cutting Hisab Made Simple
The Cutting Reports module eliminates the manual effort of calculating cutting bills. Enter rates once, download a professional PDF.

### ✅ Scales with Your Business
Whether you have 10 active jobs or 1,000, PMS Pro handles it equally well. The database and real-time infrastructure are built on enterprise-grade cloud technology.

### ✅ No Hardware Required
Any smartphone with a browser can use PMS Pro. No dedicated terminals, no expensive hardware investments.

### ✅ Data Always Backed Up
All data lives in a cloud database — safe from the risks of a laptop being lost, a file being corrupted, or a hard drive failing.

---

## 12. Technical Specifications

| Specification | Detail |
|---|---|
| **Platform** | Progressive Web App (PWA) — runs in browser, no app store install required |
| **Supported Devices** | Mobile (Android/iPhone), Tablet, Desktop — any device with a modern browser |
| **Frontend** | React 18, Vite build toolchain, TailwindCSS |
| **Backend / Database** | Supabase (PostgreSQL) — managed cloud database |
| **State Management** | TanStack Query (server state) + Zustand (UI state) |
| **Real-time** | Supabase Realtime (WebSocket-based live subscriptions) |
| **Authentication** | Supabase Auth (email/password, session persistence) |
| **PDF Generation** | jsPDF + jspdf-autotable (client-side PDF, no server required) |
| **Charts** | Recharts (area, bar, pie charts) |
| **Deployment** | Netlify CDN (global edge network) |
| **Google Sheets Integration** | Google Sheets API v4 |
| **Working Hours Engine** | Custom working-hours calculator (Mon–Sat, 10 AM–7 PM) |
| **Data Export** | CSV export of all jobs directly from Admin Dashboard |
| **Offline Support** | Partial — app loads from cache; form submissions require internet |

---

## 13. Frequently Asked Questions

**Q: Do my team members need to create accounts?**  
A: No. General users can access all production forms and views without any login. Only the Admin Dashboard requires a password-protected login.

**Q: What happens if someone makes a wrong entry?**  
A: The Admin has access to a "System Modifications" tool that allows searching for any job and correcting any field directly. A confirmation popup on every form also helps prevent accidental entries.

**Q: Can multiple people use the system at the same time?**  
A: Yes. PMS Pro is fully multi-user. Real-time sync ensures that when one person submits a form, everyone else's screen updates automatically.

**Q: What if I want to keep using Google Sheets?**  
A: PMS Pro supports two-way sync with Google Sheets. You can pull data from Sheets into the app, or push all app data back to Sheets at any time.

**Q: Can I add new item names or karigar names myself?**  
A: Yes. The Admin can manage all dropdown lists (item catalog, prog. by names, cutting persons, and thekedar names) directly from the Admin Dashboard — no developer needed.

**Q: Is the data secure?**  
A: Yes. All data is stored in Supabase's cloud-hosted PostgreSQL database with industry-standard security. Admin access requires email/password authentication.

**Q: Does it work on a basic Android phone?**  
A: Yes. PMS Pro is designed to be fast and usable on any modern smartphone browser (Chrome, Safari, Firefox). No app download required.

**Q: Can I export all my data?**  
A: Yes. The Admin Dashboard includes a one-click CSV export of all job records, and a Google Sheets push feature for a full data copy.

**Q: What is the working hours calculation used for?**  
A: The system tracks how long a job has been stuck at its current step using *working hours only* (Monday–Saturday, 10 AM–7 PM). This means weekends and after-hours time are excluded, giving an accurate picture of actual production delays.

**Q: Can the system handle multiple item sizes per job?**  
A: Yes. PMS Pro fully supports multi-size orders. When raising a requirement, you can specify different quantities for different sizes (e.g., S×50, M×80, L×40). This breakdown is carried through cutting, naame, and jama entries.

---

*PMS Pro — Built for the garment floor. Designed for clarity, speed, and accountability.*

---

**Document Version:** 1.0  
**Last Updated:** April 2026
