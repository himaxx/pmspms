
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** pms-pro
- **Date:** 2026-05-01
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Create a requirement with multi-size quantities and confirm it appears on the dashboard
- **Test Code:** [TC001_Create_a_requirement_with_multi_size_quantities_and_confirm_it_appears_on_the_dashboard.py](./TC001_Create_a_requirement_with_multi_size_quantities_and_confirm_it_appears_on_the_dashboard.py)
- **Test Error:** TEST BLOCKED

The feature cannot be reached because the local web server did not respond, so the form workflow cannot be tested.

Observations:
- Navigating to http://localhost:5173/forms displayed a browser error: "localhost didn't send any data." (ERR_EMPTY_RESPONSE).
- The page contains only a 'Reload' button and no application UI elements to interact with.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/f0684635-f38d-479c-bcfb-36578d011e39
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Approve a pending job with inhouse cutting routes it to Step 3
- **Test Code:** [TC002_Approve_a_pending_job_with_inhouse_cutting_routes_it_to_Step_3.py](./TC002_Approve_a_pending_job_with_inhouse_cutting_routes_it_to_Step_3.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the application server is not responding, so the forms UI and step workflow are inaccessible.

Observations:
- The page shows 'This page isn't working' and 'ERR_EMPTY_RESPONSE'.
- The only interactive element available is a 'Reload' button; the forms interface and step selector are not present.
- No form fields or job lists could be accessed to perform the supervisor approval workflow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/2dcf34d8-5e49-4320-8e1e-eb0019c99eed
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Approve a pending job with external cutting skips Step 3 and routes to Step 4
- **Test Code:** [TC003_Approve_a_pending_job_with_external_cutting_skips_Step_3_and_routes_to_Step_4.py](./TC003_Approve_a_pending_job_with_external_cutting_skips_Step_3_and_routes_to_Step_4.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the application server is not responding, so the workflow UI cannot be accessed and the test cannot proceed.

Observations:
- The browser shows 'ERR_EMPTY_RESPONSE' and the page message 'localhost didn't send any data.'
- Clicking the Reload button did not recover the app; the same error page remains.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/9991e7c0-3367-41dd-9d9f-c9f0622944f2
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Record cutting quantities for a pending inhouse cutting job
- **Test Code:** [TC004_Record_cutting_quantities_for_a_pending_inhouse_cutting_job.py](./TC004_Record_cutting_quantities_for_a_pending_inhouse_cutting_job.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached because the web application server did not respond. The UI never loaded, so the end-to-end workflow cannot be executed.

Observations:
- The browser shows an error page with message 'localhost didn\'t send any data.' and 'ERR_EMPTY_RESPONSE'.
- Only a 'Reload' button is present; no application UI or interactive controls are available.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/20e9eb02-bdbf-4488-8e4f-6a045dac8fe8
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Filter and inspect a job from the live dashboard
- **Test Code:** [TC005_Filter_and_inspect_a_job_from_the_live_dashboard.py](./TC005_Filter_and_inspect_a_job_from_the_live_dashboard.py)
- **Test Error:** TEST BLOCKED

The application did not render — the SPA remains blank and no UI elements are available to test.

Observations:
- The page is blank with 0 interactive elements after navigation and waits
- Multiple waits (3s then 5s) did not cause the SPA to load

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/98dd16b5-e502-41ee-9d04-f486c2409088
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 View pipeline grouped by stage and inspect a job timeline
- **Test Code:** [TC006_View_pipeline_grouped_by_stage_and_inspect_a_job_timeline.py](./TC006_View_pipeline_grouped_by_stage_and_inspect_a_job_timeline.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the web application at http://localhost:5173 is not responding, so the pipeline view cannot be tested.

Observations:
- The browser shows ERR_EMPTY_RESPONSE and the page displays "This page isn’t working".
- Reload and repeated navigation attempts did not recover the SPA.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/5610b0cb-f10c-4a31-ae1e-b8311f666486
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Inspect late job delay hours and step history from dashboard
- **Test Code:** [TC007_Inspect_late_job_delay_hours_and_step_history_from_dashboard.py](./TC007_Inspect_late_job_delay_hours_and_step_history_from_dashboard.py)
- **Test Error:** TEST BLOCKED

The dashboard app could not be reached on localhost, so the test could not run.

Observations:
- The browser shows an error page: 'This page isn’t working' and 'ERR_EMPTY_RESPONSE'.
- Only a 'Reload' button is available and clicking it did not load the app; the error persisted.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/d3a4ba75-ae7b-4e60-b99f-bb5983cf3b06
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Enter cutting for a pending job in reports and see it move to completed
- **Test Code:** [TC008_Enter_cutting_for_a_pending_job_in_reports_and_see_it_move_to_completed.py](./TC008_Enter_cutting_for_a_pending_job_in_reports_and_see_it_move_to_completed.py)
- **Test Error:** TEST BLOCKED

The reports page could not be reached — the local server returned no response.

Observations:
- Navigating to /reports showed a browser error page: "This page isn’t working" and ERR_EMPTY_RESPONSE.
- The page displays only a 'Reload' button and no application UI elements, so the Reports feature cannot be tested.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/c34df8a4-c6ff-478c-acbc-6c78b7c8d0d0
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Edit a job in Raw Data Explorer and see it reflected on Dashboard and Forms
- **Test Code:** [TC009_Edit_a_job_in_Raw_Data_Explorer_and_see_it_reflected_on_Dashboard_and_Forms.py](./TC009_Edit_a_job_in_Raw_Data_Explorer_and_see_it_reflected_on_Dashboard_and_Forms.py)
- **Test Error:** TEST BLOCKED

The web application could not be reached — the local server is not responding, so the test cannot run.

Observations:
- The browser page shows 'This page isn’t working' with error ERR_EMPTY_RESPONSE.
- The page has no app UI rendered (no login form or admin UI); only a Reload button is visible.
- All remaining test steps require the application to be available and cannot proceed while the server returns no data.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/8cd98b51-6cf9-4b7e-b815-989bae495920
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Set Step 4 lead time and see planned Jama date update
- **Test Code:** [TC010_Set_Step_4_lead_time_and_see_planned_Jama_date_update.py](./TC010_Set_Step_4_lead_time_and_see_planned_Jama_date_update.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the web application at localhost:5173 is not responding, so the test cannot run.

Observations:
- Navigating to http://localhost:5173/forms shows a browser error page with 'ERR_EMPTY_RESPONSE'.
- The page contains only the browser Reload button and no application UI or interactive elements.
- Clicking Reload multiple times did not restore the application.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/1fa39cb4-c75c-4307-9ea6-bdcf00d7de3f
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Generate and download a Hisab PDF with calculated totals
- **Test Code:** [TC011_Generate_and_download_a_Hisab_PDF_with_calculated_totals.py](./TC011_Generate_and_download_a_Hisab_PDF_with_calculated_totals.py)
- **Test Error:** TEST BLOCKED

The reports feature could not be tested because the local web server did not respond.

Observations:
- Navigating to http://localhost:5173/reports returned ERR_EMPTY_RESPONSE.
- The page shows 'This page isn’t working' with only a 'Reload' button and no application UI.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/3feea07d-aa00-46b3-b371-b9c432d3d9bb
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Filter pipeline jobs by thekedar in Thekedar Insights
- **Test Code:** [TC012_Filter_pipeline_jobs_by_thekedar_in_Thekedar_Insights.py](./TC012_Filter_pipeline_jobs_by_thekedar_in_Thekedar_Insights.py)
- **Test Error:** TEST BLOCKED

The application could not be reached — the local server did not respond, so the pipeline UI cannot be tested.

Observations:
- The page shows "This page isn’t working" with error ERR_EMPTY_RESPONSE.
- The browser only displays a Reload button and there are no visible application controls to access Pipeline view or Thekedar Insights.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/a4707866-99df-424b-a1bd-6d5cad3d8d21
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Pull from Google Sheets updates the live job list
- **Test Code:** [TC013_Pull_from_Google_Sheets_updates_the_live_job_list.py](./TC013_Pull_from_Google_Sheets_updates_the_live_job_list.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached because the local webapp is not responding.

Observations:
- The browser shows an error page: 'localhost didn’t send any data.' with ERR_EMPTY_RESPONSE.
- The page only shows a Reload button and no dashboard UI or controls to trigger a Sheets pull.
- Clicking Reload did not recover the application.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/02cf401a-2fc4-471c-a6e8-e2fbd1f92a91
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Create and submit a Purchase entry and see it in the Purchase log
- **Test Code:** [TC014_Create_and_submit_a_Purchase_entry_and_see_it_in_the_Purchase_log.py](./TC014_Create_and_submit_a_Purchase_entry_and_see_it_in_the_Purchase_log.py)
- **Test Error:** TEST BLOCKED

The FMS application on localhost is not responding, so the procurement workflow cannot be tested.

Observations:
- The browser shows 'This page isn\'t working' with ERR_EMPTY_RESPONSE.
- Navigation to http://localhost:5173 and http://localhost:5173/fms failed to load the app.
- Only a Reload button is available and reloading did not restore the application.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/6d1c8f1f-0d17-487b-90c9-4c3b20631e8a
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Filter dashboard to only late jobs
- **Test Code:** [TC015_Filter_dashboard_to_only_late_jobs.py](./TC015_Filter_dashboard_to_only_late_jobs.py)
- **Test Error:** TEST BLOCKED

The dashboard could not be reached because the local server did not respond.

Observations:
- The page showed 'ERR_EMPTY_RESPONSE' with message 'localhost didn’t send any data.'
- Navigating to /dashboard failed because the site is unavailable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/bd3ea444-87a1-44f7-8cd7-c706e92040fe
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Filter pipeline by category
- **Test Code:** [TC016_Filter_pipeline_by_category.py](./TC016_Filter_pipeline_by_category.py)
- **Test Error:** TEST BLOCKED

The dashboard cannot be reached so the filter functionality cannot be tested.

Observations:
- The browser shows an "ERR_EMPTY_RESPONSE" error for http://localhost:5173.
- The page displays a generic "This page isn't working / localhost didn't send any data." message with only a Reload button.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/398ff432-cf4a-46bc-8e86-782ef198d854
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Late indicator consistency between dashboard card and job detail
- **Test Code:** [TC017_Late_indicator_consistency_between_dashboard_card_and_job_detail.py](./TC017_Late_indicator_consistency_between_dashboard_card_and_job_detail.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the web app server on localhost:5173 is not responding.

Observations:
- The browser shows 'This page isn’t working' with ERR_EMPTY_RESPONSE
- The page contains only a Reload button and no application UI, so the dashboard and filters are inaccessible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/e5bcf942-98f9-4cd1-9c1f-c88a425a2f77
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Create and submit a Bilty entry and see it in today’s dispatch records
- **Test Code:** [TC018_Create_and_submit_a_Bilty_entry_and_see_it_in_todays_dispatch_records.py](./TC018_Create_and_submit_a_Bilty_entry_and_see_it_in_todays_dispatch_records.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the localhost server did not respond, so the bilty entry workflow could not be tested.

Observations:
- The browser shows 'ERR_EMPTY_RESPONSE' and the message 'localhost didn’t send any data.'
- The page contains only a single 'Reload' button and no application UI or interactive elements.
- Navigating to / and /fms and clicking Reload did not load the SPA, so the dispatch/bilty UI cannot be accessed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/06761339-dddf-4df1-8a46-ea7aaa393da5
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Admin login grants access to admin dashboard analytics
- **Test Code:** [TC019_Admin_login_grants_access_to_admin_dashboard_analytics.py](./TC019_Admin_login_grants_access_to_admin_dashboard_analytics.py)
- **Test Error:** TEST BLOCKED

The admin login page could not be reached because the local web server is not responding.

Observations:
- The browser shows an ERR_EMPTY_RESPONSE page stating 'localhost didn’t send any data.'
- Direct navigation to http://localhost:5173/admin/login failed (no response from server).
- The page shows a Reload button; clicking reload did not restore the app (server still not responding).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/230c88e8-5c9b-4a0d-bae2-a0eb1243347d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Update Order2Delivery tracking and see status updated in the module
- **Test Code:** [TC020_Update_Order2Delivery_tracking_and_see_status_updated_in_the_module.py](./TC020_Update_Order2Delivery_tracking_and_see_status_updated_in_the_module.py)
- **Test Error:** TEST BLOCKED

The Order2Delivery feature could not be reached because the local application is not responding.

Observations:
- Visiting http://localhost:5173 showed the SPA root but no rendered UI (0 interactive elements).
- Visiting http://localhost:5173/fms returned an error page: 'This page isn’t working' and ERR_EMPTY_RESPONSE.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/3a06d896-d0e5-4118-9fda-0fcbcf4bdafc
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Push to Google Sheets shows export confirmation
- **Test Code:** [TC021_Push_to_Google_Sheets_shows_export_confirmation.py](./TC021_Push_to_Google_Sheets_shows_export_confirmation.py)
- **Test Error:** TEST BLOCKED

The feature cannot be reached because the application server is not responding.

Observations:
- The browser shows ERR_EMPTY_RESPONSE and no interactive UI is present besides a 'Reload' button.
- Navigations to / and /login returned no data and the dashboard could not be loaded, so the export control cannot be exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/5bb7078a-be7c-4205-ac26-cb05f1b70e83
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Master data changes in Admin become available immediately in Forms catalog dropdowns
- **Test Code:** [TC022_Master_data_changes_in_Admin_become_available_immediately_in_Forms_catalog_dropdowns.py](./TC022_Master_data_changes_in_Admin_become_available_immediately_in_Forms_catalog_dropdowns.py)
- **Test Error:** TEST BLOCKED

The feature cannot be reached because the application running on localhost is not responding.

Observations:
- Navigating to http://localhost:5173/admin/login returned ERR_EMPTY_RESPONSE (localhost didn’t send any data).
- The page only shows a Reload button and the application UI never loaded, so the admin workflows cannot be exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/ad505906-a257-4f8b-9f21-6cb6e41e386f
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Clear Late filter returns mixed status results
- **Test Code:** [TC023_Clear_Late_filter_returns_mixed_status_results.py](./TC023_Clear_Late_filter_returns_mixed_status_results.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached because the web application did not render and no interactive elements are available, preventing the test from running.

Observations:
- The page is blank with 0 interactive elements after navigating to http://localhost:5173.
- Waiting (3s and then 5s) did not cause the SPA to load or render any UI.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/b7e74950-824a-4d74-b438-7635b8d188f1
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Prevent Hisab PDF generation with a negative per-piece rate
- **Test Code:** [TC024_Prevent_Hisab_PDF_generation_with_a_negative_per_piece_rate.py](./TC024_Prevent_Hisab_PDF_generation_with_a_negative_per_piece_rate.py)
- **Test Error:** TEST BLOCKED

The Reports/Hisab feature could not be reached because the local web app did not respond.

Observations:
- The /reports page returned an error page showing 'ERR_EMPTY_RESPONSE' and the message 'localhost didn’t send any data.'
- Only a 'Reload' button is present; the application UI (including the Hisab tab) did not load, so the validation steps cannot be executed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/83a70368-4e57-4f6d-8aee-d199f17001d2
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Block Step form submission when a required field is missing
- **Test Code:** [TC025_Block_Step_form_submission_when_a_required_field_is_missing.py](./TC025_Block_Step_form_submission_when_a_required_field_is_missing.py)
- **Test Error:** TEST BLOCKED

The forms page could not be reached — the local site did not respond so the form could not be tested.

Observations:
- Navigating to /forms showed a browser error: ERR_EMPTY_RESPONSE.
- The page displays "This page isn’t working" and only a Reload button; there are no form inputs or buttons to interact with.
- No interactive form elements were available, so required-field validation could not be exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/7925bd12-a5a7-4d58-ac90-db840f161caa
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Validate dashboard date range rejects start date after end date
- **Test Code:** [TC026_Validate_dashboard_date_range_rejects_start_date_after_end_date.py](./TC026_Validate_dashboard_date_range_rejects_start_date_after_end_date.py)
- **Test Error:** TEST BLOCKED

The dashboard page could not be reached because the single-page app did not render; the date-range controls are not accessible.

Observations:
- The page is blank and shows 0 interactive elements.
- The screenshot is a white/empty page with no UI visible.
- I retried loading and waited but the UI did not load, so the test cannot proceed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/62b25b91-bfdb-4860-af31-54da391b13a9/5319271f-6639-4b12-aea7-ad33ef55a546
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---