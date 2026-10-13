












export const initialApplications = [
{
  id: "NF-2601041",
  name: "Shiva Solar Solutions",
  product: "Solar",
  amount: 45,
  region: "Rajasthan",
  stage: "Underwriting",
  score: 748,
  docs: 92,
  owner: "Priya Sharma",
  age: "14h 22m"
},
{
  id: "NF-2601042",
  name: "Rahul Enterprises",
  product: "MSME",
  amount: 12.5,
  region: "Gujarat",
  stage: "Tech/Legal",
  score: 721,
  docs: 78,
  owner: "Amit Patel",
  age: "1d 4h"
},
{
  id: "NF-2601043",
  name: "Mehta Logistics",
  product: "LAP",
  amount: 120,
  region: "Rajasthan",
  stage: "CAM Approval",
  score: 792,
  docs: 100,
  owner: "Neha Jain",
  age: "6h 10m"
},
{
  id: "NF-2601044",
  name: "Vikram Singh",
  product: "Two Wheeler",
  amount: 1.2,
  region: "Madhya Pradesh",
  stage: "Disbursement",
  score: 765,
  docs: 100,
  owner: "Rahul Verma",
  age: "2h 35m"
},
{
  id: "NF-2601045",
  name: "Ganesh Agro Traders",
  product: "MSME",
  amount: 28,
  region: "Rajasthan",
  stage: "Leads",
  score: 682,
  docs: 45,
  owner: "Priya Sharma",
  age: "4h 18m"
},
{
  id: "NF-2601046",
  name: "Sunrise Green Energy",
  product: "Solar",
  amount: 18.5,
  region: "Gujarat",
  stage: "Disbursement",
  score: 781,
  docs: 100,
  owner: "Amit Patel",
  age: "3h 12m"
},
{
  id: "NF-2601047",
  name: "Mahesh Kumar",
  product: "LAP",
  amount: 65,
  region: "Madhya Pradesh",
  stage: "Tech/Legal",
  score: 701,
  docs: 82,
  owner: "Neha Jain",
  age: "2d 8h"
},
{
  id: "NF-2601048",
  name: "Kavita Textiles",
  product: "MSME",
  amount: 32,
  region: "Gujarat",
  stage: "Underwriting",
  score: 739,
  docs: 88,
  owner: "Rahul Verma",
  age: "18h 40m"
},
{
  id: "NF-2601049",
  name: "Rajesh Choudhary",
  product: "Two Wheeler",
  amount: 1.45,
  region: "Rajasthan",
  stage: "Leads",
  score: 714,
  docs: 60,
  owner: "Priya Sharma",
  age: "1h 15m"
},
{
  id: "NF-2601050",
  name: "Om Industrial Works",
  product: "MSME",
  amount: 42,
  region: "Madhya Pradesh",
  stage: "CAM Approval",
  score: 756,
  docs: 96,
  owner: "Amit Patel",
  age: "9h 30m"
},
{
  id: "NF-2601051",
  name: "Jain Property Holdings",
  product: "LAP",
  amount: 85,
  region: "Gujarat",
  stage: "Underwriting",
  score: 773,
  docs: 91,
  owner: "Neha Jain",
  age: "11h 20m"
},
{
  id: "NF-2601052",
  name: "Aarav Solar Systems",
  product: "Solar",
  amount: 24,
  region: "Rajasthan",
  stage: "Leads",
  score: 732,
  docs: 55,
  owner: "Rahul Verma",
  age: "5h 45m"
}];

// Synthetic examples are generated deterministically and remain session-only.
const demoFirst = [
"Aarav",
"Riya",
"Vikram",
"Meena",
"Rohit",
"Kavita",
"Manish",
"Pooja",
"Nitin",
"Priya",
"Sanjay",
"Anita",
"Deepak",
"Sunita",
"Rajesh",
"Neelam",
"Arjun",
"Divya",
"Karan",
"Aditi",
"Mohit",
"Sneha",
"Rakesh",
"Ritika",
"Aman",
"Komal",
"Gaurav",
"Shweta",
"Harish",
"Nisha",
"Ajay",
"Suman"];

