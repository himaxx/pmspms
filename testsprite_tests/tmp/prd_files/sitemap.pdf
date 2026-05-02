# Production Management System (PMS) — Sitemap

This document outlines the complete navigational structure and page hierarchy for both Standard (Worker) and Admin users.

## 👥 Standard User Sitemap (Worker/Staff)

The standard user interface is designed for mobile-first operational use, focusing on data entry and real-time production tracking.

### 🏠 Main Navigation
- **Dashboard (`/`)**
    - Overview of daily activities.
    - Quick access to active production metrics.
- **Production Forms (`/forms`)**
    - Multi-step job lifecycle entry system.
    - **Step 1: New Requirement (नई आवश्यकता)** — Create new job requests.
    - **Step 2: Production Approval (प्रोडक्शन अप्रूवल)** — Approve or reject fabric/job for production.
    - **Step 3: Inhouse Cutting (इनहाउस कटिंग)** — Log actual cutting pieces from the dukan/house.
    - **Step 4: Naame (नामे — On Production)** — Assign jobs to Thekedars and set lead times.
    - **Step 5: Finished Maal Jama (माल जमा)** — Log completed production pieces received back.
    - **Step 6: Settle (सेटल)** — Finalize job accounting and close the cycle.
- **Cutting Reports (`/cutting`)**
    - **Pending Tab** — Jobs currently awaiting cutting logs.
    - **Completed Tab** — Historical record of cutting logs (last 10 days by default).
    - **Hisab Tab** — Accounting interface to calculate cutting payments (with PDF export).
- **Production Report (`/production`)**
    - **Pipeline By Stage** — Visual summary of where jobs are stuck (Approval, Cutting, Naame, Production, Jama).
    - **Thekedar Insights** — Active jobs grouped by assigned Thekedar.
    - **Detailed View** — Expandable bottom sheet for specific jobs in each category.

---

## 🔐 Admin User Sitemap (Management)

The Admin interface provides high-level analytics, data integrity tools, and system configuration.

### 🚪 Authentication
- **Admin Login (`/admin/login`)** — Secure entry for administrative functions.

### 📊 Admin Dashboard (`/admin`)
A comprehensive, dark-themed analytics command center divided into specialized modules:

1.  **Executive KPI Bar** — Real-time snapshots of Total Jobs, Active Jobs, Monthly Completion, and Average Delays.
2.  **Production Volume Trend** — 12-week area chart comparing New Requirements vs. Completed Jobs.
3.  **Live Pipeline Funnel** — Vertical bar chart showing the distribution of jobs across all 6 production steps.
4.  **Delay Analysis by Step** — Identification of bottlenecks by comparing average vs. maximum delay hours.
5.  **Thekedar Performance** — Ranking of Thekedars by active job load, piece volume, and average lead time.
6.  **Cutting Person Stats** — Donut and bar charts showing individual cutting productivity and weekly trends.
7.  **Item Group Distribution** — Pie chart and list view of production volume by garment category (e.g., T-Shirt, Lower).
8.  **Activity Heatmap** — 18-week grid visualizing daily production intensity (similar to GitHub contributions).
9.  **Bottleneck Jobs Table** — Focused list of the most delayed active jobs requiring management attention.
10. **Raw Data Explorer** — Full searchable database view with CSV export capability for all job records.
11. **Master Data Settings** — Interface to manage global system constants:
    - **Prog. By List** — Manage authorized personnel for New Requirements.
    - **Cutting Names** — Manage authorized cutting staff.
    - **Thekedar Names** — Manage the master list of production contractors.
    - **Catalog Management** — (Underlying JSON) Categories, Subcategories, and Item names.

---

## 🛠️ Internal Utility Components
- **Splash Screen** — Brand introduction and initial data sync.
- **Bottom Navigation** — Persistent menu for standard users.
- **Detail Sheets** — Mobile-optimized overlays for job inspections.
- **Toast Notifications** — Real-time feedback for form submissions and errors.

---
> [!NOTE]
> All standard user routes are accessible by default, while admin routes are protected by role-based authentication and restricted to authorized sessions.
