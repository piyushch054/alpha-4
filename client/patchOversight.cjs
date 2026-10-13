const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

const kpiHideLogic = 
          dash.querySelectorAll('.ceo-kpi-card').forEach(kpi => {
            const kpiId = kpi.dataset.kpi;
            if (kpiId && !allowedKpis.has(kpiId)) {
              kpi.style.display = 'none';
              kpi.classList.add('ws-hidden');
            }
          });
;

// Insert the new logic before handling empty dashboard state
content = content.replace(
  '// Handle empty dashboard state',
  kpiHideLogic + '\n          // Handle empty dashboard state'
);

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