const demoLast = [
"Sharma",
"Jain",
"Singh",
"Meena",
"Rathore",
"Patel",
"Joshi",
"Gupta",
"Verma",
"Saini",
"Choudhary",
"Pareek",
"Yadav",
"Mehta",
"Saxena",
"Bansal",
"Kapoor",
"Malhotra",
"Soni",
"Agarwal",
"Rao",
"Trivedi",
"Mishra",
"Bhatia",
"Seth",
"Vyas",
"Solanki",
"Goyal",
"Dubey",
"Tiwari",
"Kumar",
"Shekhawat"];

for (let i = initialApplications.length; i < 1000; i++) {
  const product =

  [
  "MSME",
  "MSME",
  "MSME",
  "Tractor",
  "LAP",
  "LAP",
  "LAP",
  "Solar",
  "Two Wheeler",
  "Two Wheeler"][

  i % 10] ?? "MSME";
  initialApplications.push({
    id: `DEMO-NF-${200000 + i}`,
    name: `${demoFirst[i % 32]} ${demoLast[Math.floor(i / 32) % 32]}`,
    product,
    amount:
    product === "Two Wheeler" ?
    +(0.65 + i * 971 % 155000 / 100000).toFixed(2) :
    product === "LAP" ?
    +(15 + i * 17003 % 8500000 / 100000).toFixed(2) :
    product === "Solar" ?
    +(1.8 + i * 3011 % 1520000 / 100000).toFixed(2) :
    product === "Tractor" ?
    +(4 + i * 2203 % 900000 / 100000).toFixed(2) :
    +(3 + i * 7127 % 4700000 / 100000).toFixed(2),
    region: ["Rajasthan", "Gujarat", "Madhya Pradesh"][i % 3] ?? "Rajasthan",
    stage:
    ["Leads", "Underwriting", "Tech/Legal", "CAM Approval", "Disbursement"][i % 5] ?? "Leads",
    score: 620 + i * 17 % 211,
    docs: i % 5 === 4 ? 100 : 45 + i * 7 % 55,
    owner: ["Neha Jain", "Kavita Rao", "Mohit Meena", "Rahul Saini"][i % 4] ?? "Neha Jain",
    age: `${1 + i % 9}d ${i % 24}h`
  });
}
export const productStats = [
{
  product: "MSME",
  label: "MSME Lending",
  share: 38,
  aum: 320.15,
  loans: 4743,
  par: 1.12,
  tone: "brand"
},
{
  product: "LAP",
  label: "Loan Against Property",
  share: 28,
  aum: 235.9,
  loans: 3495,
  par: 0.73,
  tone: "blue"
},
{
  product: "Solar",
  label: "Solar & Renewable",
  share: 14,
  aum: 117.95,
  loans: 1747,
  par: 0.42,
  tone: "green"
},
{
  product: "Tractor",
  label: "Tractor & Farm Equipment",
  share: 10,
  aum: 84.25,
  loans: 1180,
  par: 0.58,
  tone: "brand"
},
{
  product: "Two Wheeler",
  label: "Two Wheeler",
  share: 10,
  aum: 84.25,
  loans: 1248,
  par: 0.36,
  tone: "neutral"
}];

export const stages = ["Leads", "Underwriting", "Tech/Legal", "CAM Approval", "Disbursement"];
export const stageStats = [412, 86, 34, 19, 52];
export const monthlyTrend = [
{ month: "Apr", disbursed: 31.2, collected: 28.6 },
{ month: "May", disbursed: 36.4, collected: 33.8 },
{ month: "Jun", disbursed: 33.8, collected: 35.2 },
{ month: "Jul", disbursed: 42.1, collected: 38.6 },
{ month: "Aug", disbursed: 39.6, collected: 41.2 },
{ month: "Sep", disbursed: 48.2, collected: 46.8 }];

