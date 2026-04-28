<p align="center">
  <img src="public/ketan_logo.png" alt="Ketan Logo" width="280" />
</p>

<h1 align="center">Ketan — Production Management System</h1>

<p align="center">
  <strong>End-to-end garment production tracking — from requirement to settlement.</strong>
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-12+-4f46e5?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Features" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" /></a>
  <a href="#-deployment"><img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Netlify" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-Ready-FF6B6B?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Realtime-WebSocket-FF9900?style=flat-square&logo=socketdotio&logoColor=white" alt="Realtime" />
  <img src="https://img.shields.io/badge/i18n-EN%20%7C%20HI-9B59B6?style=flat-square&logo=googletranslate&logoColor=white" alt="i18n" />
  <img src="https://img.shields.io/badge/Mobile_First-Responsive-2ECC71?style=flat-square&logo=android&logoColor=white" alt="Mobile First" />
  <img src="https://img.shields.io/badge/License-Private-E74C3C?style=flat-square" alt="License" />
</p>

---

## 🎯 What is Ketan?

**Ketan** (formerly PMS Pro) is a **cloud-based, mobile-first Progressive Web App** built for garment manufacturing businesses. It digitizes the entire production lifecycle — replacing paper registers, WhatsApp chaos, and disconnected Excel sheets with a single, real-time system.

> *Ketan tells you **exactly** where every job is, who has it, and whether it's on time — at any moment, from any device.*

<br/>

## ❓ The Problem

| Stage | Traditional Method | Problem |
|:------|:-------------------|:--------|
| New Requirement | Written in registers | Easily lost or forgotten |
| Fabric Approval | Phone calls & WhatsApp | Confusion, no audit trail |
| Cutting | Manual tallies | Inaccurate piece counts |
| Dispatch to Karigar | No dispatch log | Zero lead-time tracking |
| Goods Collection | Manual reconciliation | Quantity disputes |
| Settlement | Paper-based accounting | Delays, loss of pieces |

**Result:** Lost jobs, delivery delays, disputes, and zero bottleneck visibility.

**Ketan solves all of this.**

<br/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Live Dashboard
- Real-time job tracking with instant search
- Date range, step, and status filters
- "Aaj Ke Naame" — daily dispatch log
- Interactive analytics charts
- Pull-to-refresh on mobile

</td>
<td width="50%">

### 📝 Smart Production Forms
- 6-step guided data entry
- Color-coded step selector
- 3-level cascading item catalog
- Multi-size quantity support
- Confirmation popup before submission

</td>
</tr>
<tr>
<td width="50%">

### ✂️ Cutting Reports
- Pending/Completed cutting job views
- Quick cutting entry from report
- **Hisab PDF Generator** — auto-calculated bills
- Per-person productivity tracking

</td>
<td width="50%">

### 🏭 Production Pipeline
- Visual pipeline-by-stage overview
- Thekedar workload insights
- Category-based filtering
- Late job indicators with pulse animation

</td>
</tr>
<tr>
<td width="50%">

### 📈 Admin Analytics Dashboard
- 10+ interactive chart sections
- Executive KPI bar
- GitHub-style activity heatmap
- Bottleneck jobs table
- Raw data explorer + CSV export

</td>
<td width="50%">

### ⚡ Smart Delay Detection
- Working-hours-aware SLA engine
- Mon–Sat, 10 AM–7 PM calculation
- Auto-flags late jobs per step
- Planned vs. actual date comparison

</td>
</tr>
<tr>
<td width="50%">

### 🔄 Google Sheets Sync
- Bi-directional push/pull
- Legacy data migration support
- One-click from Dashboard

</td>
<td width="50%">

### 🌐 Internationalization (i18n)
- Full English & Hindi support
- Instant language switching
- Bilingual production-floor ready

</td>
</tr>
</table>

### Additional Modules

| Module | Description |
|:-------|:------------|
| 🔐 **Admin Auth** | Supabase Auth with session persistence, protected routes |
| 📦 **Bilty FMS** | Logistics & transit document tracking with photo upload |
| 🛒 **Purchase FMS** | Procurement pipeline — Requirement → Order → GI → Follow-Up |
| ⚙️ **Master Data** | Admin-managed dropdowns — personnel, catalog, thekedars |

