const fs = require('fs');
let content = fs.readFileSync('public/workflow/app.js', 'utf8');

// 1. Add IDs to kpiData
content = content.replace(
  "{ t: 'Total AUM',",
  "{ id: 'aum', t: 'Total AUM',"
).replace(
  "{ t: 'Disbursement',",
  "{ id: 'disb', t: 'Disbursement',"
).replace(
  "{ t: 'Sanctioned',",
  "{ id: 'sanction', t: 'Sanctioned',"
).replace(
  "{ t: 'Active Customers',",
  "{ id: 'customers', t: 'Active Customers',"
).replace(
  "{ t: 'Approval Ratio',",
  "{ id: 'approval', t: 'Approval Ratio',"
).replace(
  "{ t: 'Collection Efficiency',",
  "{ id: 'collection', t: 'Collection Efficiency',"
).replace(
  "{ t: 'Portfolio at Risk',",
  "{ id: 'par', t: 'Portfolio at Risk',"
).replace(
  "{ t: 'NPA',",
  "{ id: 'npa', t: 'NPA',"
);

// 2. Add dataset attribute to ceo-kpi-card
content = content.replace(
  '<div class="ceo-kpi-card" onclick="window.openCeoKpiModal()"',
  '<div class="ceo-kpi-card" data-kpi="" onclick="window.openCeoKpiModal()"'
);

fs.writeFileSync('public/workflow/app.js', content);
