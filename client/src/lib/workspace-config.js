export const workspaceConfig = {
  "Dashboard": {
    name: "Dashboard",
    icon: "?", colorClass: "c1", desc: "Executive view and landing pages.",
    submodules: [
      { id: "dashboard", name: "Dashboard", charts: [], kpis: [] },
      { id: "lobby", name: "My Lobby", charts: [], kpis: [] },
      { id: "tasks", name: "My Tasks", charts: [], kpis: [] },
      { id: "caseDocs", name: "Case Docs & Audit Trail", charts: [], kpis: [] }
    ]
  },
  "Cases View": {
    name: "Cases View",
    icon: "?", colorClass: "c2", desc: "Case queues and oversight.",
    submodules: [
      { id: "casesView", name: "Cases View", charts: [], kpis: [] },
      { id: "viewOnly", name: "View only — separate from Approvals", charts: [], kpis: [] },
      { id: "approvals", name: "Approvals", charts: ["riskWatch"], kpis: ["approval", "deviations"] },
      { id: "sendBack", name: "Send Back Cases", charts: [], kpis: [] },
      { id: "hierarchy", name: "Hierarchy Monitor", charts: [], kpis: [] },
      { id: "employeePerformance", name: "Employee Performance", charts: [], kpis: [] }
    ]
  },
  "Origination": {
    name: "Origination",
    icon: "?", colorClass: "c3", desc: "CRM, LOS, KYC & Customer Journey.",
    submodules: [
      { id: "leads", name: "CRM & Leads", charts: ["leadFunnel"], kpis: ["conversion", "login"] },
      { id: "newApplication", name: "LOS Application", charts: ["productMix", "stageFunnel", "departmentHealth", "branch"], kpis: [] },
      { id: "bdmWork", name: "BDM Lead Work", charts: [], kpis: [] },
      { id: "imd", name: "IMD & BSA Verification", charts: [], kpis: [] },
      { id: "imdConfig", name: "IMD Fee Configuration", charts: [], kpis: [] },
      { id: "journeyTwoWheeler", name: "Two Wheeler Journey", charts: [], kpis: [] },
      { id: "journeyMSME", name: "MSME Product Journey", charts: [], kpis: [] },
      { id: "journeySolar", name: "Solar Loan Product Journey", charts: [], kpis: [] },
      { id: "journeyLAP", name: "LAP Product Journey", charts: [], kpis: [] },
      { id: "journeyTractor", name: "Tractor Loan Product Journey", charts: [], kpis: [] },
      { id: "msmeFlow", name: "MSME Journey", charts: [], kpis: [] },
      { id: "applications", name: "Applications", charts: [], kpis: ["aum"] },
      { id: "customer360", name: "Customer 360", charts: [], kpis: ["customers"] },
      { id: "preEligibility", name: "Pre-Eligibility", charts: [], kpis: [] },
      { id: "kycDedupe", name: "KYC & Dedupe", charts: [], kpis: [] },
      { id: "documents", name: "Documents", charts: [], kpis: [] }
    ]
  },
  "Credit & Decisioning": {
    name: "Credit & Decisioning",
    icon: "?", colorClass: "c4", desc: "Credit underwriting and risk analysis.",
    submodules: [
      { id: "banking", name: "Banking & AA", charts: [], kpis: [] },
      { id: "bureau", name: "Credit Bureau", charts: [], kpis: [] },
      { id: "financials", name: "Financial Analysis", charts: [], kpis: [] },
      { id: "credit", name: "Credit Queue", charts: [], kpis: [] },
      { id: "cam", name: "CAM", charts: [], kpis: [] },
      { id: "creditEngine", name: "Credit Engine / BRE", charts: [], kpis: [] },
      { id: "rcu", name: "RCU / Fraud", charts: [], kpis: [] },
      { id: "underwriting", name: "Underwriting", charts: [], kpis: [] },
      { id: "technical", name: "Technical Verification", charts: [], kpis: [] },
      { id: "legal", name: "Legal Vetting", charts: [], kpis: [] },
      { id: "sanction", name: "Sanction", charts: [], kpis: ["sanction"] }
    ]
  },
  "Loan Operations / LMS": {
    name: "Loan Operations / LMS",
    icon: "?", colorClass: "c5", desc: "Disbursement, post-sanction, loan servicing and accounting.",
    submodules: [
      { id: "postSanction", name: "Post Sanction Operations", charts: [], kpis: [] },
      { id: "disbursement", name: "Disbursement", charts: ["disbursementTrend", "disbursement"], kpis: ["disb"] },
      { id: "repayments", name: "Repayments", charts: ["collectionTrend", "portfolioHealth"], kpis: ["collection", "par", "npa"] },
      { id: "dealMovement", name: "Deal Movement / LMS", charts: [], kpis: [] },
      { id: "loanAccounts", name: "Loan Accounts", charts: [], kpis: [] },
      { id: "pddCollateral", name: "PDD & Collateral", charts: [], kpis: [] },
      { id: "partners", name: "Partner Network", charts: [], kpis: [] }
    ]
  },
  "General Ledger": {
    name: "General Ledger",
    icon: "?", colorClass: "c4", desc: "Accounts & Finance: accounting, vouchers, reports and bank reconciliation.",
    submodules: [
      { id: "generalLedger", name: "General Ledger", charts: [], kpis: [] }
    ]
  },
  "People & Work": {
    name: "People & Work",
    icon: "??", colorClass: "c7", desc: "HR, Employees and Projects.",
    submodules: [
      { id: "employeeProfile", name: "Employee 360 Profile", charts: [], kpis: ["employees"] },
      { id: "hrms", name: "HRMS", charts: [], kpis: [] },
      { id: "projectTasks", name: "Projects & Tasks", charts: [], kpis: ["tasks"] }
    ]
  },
  "Assets & Admin": {
    name: "Assets & Admin",
    icon: "?", colorClass: "c8", desc: "IT assets, admin and CCTV.",
    submodules: [
      { id: "assetInventory", name: "IT & Non-IT Assets", charts: [], kpis: [] },
      { id: "adminManagement", name: "Admin Management", charts: [], kpis: [] },
      { id: "cctvMonitoring", name: "CCTV Monitoring", charts: [], kpis: [] },
      { id: "travelManagement", name: "Travel Management", charts: [], kpis: [] }
    ]
  },
  "Governance": {
    name: "Governance",
    icon: "?", colorClass: "c9", desc: "Audit, compliance and control log.",
    submodules: [
      { id: "auditManagement", name: "Audit Management", charts: [], kpis: [] },
      { id: "complianceManagement", name: "Compliance Management", charts: [], kpis: [] },
      { id: "auditCompliance", name: "Consent & Control Log", charts: [], kpis: [] },
      { id: "workflowControl", name: "Workflow & Access", charts: [], kpis: [] }
    ]
  },
  "Insights & Platform": {
    name: "Insights & Platform",
    icon: "?", colorClass: "c12", desc: "Reports and platform config.",
    submodules: [
      { id: "reports", name: "Reports & MIS", charts: [], kpis: [] },
      { id: "configStudio", name: "Configuration Studio", charts: [], kpis: [] },
      { id: "integrationHub", name: "Integration Hub", charts: [], kpis: [] },
      { id: "platformArchitecture", name: "Platform Architecture", charts: [], kpis: [] }
    ]
  }
};

export const workspaceConfigScript = '<script>window.NAMDEV_WORKSPACE_CONFIG = ' + JSON.stringify(workspaceConfig) + ';</script>';
