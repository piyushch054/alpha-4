# Roadmap — Sidebar modules end-to-end (demo mode)

Rule: CEO dashboard matches the user's latest two-part reference; preserve every other workflow and existing demo data. Report after each module.

## Current request
- [x] Match CEO dashboard to the two-part reference, restore visible charts, and make KPI/chart/summary details clickable.
  - Verified all 8 KPI and 12 section dialogs, mobile layout, CRM sidebar navigation and refresh; no browser page errors.

## Modules (sidebar order)
- [ ] M1 My Work & Approvals — dashboard, lobby, taskSla, approvals, sendBack, hierarchy
- [ ] M2 Origination — crm, newApplication, msmeFlow, applications, customer360, preEligibility, kycDedupe, documents
- [ ] M3 Credit & Decisioning — bankingAA, bureau, financials, credit, cam, creditEngine, rcu, underwriting, technical, legal
- [ ] M4 Sanction & Operations — sanction, pddCollateral, disbursement, postSanction, repayments, dealMovement, operations
- [ ] M5 Partners & Platform — partners, integrationHub, configStudio, platformArchitecture, workflowControl
- [ ] M6 People & HRMS — hrms, employeeProfile, projectTasks
- [ ] M7 Assets & Administration — assetInventory, travelManagement, cctvMonitoring, adminManagement
- [ ] M8 Governance & Reports — auditManagement, auditCompliance, complianceManagement, reports

## Per-module checks
- Page opens without console errors and shows real content
- List toolkit (search/filter/sort/pagination/export) present where a list exists
- Role rules: CEO read-only; no dead buttons

## Done
- [x] List toolkit on all 25 table pages + 7 card-list pages (search/filter/sort/pagination 10-200/export CSV-Excel-PDF-Print)
- [x] Role fix: toolkit role detection (BSO export blocked, CEO read-only)
- [x] Loan flow: Initiate to BDM creates 3 BDM tasks in My Tasks; IMD Maker locked until all 3 completed
- [x] Session fix: demo sign-in remembered across modules, refresh and deep links; sign-out clears it; login returns to the requested page; "no permission" page instead of login; BDM can open MSME Journey → IMD Maker; lead status + IMD lock survive refresh
