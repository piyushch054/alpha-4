const fs = require('fs');
let content = fs.readFileSync('public/workflow/app.js', 'utf8');

// Fix the empty data-kpi and the empty onclick index
content = content.replace(
  /data-kpi="" onclick="window\.openCeoKpiModal\(\)"/g,
  'data-kpi="\\" onclick="window.openCeoKpiModal(\\)"'
);

fs.writeFileSync('public/workflow/app.js', content);