<br/>

## 🔄 The 6-Step Production Pipeline

Every job follows a deterministic state machine through the production lifecycle:

```mermaid
flowchart LR
    S1["📋 Step 1\nNew Requirement"]
    S2{"🔍 Step 2\nProduction\nApproval"}
    S3["✂️ Step 3\nInhouse Cutting"]
    S4["📦 Step 4\nNaame\n(Dispatch)"]
    S5["📥 Step 5\nJama\n(Collection)"]
    S6["💰 Step 6\nSettle"]
    DONE["✅ Done"]
    REJ["❌ Rejected"]

    S1 --> S2
    S2 -- "Approved + Inhouse" --> S3
    S2 -- "Approved + External" --> S4
    S2 -- "Rejected" --> REJ
    S3 --> S4
    S4 --> S5
    S5 --> S6
    S6 -- "Balance = 0" --> DONE

    style S1 fill:#6366f1,color:#fff,stroke:none
    style S2 fill:#3b82f6,color:#fff,stroke:none
    style S3 fill:#f97316,color:#fff,stroke:none
    style S4 fill:#a855f7,color:#fff,stroke:none
    style S5 fill:#22c55e,color:#fff,stroke:none
    style S6 fill:#6b7280,color:#fff,stroke:none
    style DONE fill:#10b981,color:#fff,stroke:none
    style REJ fill:#ef4444,color:#fff,stroke:none
```

> **Smart Routing:** Step 3 is conditional — if cutting is done externally by the thekedar, the job skips directly from Step 2 → Step 4.

<br/>

## ⏱️ Delay Detection Engine

The built-in time intelligence engine calculates delays using **working hours only**, excluding non-business time:

```
📅 Working Days:  Monday – Saturday
🕙 Working Hours: 10:00 AM – 7:00 PM (9 hrs/day)
🚫 Sundays:       Completely excluded
```

| Step | Stage | Max Allowed Time |
|:----:|:------|:-----------------|
| 2 | Pending Approval | 27 hrs ≈ 3 working days |
| 3 | Pending Cutting | 18 hrs ≈ 2 working days |
| 4 | Pending Naame | 18 hrs ≈ 2 working days |
| 5 | Pending Jama | 126 hrs ≈ 14 working days |
| 6 | Pending Settle | 27 hrs ≈ 3 working days |

**Status Indicators:** 🟡 On Track &nbsp;·&nbsp; 🔴 Late &nbsp;·&nbsp; 🟢 Complete

<br/>

## 🛠️ Tech Stack

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend"]
        React["React 18"]
        Vite["Vite"]
        TW["TailwindCSS"]
        RR["React Router v6"]
        RQ["TanStack React Query"]
        Zustand["Zustand"]
        Recharts["Recharts"]
        jsPDF["jsPDF + AutoTable"]
    end

    subgraph Backend["☁️ Backend"]
        Supabase["Supabase"]
        PG["PostgreSQL"]
        Auth["Supabase Auth"]
        RT["Realtime (WebSocket)"]
    end

    subgraph Infra["🌍 Infrastructure"]
        Netlify["Netlify CDN"]
        GSheets["Google Sheets API"]
    end

    React --> Supabase
    React --> Recharts
    React --> jsPDF
    Supabase --> PG
    Supabase --> Auth
    Supabase --> RT
    Netlify --> React
    GSheets --> Supabase

    style Frontend fill:#1e1b4b,color:#c7d2fe,stroke:#6366f1
    style Backend fill:#052e16,color:#bbf7d0,stroke:#22c55e
    style Infra fill:#1c1917,color:#fed7aa,stroke:#f97316
