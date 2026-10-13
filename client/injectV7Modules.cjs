const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

content = content.replace(
  'dash.querySelectorAll(\'.nf-kpi-card, .nf-exec-kpi\').forEach(kpi => {',
  'dash.querySelectorAll(\'.nf-kpi-card, .nf-exec-kpi, .v7-module-card\').forEach(kpi => { kpi.classList.add(\'ws-hidden\');\n'
);
content = content.replace(
  'if (match && match[1] && !allowedViews.has(match[1])) kpi.style.display = \'none\';',
  'if (match && match[1] && !allowedViews.has(match[1])) { kpi.style.display = \'none\'; kpi.classList.add(\'ws-hidden\'); } else { kpi.classList.remove(\'ws-hidden\'); }'
);

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
