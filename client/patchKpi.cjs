const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

const replacement = `
          // Filter top KPIs
          dash.querySelectorAll('.nf-exec-kpi').forEach(kpi => {
            const labelSpan = kpi.querySelector('span');
            if (labelSpan) {
              const text = labelSpan.textContent.trim().replace(/ (This Month|This Week|Today)$/i, '').trim();
              const map = {
                'Total AUM': 'aum',
                'Disbursement': 'disb',
                'Sanctioned': 'sanction',
                'Active Customers': 'customers',
                'Approval Ratio': 'approval',
                'Collection Efficiency': 'collection',
                'Portfolio at Risk': 'par',
                'NPA': 'npa'
              };
              const kpiId = map[text];
              if (kpiId && !allowedKpis.has(kpiId)) {
                kpi.classList.add('ws-hidden');
              } else {
                kpi.classList.remove('ws-hidden');
              }
            }
          });
`;

content = content.replace(
  "dash.querySelectorAll('.nf-kpi-card, .nf-exec-kpi, .v7-module-card').forEach(kpi => {",
  replacement + "\n          dash.querySelectorAll('.nf-kpi-card, .v7-module-card').forEach(kpi => {"
);

// We should also ensure empty state uses .nf-exec-kpi correctly!
content = content.replace(
  "const visibleKpis = Array.from(dash.querySelectorAll('.nf-kpi-card')).filter(k => k.style.display !== 'none');",
  "const visibleKpis = Array.from(dash.querySelectorAll('.nf-exec-kpi')).filter(k => !k.classList.contains('ws-hidden'));"
);
content = content.replace(
  "const visiblePanels = Array.from(dash.querySelectorAll('.ceo-panel')).filter(p => p.style.display !== 'none');",
  "const visiblePanels = Array.from(dash.querySelectorAll('.ceo-panel')).filter(p => p.style.display !== 'none' && !p.classList.contains('ws-hidden'));"
);

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