```

| Layer | Technology |
|:------|:-----------|
| **UI Framework** | React 18 with SWC compiler |
| **Build Tool** | Vite |
| **Styling** | TailwindCSS 3.x |
| **Routing** | React Router v6 |
| **Server State** | TanStack React Query v5 |
| **UI State** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) |
| **Real-time** | Supabase Realtime (WebSocket) |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Image Crop** | react-easy-crop |
| **Deployment** | Netlify CDN |
| **Data Sync** | Google Sheets API v4 |

<br/>

## 📁 Project Structure

```
pmspms/
├── public/
│   ├── ketan_logo.png          # Brand logo
│   ├── manifest.json           # PWA manifest
│   └── _redirects              # Netlify SPA routing
│
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # App shell + bottom nav
│   │   ├── JobCard.jsx         # Job card with timeline
│   │   ├── StepBadge.jsx       # Color-coded step indicator
│   │   ├── SplashScreen.jsx    # Animated brand intro
│   │   ├── AnalyticsHub.jsx    # Dashboard chart widgets
│   │   ├── Toast.jsx           # Notification system
│   │   ├── Skeleton.jsx        # Loading placeholders
│   │   ├── AdminRoute.jsx      # Auth-protected route wrapper
│   │   ├── LanguageSwitcher.jsx # EN/HI toggle
│   │   └── fms/                # FMS sub-components
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx       # Live job dashboard (34KB)
│   │   ├── Forms.jsx           # 6-step production forms (49KB)
│   │   ├── CuttingReports.jsx  # Cutting tracking + Hisab
│   │   ├── ProductionReport.jsx # Pipeline & thekedar views
│   │   ├── Reports.jsx         # Reports hub
│   │   ├── FMS.jsx             # Flow Management System
│   │   ├── AdminDashboard.jsx  # Analytics command center (86KB)
│   │   ├── AdminLogin.jsx      # Secure admin login
│   │   └── fms/                # Bilty & Purchase FMS pages
│   │
│   ├── hooks/
│   │   ├── useJobs.js          # Job data fetching & mutations
│   │   ├── useJobsRealtime.js  # WebSocket subscription
│   │   ├── useMasterData.js    # Admin config data
│   │   ├── usePullToRefresh.js # Mobile pull-to-refresh
│   │   ├── useBiltyFMS.js      # Logistics data hook
│   │   └── usePurchaseFMS.js   # Procurement data hook
│   │
│   ├── store/
│   │   ├── useAuthStore.js     # Auth state (Zustand)
│   │   └── useUIStore.js       # UI state (Zustand)
│   │
│   ├── utils/
│   │   ├── workingHours.js     # ⭐ Working hours time engine
│   │   ├── jobLogic.js         # Step detection & status
│   │   ├── db.js               # Supabase CRUD operations
│   │   ├── sync.js             # Google Sheets sync engine
│   │   ├── sheets.js           # Sheets API integration
│   │   ├── constants.js        # Step labels, people, mappings
│   │   ├── supabase.js         # Supabase client init
│   │   └── helpers.js          # General utilities
│   │
│   ├── i18n/
│   │   ├── translations.js     # EN + HI translations (800+ keys)
│   │   └── LanguageContext.jsx  # Language provider
│   │
│   ├── lib/
│   │   └── queryClient.js      # React Query configuration
│   │
│   ├── App.jsx                 # Root routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
│
├── index.html                  # HTML entry with PWA meta
├── vite.config.js              # Vite + SWC configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS pipeline
├── netlify.toml                # Deployment configuration
└── package.json                # Dependencies & scripts
```

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Supabase** project (with the `jobs` table configured)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pmspms.git
cd pmspms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Development

```bash
# Start the dev server
npm run dev

# Lint the codebase
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

<br/>

## 🌐 Deployment

Ketan is deployed on **Netlify** with the following configuration:

| Setting | Value |
|:--------|:------|
| Build Command | `npm run build` |
| Publish Directory | `dist` |
| SPA Redirects | `/* → /index.html` (200) |

Simply connect your GitHub repo to Netlify — deploys happen automatically on push.

<br/>

## 🗺️ Sitemap

```mermaid
graph TD
    subgraph Public["👥 Public Routes"]
        HOME["/ — Dashboard"]
        FORMS["/forms — Production Forms"]
        REPORTS["/reports — Reports Hub"]
        FMS["/fms — Flow Management"]
    end

    subgraph Admin["🔐 Admin Routes"]
        LOGIN["/admin/login"]
        ADMIN["/admin — Analytics Dashboard"]
    end

    subgraph ReportModules["📊 Report Modules"]
        CUTTING["Cutting Reports"]
        PIPELINE["Production Pipeline"]
        BILTY["Bilty FMS"]
        PURCHASE["Purchase FMS"]
    end

    HOME --> FORMS
    HOME --> REPORTS
    HOME --> FMS
    REPORTS --> CUTTING
    REPORTS --> PIPELINE
    REPORTS --> BILTY
    REPORTS --> PURCHASE
    LOGIN --> ADMIN

    style Public fill:#1e1b4b,color:#c7d2fe,stroke:#6366f1
    style Admin fill:#450a0a,color:#fecaca,stroke:#ef4444
    style ReportModules fill:#052e16,color:#bbf7d0,stroke:#22c55e
```