export const branches = [
{
  name: "Jaipur Central",
  region: "Rajasthan",
  aum: 182.4,
  disbursed: 12.8,
  collection: 99.1,
  par: 0.62,
  cases: 142
},
{
  name: "Ahmedabad",
  region: "Gujarat",
  aum: 156.2,
  disbursed: 9.6,
  collection: 98.8,
  par: 0.78,
  cases: 126
},
{
  name: "Indore",
  region: "Madhya Pradesh",
  aum: 124.5,
  disbursed: 7.4,
  collection: 97.6,
  par: 1.18,
  cases: 98
},
{
  name: "Jodhpur",
  region: "Rajasthan",
  aum: 118.6,
  disbursed: 6.2,
  collection: 98.4,
  par: 0.71,
  cases: 84
},
{
  name: "Surat",
  region: "Gujarat",
  aum: 142.3,
  disbursed: 7.8,
  collection: 98.6,
  par: 0.83,
  cases: 91
},
{
  name: "Bhopal",
  region: "Madhya Pradesh",
  aum: 118.5,
  disbursed: 4.4,
  collection: 96.2,
  par: 1.42,
  cases: 62
}];

export const workspaces = [
{
  group: "Lending",
  items: [
  ["crm", "CRM & Leads"],
  ["newApplication", "New Application"],
  ["bdmWork", "BDM Lead Work"],
  ["imd", "IMD & BSA Verification"],
  ["journeyTwoWheeler", "Two Wheeler Journey"],
  ["journeyMSME", "MSME Product Journey"],
  ["journeySolar", "Solar Loan Product Journey"],
  ["journeyLAP", "LAP Product Journey"],
  ["journeyTractor", "Tractor Loan Product Journey"],
  ["msmeFlow", "MSME Journey"],
  ["applications", "Applications"],
  ["customer360", "Customer 360"],
  ["preEligibility", "Pre-Eligibility"],
  ["kycDedupe", "KYC & Dedupe"],
  ["documents", "Documents"]]

},
{
  group: "Credit & Decisioning",
  items: [
  ["credit", "Credit Queue"],
  ["cam", "CAM Sheet"],
  ["bankingAA", "Banking & AA"],
  ["bureau", "Credit Bureau"],
  ["financials", "Financial Analysis"],
  ["creditEngine", "Credit Engine / BRE"],
  ["rcu", "RCU & Fraud"],
  ["underwriting", "Underwriting"],
  ["approvals", "Deviation Approvals"]]

},
{
  group: "Operations & Servicing",
  items: [
  ["technical", "Technical Verification"],
  ["legal", "Legal Vetting"],
  ["sanction", "Sanction"],
  ["postSanction", "Post Sanction"],
  ["operations", "Operations"],
  ["disbursement", "Disbursement"],
  ["repayments", "Repayments"],
  ["dealMovement", "Deal Movement / LMS"],
  ["loanAccounts", "Loan Accounts"],
  ["generalLedger", "General Ledger"],
  ["imdConfig", "IMD Configuration"],
  ["taskSla", "Tasks & SLA"],
  ["sendBack", "Send Back"],
  ["pddCollateral", "PDD & Collateral"],
  ["partners", "Partner Network"]]

},
{
  group: "Corporate",
  items: [
  ["employeeProfile", "Employee 360"],
  ["hrms", "HRMS"],
  ["projectTasks", "Projects & Tasks"],
  ["assetInventory", "Asset Management"],
  ["adminManagement", "Admin Management"],
  ["cctvMonitoring", "CCTV Monitoring"],
  ["travelManagement", "Travel Management"],
  ["auditManagement", "Audit Management"],
  ["complianceManagement", "Compliance"],
  ["auditCompliance", "Audit & Consent"]]

},
{
  group: "Insights & Platform",
  items: [
  ["lobby", "My Lobby"],
  ["hierarchy", "Hierarchy Monitor"],
  ["workflowControl", "Workflow & Access"],
  ["reports", "Reports & MIS"],
  ["configStudio", "Configuration Studio"],
  ["integrationHub", "Integration Hub"],
  ["platformArchitecture", "Platform Architecture"]]

}];