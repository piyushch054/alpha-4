const fs = require('fs');

const fullPort = `
// --- PORTED CEO DASHBOARD ---
const C = { blue: 'var(--ceo-blue)', red: 'var(--ceo-red)', green: 'var(--ceo-green)', amber: 'var(--ceo-amber)', violet: 'var(--ceo-violet)', teal: 'var(--ceo-teal)', grid: 'var(--ceo-line)', muted: 'var(--ceo-muted)' };
const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const _disb = _months.map((m, i) => ({ m, actual: 30 + i * 15.5, target: 40 + i * 17 }));
const _productMix = [
  { n: 'Two Wheeler', p: '22%', v: '₹ 275 Cr', c: '#1c4ed8', val: 22 }, { n: 'MSME', p: '29%', v: '₹ 362 Cr', c: '#b91c1c', val: 29 },
  { n: 'LAP', p: '25%', v: '₹ 312 Cr', c: '#6d28d9', val: 25 }, { n: 'Solar Loan', p: '10%', v: '₹ 225 Cr', c: '#d97706', val: 10 }, { n: 'Tractor Loan', p: '14%', v: '₹ 174 Cr', c: '#d97706', val: 14 },
];
const _quality = [
  { n: 'Standard', p: '94.2%', v: '₹ 1,175 Cr', c: '#0f766e', val: 94.2 }, { n: 'DPD 1-30', p: '3.1%', v: '₹ 39 Cr', c: '#1c4ed8', val: 3.1 },
  { n: 'DPD 31-60', p: '1.2%', v: '₹ 15 Cr', c: '#d97706', val: 1.2 }, { n: 'DPD 61-90', p: '0.8%', v: '₹ 10 Cr', c: '#b91c1c', val: 0.8 }, { n: 'NPA 90+', p: '0.7%', v: '₹ 9 Cr', c: '#b91c1c', val: 0.7 },
];
const _collection = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ m, due: [38, 42, 45, 40, 52, 50, 55][i], col: [36, 40, 43, 38, 50, 48, 53][i], eff: 92 + (i % 3) }));
const _tat = [{ d: '< 1 Day', v: 34 }, { d: '1-2 Days', v: 28 }, { d: '2-3 Days', v: 18 }, { d: '3-5 Days', v: 14 }, { d: '> 5 Days', v: 6 }];
const _grades = [{ n: 'A (34%)', v: 34, c: '#0f766e' }, { n: 'B (28%)', v: 28, c: '#1c4ed8' }, { n: 'C (18%)', v: 18, c: '#d97706' }, { n: 'D (12%)', v: 12, c: '#b91c1c' }, { n: 'E (8%)', v: 8, c: '#6d28d9' }];

function _lucide(name) { return \`<i data-lucide="\${name}"></i>\`; }
function _card(title, right, content, className="") {
  return \`
    <section class="ceo-card ceo-detail-card \${className}" style="cursor: default; display:flex; flex-direction:column;">
      <div class="ceo-card-head" style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0; font-weight:700; color:var(--ceo-ink)">\${title}</h2>
        \${right || ''}
      </div>
      <div style="flex:1; display:flex; flex-direction:column;">
        \${content}
      </div>
    </section>\`;
}

renderCEOPersonalizedDashboard = function() {
  if (!window.lucideLoading) {
    window.lucideLoading = true;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lucide@latest';
    s.onload = () => { if (window.lucide) window.lucide.createIcons(); };
    document.head.appendChild(s);
  }
  
  if (!window.apexChartsLoading) {
    window.apexChartsLoading = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
    s.onload = () => { 
      window.apexChartsLoaded = true; 
      setTimeout(() => renderCEOCharts(), 100); 
    };
    document.head.appendChild(s);
  }

  setPage("CEO Dashboard", "Executive / Dashboard");
  
  const kpis = [
    { t: 'Total AUM', v: '₹ 1,248 Cr', d: '12.5%', up: true, c: C.blue, i: 'indian-rupee', tone: 'blue', data: [1100, 1120, 1140, 1160, 1200, 1220, 1248] },
    { t: 'Disbursement', v: '₹ 186 Cr', d: '28.4%', up: true, c: C.red, i: 'receipt', tone: 'red', data: [140, 150, 145, 160, 175, 180, 186] },
    { t: 'Sanctioned', v: '₹ 214 Cr', d: '31.2%', up: true, c: C.green, i: 'badge-check', tone: 'teal', data: [160, 170, 165, 180, 195, 205, 214] },
    { t: 'Active Customers', v: '52,318', d: '8.2%', up: true, c: C.violet, i: 'users', tone: 'violet', data: [48000, 48500, 49200, 50100, 51000, 51800, 52318] },
    { t: 'Approval Ratio', v: '78.3%', d: '8.1%', up: true, c: C.green, i: 'percent', tone: 'teal', data: [70.2, 71.5, 72.8, 74.1, 75.5, 76.9, 78.3] },
    { t: 'Collection Efficiency', v: '96.4%', d: '4.1%', up: true, c: C.blue, i: 'gauge', tone: 'blue', data: [92.3, 93.1, 93.8, 94.5, 95.2, 95.8, 96.4] },
    { t: 'Portfolio at Risk', v: '2.6%', d: '0.8%', up: false, c: C.amber, i: 'alert-triangle', tone: 'amber', data: [3.4, 3.2, 3.1, 3.0, 2.9, 2.7, 2.6] },
    { t: 'NPA', v: '1.8%', d: '0.4%', up: false, c: C.red, i: 'shield-alert', tone: 'red', data: [2.2, 2.1, 2.0, 1.9, 1.9, 1.8, 1.8] },
  ];

  const html = \`
  <div class="ceo-root">
    <div class="ceo-main">
      <div class="ceo-content">
        
        <!-- HERO SECTION -->
        <div class="ceo-banner" style="position:relative; margin-bottom:12px; display:flex; flex-wrap:wrap; align-items:center; background: var(--ceo-blue-tint) url('/ceo-banner-bg.jpg') center/cover no-repeat; border-radius:8px; overflow:hidden; min-height: 125px;">
          <div style="flex:1 1 300px; padding:20px 30px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
               <img src="/favicon.png" style="width:24px; height:24px;" onerror="this.style.display='none'" />
               <b style="color:var(--ceo-blue); font-size:12px;">NAMDEV FINVEST</b>
            </div>
            <h1 style="font-size:24px; font-weight:700; margin:0 0 4px 0; color:var(--ceo-ink)">CEO Executive Command Center</h1>
            <p style="font-size:12px; margin:0; color:var(--ceo-muted)">Real-time view of lending, risk, collections and operational performance</p>
          </div>
          <div style="display:flex; align-items:center; gap:16px; padding:20px 30px; flex:0 0 auto;">
            <div style="text-align:right;">
              <b style="display:block; font-size:14px; color:var(--ceo-ink)">Jitendra Sharma</b>
              <span style="font-size:11px; color:var(--ceo-muted)">Managing Director & CEO</span>
              <q style="display:block; font-size:10px; font-style:italic; margin-top:4px; color:var(--ceo-blue)">"Driving growth through financial inclusion."</q>
            </div>
            <img src="/ceo-bust.png" style="height:80px; width:80px; object-fit:contain; border-radius:50%; background:white; border:2px solid var(--ceo-blue-soft)" onerror="this.style.display='none'" />
          </div>
        </div>

        <div class="ceo-filters" style="margin-bottom:12px;">
          <div class="ceo-seg" style="display:flex; background:var(--ceo-bg); border-radius:6px; overflow:hidden;">
            <button class="ceo-button on" style="flex:1; padding:4px 8px; font-size:10px; border:none; background:var(--ceo-blue); color:white;">FY 2026-27</button>
            <button class="ceo-button" style="flex:1; padding:4px 8px; font-size:10px; border:none; background:transparent;">Q3 2026</button>
            <button class="ceo-button" style="flex:1; padding:4px 8px; font-size:10px; border:none; background:transparent;">MTD</button>
          </div>
          <button class="ceo-select">All Products \${_lucide('chevron-down')}</button>
          <button class="ceo-select">All Regions \${_lucide('chevron-down')}</button>
          <button class="ceo-select">All States \${_lucide('chevron-down')}</button>
          <button class="ceo-select">All Branches \${_lucide('chevron-down')}</button>
          <button class="ceo-select">All Departments \${_lucide('chevron-down')}</button>
          <button class="ceo-select" style="margin-left:auto;">Compare With \${_lucide('chevron-down')}</button>
          <button class="ceo-select">Previous Month \${_lucide('chevron-down')}</button>
        </div>

        <div class="ceo-kpis" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:12px;">
          \${kpis.map((k,i) => \`
            <div class="ceo-kpi" style="background:white; border-radius:8px; padding:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05); border:1px solid var(--ceo-line); display:flex; flex-direction:column;">
              <div class="ceo-kpi-t" style="display:flex; align-items:center; gap:6px; color:var(--ceo-muted); font-size:10px; margin-bottom:8px;">
                 <span class="ceo-ic \${k.tone}" style="display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:4px;">\${_lucide(k.i)}</span>
                 <span style="font-weight:600;">\${k.t}</span>
              </div>
              <strong style="font-size:18px; color:var(--ceo-ink); margin-bottom:4px; font-weight:700;">\${k.v}</strong>
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
                 <small style="font-size:9px; color:\${k.up ? 'var(--ceo-green)' : 'var(--ceo-red)'}; display:flex; align-items:center; gap:2px; font-weight:600;">
                    \${k.up ? '↑' : '↓'} \${k.d}
                 </small>
                 <div id="spark\${i}" style="width:50px; height:24px;"></div>
              </div>
            </div>
          \`).join('')}
        </div>

        <div class="ceo-row r1" style="display:grid; grid-template-columns:1.68fr 1.1fr 1fr; gap:12px; margin-bottom:12px;">
          \${_card('Target vs Actual Disbursement', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
            <div class="ceo-stats sm" style="display:flex; gap:16px; margin-bottom:8px;">
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-ink);">₹ 186 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Actual</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-ink);">₹ 215 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Target</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-green);">86.5%</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Achievement</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-blue);">₹ 224 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Projected</span>
              </div>
            </div>
            <div id="chartTarget" style="flex:1; width:100%; min-height:180px;"></div>
            <div class="ceo-legend" style="display:flex; justify-content:center; gap:16px; font-size:10px; color:var(--ceo-muted); margin-top:4px;">
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; border-radius:50%; background:var(--ceo-blue);"></i>Actual</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-red);"></i>Target</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-blue); border-top:2px dashed var(--ceo-bg);"></i>Projection</span>
            </div>
          \`)}
          \${_card('Product Mix & Performance', '<div class="ceo-tabs"><button class="ceo-button on">AUM</button><button class="ceo-button">Disbursement</button><button class="ceo-button">Customers</button></div>', \`
            <div class="ceo-split" style="display:flex; align-items:center; gap:16px; flex:1;">
              <div id="chartMix" style="width:130px; height:130px; flex-shrink:0;"></div>
              <ul class="ceo-list" style="flex:1; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                \${_productMix.map(p => \`
                <li style="display:flex; align-items:center; gap:8px; font-size:10px;">
                  <i style="width:8px; height:8px; border-radius:50%; background: \${p.c}; flex-shrink:0;"></i>
                  <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${p.n}</span>
                  <b style="color:var(--ceo-ink);">\${p.p}</b>
                  <em style="color:var(--ceo-muted); font-style:normal; width:45px; text-align:right;">\${p.v}</em>
                </li>\`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Loan Conversion Funnel', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
            <div class="ceo-funnel" style="display:flex; flex-direction:column; gap:8px; flex:1; padding-top:8px;">
              \${[['Leads', 4820, '100%'], ['Login / Application', 3240, '66%'], ['Credit', 2850, '60.6%'], ['Sanction', 2210, '58.5%'], ['Disbursed', 1840, '55.5%']].map((f, i, arr) => \`
                <div class="ceo-funnel-step" style="position:relative;">
                  <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; padding-left:\${i*8}px;">
                    <span style="color:var(--ceo-ink); font-weight:500;">\${f[0]}</span>
                    <b style="color:var(--ceo-ink);">\${f[1].toLocaleString()} <span style="font-weight:normal; color:var(--ceo-muted); margin-left:4px;">(\${f[2]})</span></b>
                  </div>
                  <div style="height:14px; background:var(--ceo-line); border-radius:2px; margin-left:\${i*8}px; overflow:hidden;">
                    <div style="height:100%; width:\${f[1]/48.2}%; background:\${i===4 ? 'var(--ceo-green)' : 'var(--ceo-blue)'};"></div>
                  </div>
                </div>
              \`).join('')}
            </div>
            <div style="margin-top:12px; padding-top:8px; border-top:1px dashed var(--ceo-line); display:flex; justify-content:space-between; font-size:10px;">
               <span style="color:var(--ceo-muted);">Lead to Disbursal Conversion</span>
               <b style="color:var(--ceo-ink); font-size:12px;">13.0%</b>
            </div>
          \`)}
        </div>

        <div class="ceo-row r2" style="display:grid; grid-template-columns:1.55fr 1.1fr 1fr; gap:12px; margin-bottom:12px;">
          \${_card('Branch Performance <i data-lucide="chevron-down" style="width:12px; height:12px; color:var(--ceo-muted); margin-left:4px; vertical-align:middle;"></i>', '<div class="ceo-pill">View All</div>', \`
            <div class="ceo-tabs" style="display:flex; gap:4px; margin-bottom:12px;"><button class="ceo-button on">Top Branches</button><button class="ceo-button">Top Regions</button><button class="ceo-button">Top Zones</button></div>
            <table style="width:100%; font-size:10px; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid var(--ceo-line); color:var(--ceo-muted);">
                  <th style="padding:4px; font-weight:500;">#</th>
                  <th style="padding:4px; font-weight:500;">Branch</th>
                  <th style="padding:4px; font-weight:500;">Target</th>
                  <th style="padding:4px; font-weight:500;">Disbursement</th>
                  <th style="padding:4px; font-weight:500;">Achievement</th>
                  <th style="padding:4px; font-weight:500;">Growth</th>
                  <th style="padding:4px; font-weight:500;">Collection</th>
                </tr>
              </thead>
              <tbody>
                \${[['Jaipur - VKI', '25', '28.4', '114%', '18%', '96%'], ['Jaipur - Sanganer', '24', '26.2', '110%', '12%', '95%'], ['Udaipur', '18', '18.6', '103%', '9%', '97%'], ['Kota', '15', '16.8', '112%', '14%', '96%'], ['Jodhpur', '14', '17.4', '124%', '20%', '94%']].map((r, i) => \`
                <tr style="border-bottom:1px solid var(--ceo-line);">
                  <td style="padding:4px; color:var(--ceo-muted);">\${i + 1}</td>
                  <td style="padding:4px; font-weight:600; color:var(--ceo-ink);">\${r[0]}</td>
                  <td style="padding:4px; color:var(--ceo-ink);">₹ \${r[1]} Cr</td>
                  <td style="padding:4px; color:var(--ceo-ink);">₹ \${r[2]} Cr</td>
                  <td style="padding:4px; color:var(--ceo-green); font-weight:600;">\${r[3]}</td>
                  <td style="padding:4px; color:var(--ceo-green);">↑ \${r[4]}</td>
                  <td style="padding:4px; color:var(--ceo-ink);">\${r[5]}</td>
                </tr>
                \`).join('')}
              </tbody>
            </table>
          \`)}
          \${_card('Portfolio Quality <i data-lucide="chevron-down" style="width:12px; height:12px; color:var(--ceo-muted); margin-left:4px; vertical-align:middle;"></i>', '<div class="ceo-pill">AUM</div>', \`
            <div class="ceo-split" style="display:flex; align-items:center; gap:16px; flex:1;">
              <div id="chartQuality" style="width:130px; height:130px; flex-shrink:0;"></div>
              <ul class="ceo-list" style="flex:1; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                \${_quality.map(p => \`
                <li style="display:flex; align-items:center; gap:8px; font-size:10px;">
                  <i style="width:8px; height:8px; border-radius:50%; background: \${p.c}; flex-shrink:0;"></i>
                  <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${p.n}</span>
                  <b style="color:var(--ceo-ink);">\${p.p}</b>
                  <em style="color:var(--ceo-muted); font-style:normal; width:45px; text-align:right;">\${p.v}</em>
                </li>\`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Collection Performance <i data-lucide="chevron-down" style="width:12px; height:12px; color:var(--ceo-muted); margin-left:4px; vertical-align:middle;"></i>', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
             <div class="ceo-stats sm" style="display:flex; gap:16px; margin-bottom:8px;">
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-ink);">₹ 164 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Due</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-ink);">₹ 158 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Collected</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-green);">96.4%</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Efficiency</span>
              </div>
              <div style="display:flex; flex-direction:column;">
                 <b style="font-size:14px; color:var(--ceo-red);">₹ 6 Cr</b>
                 <span style="font-size:10px; color:var(--ceo-muted);">Remaining</span>
              </div>
            </div>
            <div id="chartCollection" style="flex:1; width:100%; min-height:120px;"></div>
            <div class="ceo-legend" style="display:flex; justify-content:center; gap:16px; font-size:10px; color:var(--ceo-muted); margin-top:4px;">
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; background:var(--ceo-blue);"></i>Due</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; background:var(--ceo-green);"></i>Collected</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-red);"></i>Efficiency %</span>
            </div>
          \`)}
        </div>

        <div class="ceo-row r3" style="display:grid; grid-template-columns:1.55fr 1.1fr 0.92fr; gap:12px; margin-bottom:12px;">
          \${_card('Credit Command Center <i data-lucide="chevron-down" style="width:12px; height:12px; color:var(--ceo-muted); margin-left:4px; vertical-align:middle;"></i>', '', \`
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:16px;">
              \${[['clipboard-list', '127', 'Credit Queue', 'blue'], ['clock-3', '3.8d', 'Avg Credit TAT', 'violet'], ['file-warning', '42', 'CAM Pending', 'amber'], ['shield-alert', '18', 'RCU / Fraud Flags', 'red'], ['wrench', '14', 'Technical Pending', 'teal'], ['gavel', '8', 'Legal Pending', 'red']].map(([I, n, l, t]) => \`
                <div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--ceo-line); border-radius:6px; background:var(--ceo-bg);">
                  <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:4px;">\${_lucide(I)}</span>
                  <div style="display:flex; flex-direction:column;">
                    <b class="\${t}" style="font-size:14px; line-height:1;">\${n}</b>
                    <small style="font-size:9px; color:var(--ceo-muted);">\${l}</small>
                  </div>
                </div>
              \`).join('')}
            </div>
            <div style="display:flex; gap:16px; flex:1;">
              <div style="flex:1; display:flex; flex-direction:column;">
                <h3 style="font-size:10px; margin:0 0 8px 0; color:var(--ceo-ink);">Credit TAT Analysis <small style="color:var(--ceo-muted); font-weight:normal;">(Applications)</small></h3>
                <div id="chartTat" style="flex:1; width:100%; min-height:120px;"></div>
              </div>
              <div style="flex:1; display:flex; flex-direction:column;">
                <h3 style="font-size:10px; margin:0 0 8px 0; color:var(--ceo-ink);">Risk Grade Distribution</h3>
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                  <div id="chartGrades" style="width:90px; height:90px; flex-shrink:0;"></div>
                  <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; font-size:10px;">
                    \${_grades.map(g => \`
                    <li style="display:flex; align-items:center; gap:6px;">
                      <i style="width:8px; height:8px; border-radius:50%; background:\${g.c}; flex-shrink:0;"></i>
                      <span style="color:var(--ceo-ink);">\${g.n}</span>
                    </li>\`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          \`)}
          \${_card('Employee Performance <i data-lucide="chevron-down" style="width:12px; height:12px; color:var(--ceo-muted); margin-left:4px; vertical-align:middle;"></i>', '<div class="ceo-pill">View All</div>', \`
            <div class="ceo-tabs" style="display:flex; gap:4px; margin-bottom:12px;"><button class="ceo-button on">Top Performers</button><button class="ceo-button">Bottom Performers</button><button class="ceo-button">Team View</button></div>
            <table style="width:100%; font-size:10px; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid var(--ceo-line); color:var(--ceo-muted);">
                  <th style="padding:6px; font-weight:500;">#</th>
                  <th style="padding:6px; font-weight:500;">Employee</th>
                  <th style="padding:6px; font-weight:500;">Role</th>
                  <th style="padding:6px; font-weight:500; text-align:right;">Disbursement</th>
                  <th style="padding:6px; font-weight:500; text-align:right;">Target</th>
                  <th style="padding:6px; font-weight:500; text-align:right;">Achievement</th>
                </tr>
              </thead>
              <tbody>
              \${[['Neha Jain', 'BSO', '2.8', '2.5', '112%'], ['Amit Sharma', 'BDM', '12.4', '10', '124%'], ['Rakesh Meena', 'ASM', '28.1', '25', '112%'], ['Pooja Rathore', 'RSM', '36.2', '40', '90%'], ['Manish Gupta', 'ZSM', '82.4', '80', '103%']].map((r, i) => \`
                <tr style="border-bottom:1px solid var(--ceo-line);">
                  <td style="padding:6px; color:var(--ceo-muted);">\${i + 1}</td>
                  <td style="padding:6px; font-weight:600; color:var(--ceo-ink);">\${r[0]}</td>
                  <td style="padding:6px; color:var(--ceo-muted);">\${r[1]}</td>
                  <td style="padding:6px; text-align:right; font-weight:500; color:var(--ceo-ink);">₹ \${r[2]} Cr</td>
                  <td style="padding:6px; text-align:right; color:var(--ceo-muted);">₹ \${r[3]} Cr</td>
                  <td style="padding:6px; text-align:right; font-weight:600; color:\${parseInt(r[4]) < 100 ? 'var(--ceo-red)' : 'var(--ceo-green)'};">\${r[4]}</td>
                </tr>
              \`).join('')}
              </tbody>
            </table>
          \`)}
          \${_card('Management Watchlist', '<div class="ceo-pill">View All</div>', \`
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0;">
              \${[['alert-triangle', 'High Risk Cases', 18, 'CRITICAL', 'red'], ['alert-octagon', 'SLA Breaches', 27, 'HIGH', 'amber'], ['file-clock', 'Pending Approvals', 12, 'MEDIUM', 'blue'], ['gavel', 'Legal Exceptions', 8, 'HIGH', 'amber'], ['wrench', 'Technical Deviations', 14, 'MEDIUM', 'blue'], ['package', 'PDD Overdue', 11, 'HIGH', 'amber'], ['cctv', 'CCTV Critical Incidents', 2, 'MEDIUM', 'blue']].map(([I, l, n, s, c]) => \`
                <li style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--ceo-line); font-size:10px;">
                  <span class="ceo-ic \${c}" style="width:16px; height:16px; display:flex; align-items:center; justify-content:center; border-radius:4px;">\${_lucide(I)}</span>
                  <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${l}</span>
                  <b style="color:var(--ceo-ink);">\${n}</b>
                  <em style="font-style:normal; font-size:8px; padding:2px 6px; border-radius:4px; font-weight:600; background:var(--ceo-\${c}-soft); color:var(--ceo-\${c}); width:56px; text-align:center;">\${s}</em>
                </li>
              \`).join('')}
            </ul>
          \`)}
        </div>

        <div class="ceo-row r4" style="display:grid; grid-template-columns:1.2fr 1.27fr 1fr; gap:12px; margin-bottom:12px;">
          \${_card('Geographic Business Performance', '<div class="ceo-pill">Disbursement \${_lucide("chevron-down")}</div>', \`
            <div style="display:flex; align-items:center; gap:16px; flex:1;">
              <svg viewBox="0 0 200 110" style="width:120px; height:auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));"><path d="M70 8l18 6 10-4 8 10 14 2 6 12 16 4 8 14-10 8 4 12-14 6-6 14-16 2-10 12-14-6-8-14-16-4-4-14 6-10-10-10 4-14 12-6z" fill="var(--ceo-blue-soft)" /><path d="M58 30l20-6 14 10-2 16 10 12-10 14-16-2-10-12-12-4 2-14z" fill="var(--ceo-blue)" /><path d="M92 26l18 4 4 12-10 6-12-6z" fill="var(--ceo-blue-2)" /><path d="M78 74l16 2 6 12-14 8-10-8z" fill="var(--ceo-blue-3)" /></svg>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; flex:1;">
                \${[['Rajasthan', '482', '38.6%'], ['North', '312', '25.0%'], ['West', '224', '18.0%'], ['Central', '148', '11.8%'], ['East', '82', '6.6%']].map(([n, v, p], i) => \`
                  <li style="display:flex; align-items:center; gap:6px; font-size:10px;">
                    <i style="width:8px; height:8px; border-radius:2px; background: \${i ? 'var(--ceo-blue-soft)' : 'var(--ceo-blue)'}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${n}</span>
                    <em style="color:var(--ceo-muted); font-style:normal;">₹ \${v} Cr</em>
                    <b style="color:var(--ceo-ink); width:32px; text-align:right;">\${p}</b>
                  </li>
                \`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Assets & Admin Overview', '<div class="ceo-pill">View All</div>', \`
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; flex:1;">
              \${[['package', '148', 'Asset Requests', '22 Pending', 'blue'], ['user-check', '86', 'Assigned Assets', '+5 this month', 'teal'], ['receipt', '62', 'Admin Requests', '8 Budget Pending', 'red'], ['monitor', '14', 'Offline Devices', '2 Critical', 'violet']].map(([I, n, l, s, t]) => \`
                <div style="display:flex; align-items:flex-start; gap:8px; padding:10px; border:1px solid var(--ceo-line); border-radius:6px; background:var(--ceo-bg);">
                  <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:4px; flex-shrink:0;">\${_lucide(I)}</span>
                  <div style="display:flex; flex-direction:column;">
                    <b style="font-size:14px; line-height:1; color:var(--ceo-ink); margin-bottom:2px;">\${n}</b>
                    <small style="font-size:9px; color:var(--ceo-muted); margin-bottom:4px;">\${l}</small>
                    <em class="\${t}" style="font-style:normal; font-size:9px; font-weight:600;">\${s}</em>
                  </div>
                </div>
              \`).join('')}
            </div>
          \`)}
          \${_card('Governance, Audit & Compliance', '<div class="ceo-pill">View All</div>', \`
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; flex:1;">
              \${[['clipboard-check', '12', 'Open Audits', '4 Critical', 'blue', 'red'], ['file-check-2', '18', 'Compliance Due', '6 Overdue', 'red', 'red'], ['lock', '5', 'Consent', '2 High Risk', 'red', 'muted'], ['award', '96%', 'Compliance Score', '↑ 2%', 'teal', 'teal']].map(([I, n, l, s, t, st]) => \`
                <div style="display:flex; align-items:flex-start; gap:8px; padding:10px; border:1px solid var(--ceo-line); border-radius:6px; background:var(--ceo-bg);">
                  <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:4px; flex-shrink:0;">\${_lucide(I)}</span>
                  <div style="display:flex; flex-direction:column;">
                    <b style="font-size:14px; line-height:1; color:var(--ceo-ink); margin-bottom:2px;">\${n}</b>
                    <small style="font-size:9px; color:var(--ceo-muted); margin-bottom:4px;">\${l}</small>
                    <em class="\${st}" style="font-style:normal; font-size:9px; font-weight:600;">\${s}</em>
                  </div>
                </div>
              \`).join('')}
            </div>
          \`)}
        </div>
        
        <div class="ceo-ask-form" style="display:flex; align-items:center; gap:12px; background:white; padding:16px; border-radius:8px; border:1px solid var(--ceo-line); margin-bottom:24px;">
           <span style="font-weight:600; font-size:12px; color:var(--ceo-ink); white-space:nowrap;">Ask about these KPIs</span>
           <input type="text" placeholder="e.g. Why did disbursements drop in June?" style="flex:1; border:1px solid var(--ceo-line); outline:none;" />
           <button class="ceo-button" style="cursor:pointer; display:flex; align-items:center;">\${_lucide("sparkles")} Ask AI</button>
           <div class="ceo-ask-chips" style="display:flex; gap:8px;">
             <button class="ceo-button">Compare AUM across branches</button>
             <button class="ceo-button">Show top performing products</button>
           </div>
        </div>

      </div>
    </div>
  </div>
  \`;

  document.getElementById("content").innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
  
  if (window.apexChartsLoaded) {
    // Add a slight delay so DOM is 100% painted for chart querying
    setTimeout(renderCEOCharts, 100);
  }
};

function renderCEOCharts() {
  if (typeof ApexCharts === 'undefined') return;
  
  // Clean up any existing instances to avoid memory leaks/duplication
  if (window.ceoCharts) {
    window.ceoCharts.forEach(c => c.destroy());
  }
  window.ceoCharts = [];
  
  const commonOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
    dataLabels: { enabled: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'light' }
  };

  // Sparklines
  const sparkData = [
    [1100, 1120, 1140, 1160, 1200, 1220, 1248],
    [140, 150, 145, 160, 175, 180, 186],
    [160, 170, 165, 180, 195, 205, 214],
    [48000, 48500, 49200, 50100, 51000, 51800, 52318],
    [70.2, 71.5, 72.8, 74.1, 75.5, 76.9, 78.3],
    [92.3, 93.1, 93.8, 94.5, 95.2, 95.8, 96.4],
    [3.4, 3.2, 3.1, 3.0, 2.9, 2.7, 2.6],
    [2.2, 2.1, 2.0, 1.9, 1.9, 1.8, 1.8]
  ];
  const sparkColors = ['#1c4ed8', '#b91c1c', '#0f766e', '#6d28d9', '#0f766e', '#1c4ed8', '#d97706', '#b91c1c'];
  
  sparkData.forEach((data, i) => {
    const el = document.querySelector('#spark' + i);
    if (!el) return;
    const isBar = i >= 6; // Last two are bar charts in the original design
    const chart = new ApexCharts(el, {
      ...commonOptions,
      series: [{ data }],
      chart: { type: isBar ? 'bar' : 'line', width: '100%', height: '100%', sparkline: { enabled: true } },
      stroke: { curve: 'smooth', width: 2 },
      colors: [sparkColors[i]],
      plotOptions: isBar ? { bar: { columnWidth: '60%', borderRadius: 2 } } : {}
    });
    chart.render();
    window.ceoCharts.push(chart);
  });

  // Target vs Actual Disbursement
  const tEl = document.querySelector('#chartTarget');
  if (tEl) {
    const tChart = new ApexCharts(tEl, {
      ...commonOptions,
      series: [
        { name: 'Target', type: 'line', data: [40, 57, 74, 91, 108, 125, 142, 159, 176, 193] },
        { name: 'Actual', type: 'line', data: [30, 45, 61, 76, 92, 107, 123, 138, 154, 169] },
        { name: 'Projection', type: 'line', data: [null, null, null, null, null, null, null, null, null, 169, 185, 201] }
      ],
      chart: { height: '100%', type: 'line', toolbar: { show: false }, parentHeightOffset: 0 },
      stroke: { width: [3, 3, 3], curve: 'straight', dashArray: [4, 0, 4] },
      colors: ['#b91c1c', '#1c4ed8', '#1c4ed8'],
      grid: { show: true, borderColor: 'var(--ceo-line)', strokeDashArray: 4, yaxis: { lines: { show: true } } },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: 'var(--ceo-muted)', fontSize: '10px' } } },
      yaxis: { min: 0, max: 250, tickAmount: 5, labels: { formatter: (val) => val + ' Cr', style: { colors: 'var(--ceo-muted)', fontSize: '10px' } } },
      markers: { size: [0, 4, 0], colors: ['#fff'], strokeColors: '#1c4ed8', strokeWidth: 2 }
    });
    tChart.render();
    window.ceoCharts.push(tChart);
  }

  // Product Mix Donut
  const mEl = document.querySelector('#chartMix');
  if (mEl) {
    const mChart = new ApexCharts(mEl, {
      ...commonOptions,
      series: [22, 29, 25, 10, 14],
      labels: ['Two Wheeler', 'MSME', 'LAP', 'Solar Loan', 'Tractor Loan'],
      chart: { type: 'donut', height: '100%', parentHeightOffset: 0 },
      colors: ['#1c4ed8', '#b91c1c', '#6d28d9', '#d97706', '#f59e0b'],
      plotOptions: { donut: { size: '75%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '14px', fontWeight: 700, color: 'var(--ceo-ink)', formatter: () => '₹ 1,248 Cr' }, total: { show: true, showAlways: true, label: 'Total AUM', formatter: () => 'Total AUM', color: 'var(--ceo-muted)' } } } },
      stroke: { show: false }
    });
    mChart.render();
    window.ceoCharts.push(mChart);
  }

  // Portfolio Quality Donut
  const qEl = document.querySelector('#chartQuality');
  if (qEl) {
    const qChart = new ApexCharts(qEl, {
      ...commonOptions,
      series: [94.2, 3.1, 1.2, 0.8, 0.7],
      labels: ['Standard', 'DPD 1-30', 'DPD 31-60', 'DPD 61-90', 'NPA 90+'],
      chart: { type: 'donut', height: '100%', parentHeightOffset: 0 },
      colors: ['#0f766e', '#1c4ed8', '#d97706', '#b91c1c', '#991b1b'],
      plotOptions: { donut: { size: '75%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '14px', fontWeight: 700, color: 'var(--ceo-ink)', formatter: () => '1.8%' }, total: { show: true, showAlways: true, label: 'NPA', formatter: () => 'NPA', color: 'var(--ceo-muted)' } } } },
      stroke: { show: false }
    });
    qChart.render();
    window.ceoCharts.push(qChart);
  }

  // Collection Performance Composed Chart
  const cEl = document.querySelector('#chartCollection');
  if (cEl) {
    const cChart = new ApexCharts(cEl, {
      ...commonOptions,
      series: [
        { name: 'Due', type: 'column', data: [38, 42, 45, 40, 52, 50, 55] },
        { name: 'Collected', type: 'column', data: [36, 40, 43, 38, 50, 48, 53] },
        { name: 'Efficiency', type: 'line', data: [94, 95, 95, 95, 96, 96, 96] }
      ],
      chart: { height: '100%', type: 'line', stacked: false, toolbar: { show: false }, parentHeightOffset: 0 },
      stroke: { width: [0, 0, 2], curve: 'straight' },
      colors: ['#1c4ed8', '#0f766e', '#b91c1c'],
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 2 } },
      xaxis: { categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: 'var(--ceo-muted)', fontSize: '10px' } } },
      yaxis: [
        { min: 0, max: 80, tickAmount: 4, labels: { formatter: (val) => val + ' Cr', style: { colors: 'var(--ceo-muted)', fontSize: '10px' } } },
        { min: 0, max: 80, show: false },
        { opposite: true, min: 0, max: 100, tickAmount: 4, labels: { formatter: (val) => val + '%', style: { colors: 'var(--ceo-muted)', fontSize: '10px' } } }
      ],
      markers: { size: [0, 0, 3], colors: ['#fff'], strokeColors: '#b91c1c', strokeWidth: 2 }
    });
    cChart.render();
    window.ceoCharts.push(cChart);
  }

  // Credit TAT Analysis Bar
  const tatEl = document.querySelector('#chartTat');
  if (tatEl) {
    const tatChart = new ApexCharts(tatEl, {
      ...commonOptions,
      series: [{ name: 'Cases', data: [34, 28, 18, 14, 6] }],
      chart: { type: 'bar', height: '100%', parentHeightOffset: 0 },
      colors: ['#bfdbfe'],
      plotOptions: { bar: { columnWidth: '50%', borderRadius: 4, dataLabels: { position: 'top' } } },
      dataLabels: { enabled: true, formatter: (val) => val + '%', offsetY: -20, style: { fontSize: '10px', colors: ['var(--ceo-ink)'] } },
      xaxis: { categories: ['< 1 Day', '1-2 Days', '2-3 Days', '3-5 Days', '> 5 Days'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: 'var(--ceo-muted)', fontSize: '9px' } } },
      yaxis: { show: false }
    });
    tatChart.render();
    window.ceoCharts.push(tatChart);
  }

  // Risk Grade Distribution Donut
  const gEl = document.querySelector('#chartGrades');
  if (gEl) {
    const gChart = new ApexCharts(gEl, {
      ...commonOptions,
      series: [34, 28, 18, 12, 8],
      chart: { type: 'donut', height: '100%', parentHeightOffset: 0 },
      colors: ['#0f766e', '#1c4ed8', '#d97706', '#b91c1c', '#6d28d9'],
      plotOptions: { donut: { size: '65%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '12px', fontWeight: 700, color: 'var(--ceo-ink)', formatter: () => '284' }, total: { show: true, showAlways: true, label: 'Cases', formatter: () => 'Cases', color: 'var(--ceo-muted)' } } } },
      stroke: { show: false }
    });
    gChart.render();
    window.ceoCharts.push(gChart);
  }
}
// --- END PORTED CEO DASHBOARD ---
`;

const appJs = fs.readFileSync('public/workflow/app.js', 'utf8');
const startToken = '// --- PORTED CEO DASHBOARD ---';
const endToken = '// --- END PORTED CEO DASHBOARD ---';

const startIdx = appJs.indexOf(startToken);
const endIdx = appJs.indexOf(endToken) + endToken.length;

if (startIdx > -1 && endIdx > startIdx) {
  const newAppJs = appJs.substring(0, startIdx) + fullPort + appJs.substring(endIdx);
  fs.writeFileSync('public/workflow/app.js', newAppJs);
  console.log('Successfully injected fixed ApexCharts version into app.js');
} else {
  console.log('Error: Could not find PORTED CEO DASHBOARD block.');
}
