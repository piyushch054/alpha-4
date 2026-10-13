const fs = require('fs');
let content = fs.readFileSync('public/workflow/app.js', 'utf8');

// The first part (kpiData ids) DID work correctly? Let me check.
if (content.includes("data-kpi=")) {
  console.log("Already has data-kpi!");
} else {
  content = content.replace(
    /<div class="ceo-kpi-card" onclick="window\.openCeoKpiModal\(\$\{i\}\)"/g,
    '<div class="ceo-kpi-card" data-kpi="" onclick="window.openCeoKpiModal()"'
  );
  fs.writeFileSync('public/workflow/app.js', content);
  console.log("Patched ceo-kpi-card!");
}