<br/>

## 👥 User Roles

| Role | Access Level |
|:-----|:-------------|
| **Production Team** | View jobs, fill step forms, view reports — *no login required* |
| **Admin** | Everything above + Analytics, Raw Data, CSV Export, Master Data, Data Correction — *password protected* |

<br/>

## 🏭 Who Is This For?

<table>
<tr><td>👔</td><td><strong>Business Owner</strong></td><td>KPIs, analytics, bottleneck visibility from the Admin Dashboard</td></tr>
<tr><td>🏗️</td><td><strong>Production Manager</strong></td><td>Pipeline monitoring, late job alerts, production approvals</td></tr>
<tr><td>📋</td><td><strong>Sales / Planning</strong></td><td>Raise new requirements (Step 1)</td></tr>
<tr><td>✂️</td><td><strong>Cutting Person</strong></td><td>Log cutting entries (Step 3), generate Hisab PDF</td></tr>
<tr><td>📦</td><td><strong>Dispatch Manager</strong></td><td>Log naame to karigar (Step 4)</td></tr>
<tr><td>📥</td><td><strong>Store / Jama Person</strong></td><td>Log goods received back (Step 5)</td></tr>
<tr><td>💰</td><td><strong>Accounts</strong></td><td>Handle settlements (Step 6)</td></tr>
</table>

<br/>

## 💎 Key Business Benefits

| Benefit | Impact |
|:--------|:-------|
| 🚫 Zero Lost Jobs | Every requirement digitally recorded from Day 1 |
| 👁️ Instant Visibility | Check any job's status from your phone — no calls needed |
| 📌 Accountability | Every step records *who* did it and *when* |
| ⏰ Proactive Alerts | Flags delayed jobs *before* they become critical |
| 📏 Accurate Piece Tracking | Multi-size counts from cutting through settlement |
| 📊 Karigar Performance | Data-driven decisions on work allocation |
| 📄 Hisab PDF | Auto-calculated cutting bills, downloadable instantly |
| ☁️ Always Backed Up | Cloud database — no hardware risk |
| 📱 No Hardware Needed | Works on any smartphone browser |
| 📈 Scales Infinitely | 10 jobs or 10,000 — same speed, same reliability |

<br/>

## 🔧 Real-Time Architecture

```mermaid
sequenceDiagram
    participant User A as 👤 User A (Mobile)
    participant App as ⚛️ React App
    participant RQ as 🔄 React Query
    participant WS as 🔌 WebSocket
    participant DB as 🗄️ Supabase (PostgreSQL)
    participant User B as 👤 User B (Desktop)

    User A->>App: Submits Step 4 Form
    App->>DB: INSERT/UPDATE via Supabase Client
    DB-->>WS: Broadcasts change event
    WS-->>RQ: Invalidates query cache
    RQ-->>App: Auto-refetches fresh data
    App-->>User A: UI updates instantly
    WS-->>User B: Receives broadcast
    Note over User B: Screen auto-updates<br/>without manual refresh
```

<br/>

## 📜 Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server (Vite HMR) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the codebase |

<br/>

## 🤝 Contributing

This is a private project. If you've been granted access:

1. **Fork** the repo
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

<br/>

## 📄 License

This project is **private and proprietary**. All rights reserved.

<br/>

---

<p align="center">
  <sub>Built with ❤️ for the garment manufacturing floor.</sub>
  <br/>
  <sub>Designed for clarity, speed, and accountability.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made_in-India_🇮🇳-FF9933?style=flat-square" alt="Made in India" />
  <img src="https://img.shields.io/badge/Version-1.0-4f46e5?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/April-2026-22c55e?style=flat-square" alt="Date" />
</p>
