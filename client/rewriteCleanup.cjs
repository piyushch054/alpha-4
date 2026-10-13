const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

// I will just replace the entire Clean Dashboard section!
const oldDashSectionStart = "// 2. Clean Dashboard";
const oldDashSectionEnd = "// Handle empty dashboard state";

const startIdx = content.indexOf(oldDashSectionStart);
const endIdx = content.indexOf(oldDashSectionEnd);

const newSection = `// 2. Clean Dashboard
          // The dashboard root could be .nf-ceo-dashboard OR .ceo-root
          const dash = document.querySelector('.nf-ceo-dashboard') || document.querySelector('.ceo-root') || document.querySelector('#content');
          if (!dash) return;
          
          if (dash.dataset.workspaceCleaned === 'true') return;
          dash.dataset.workspaceCleaned = 'true';

          // Clean V7 standard KPIs (if they exist)
          dash.querySelectorAll('.nf-kpi-card, .nf-exec-kpi, .v7-module-card').forEach(kpi => { 
            kpi.classList.add('ws-hidden');
            const oc = kpi.getAttribute('onclick') || '';
            const match = oc.match(/navTo\\('([^']+)'\\)/);
            if (match && match[1] && !allowedViews.has(match[1])) { 
              kpi.style.display = 'none'; 
              kpi.classList.add('ws-hidden'); 
            } else if (match) { 
              kpi.classList.remove('ws-hidden'); 
            }
          });

          // Clean CEO Modal KPIs (.ceo-kpi-card)
          dash.querySelectorAll('.ceo-kpi-card').forEach(kpi => {
            const kId = kpi.dataset.kpi;
            if (kId && !allowedKpis.has(kId)) {
              kpi.style.display = 'none';
              kpi.classList.add('ws-hidden');
            } else {
              kpi.classList.remove('ws-hidden');
            }
          });

          dash.querySelectorAll('.nf-command-mini button, .ceo-alert, .nf-campaign-overlay button').forEach(btn => {
            const oc = btn.getAttribute('onclick') || '';
            const match = oc.match(/navTo\\('([^']+)'\\)/);
            const route = (match && match[1] === 'crm') ? 'leads' : (match ? match[1] : null);
            if (route && !allowedViews.has(route)) btn.style.display = 'none';
          });        

          dash.querySelectorAll('.ceo-panel').forEach(panel => {
            const title = panel.querySelector('.ceo-panel-head span')?.textContent;
            if ((title === 'PRODUCT MIX' || title === 'BUSINESS MOMENTUM') && !allowedCharts.has('productMix')) panel.style.display = 'none';
            if ((title === 'JOURNEY FUNNEL' || title === 'CONVERSION HEALTH') && !allowedCharts.has('stageFunnel')) panel.style.display = 'none';
            if ((title === 'BRANCH PERFORMANCE' || title === 'NETWORK PERFORMANCE') && !allowedCharts.has('branch')) panel.style.display = 'none';
            if (title === 'DEPARTMENT HEALTH' && !allowedCharts.has('departmentHealth')) panel.style.display = 'none';
            if ((title === 'RISK & EXCEPTIONS' || title === 'CEO DECISION CENTER') && !allowedCharts.has('riskWatch')) panel.style.display = 'none';
            if (title === 'EXECUTIVE CASE WATCH' && allowedViews.size < 3) panel.style.display = 'none';
          });
          
          `;

content = content.substring(0, startIdx) + newSection + content.substring(endIdx);
fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
