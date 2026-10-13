const fs = require('fs');
let content = fs.readFileSync('public/workflow/app.js', 'utf8');
content = content.replace(
  'data-kpi="" onclick="window.openCeoKpiModal()"',
  'data-kpi="${k.id}" onclick="window.openCeoKpiModal(${i})"'
);
fs.writeFileSync('public/workflow/app.js', content);
