const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

content = content.replace(
  "kpi.classList.remove('ws-hidden');",
  "kpi.classList.remove('ws-hidden'); kpi.style.display = '';"
);

content = content.replace(
  "kpi.classList.remove('ws-hidden'); }",
  "kpi.classList.remove('ws-hidden'); kpi.style.display = ''; }"
);

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
