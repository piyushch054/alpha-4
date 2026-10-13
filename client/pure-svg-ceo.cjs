const fs = require('fs');

const fullPort = `
// --- PORTED CEO DASHBOARD ---
const C = { blue: 'var(--ceo-blue)', red: 'var(--ceo-red)', green: 'var(--ceo-green)', amber: 'var(--ceo-amber)', violet: 'var(--ceo-violet)', teal: 'var(--ceo-teal)', grid: 'var(--ceo-line)', muted: 'var(--ceo-muted)' };

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

function svgSpark(data, color, isBar) {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const w = 60, h = 24;
  if (isBar) {
    const bw = w / data.length - 2;
    return \`<svg width="100%" height="100%" viewBox="0 0 \${w} \${h}" preserveAspectRatio="none">\` + 
      data.map((v, i) => {
        const bh = (v / max) * h;
        return \`<rect x="\${i * (w / data.length)}" y="\${h - bh}" width="\${bw}" height="\${bh}" fill="\${color}" rx="1"/>\`;
      }).join('') + \`</svg>\`;
  } else {
    const pts = data.map((v, i) => \`\${i * (w / (data.length - 1))},\${h - ((v - min) / (max - min)) * h}\`).join(' ');
    return \`<svg width="100%" height="100%" viewBox="0 -2 \${w} \${h+4}" preserveAspectRatio="none">
      <polyline points="\${pts}" fill="none" stroke="\${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>\`;
  }
}

function cssDonut(data, centerText, centerSub) {
  const total = data.reduce((s, d) => s + d.val, 0);
  let acc = 0;
  const stops = data.map(d => {
    const start = acc;
    const pct = (d.val / total) * 100;
    acc += pct;
    return \`\${d.c} \${start}% \${acc}%\`;
  }).join(', ');
  
  return \`<div style="position:relative; width:130px; height:130px; border-radius:50%; background: conic-gradient(\${stops}); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 6px rgba(0,0,0,0.05) inset;">
    <div style="position:absolute; width:100px; height:100px; background:var(--ceo-card, white); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <b style="font-size:14px; color:var(--ceo-ink);">\${centerText}</b>
      <span style="font-size:9px; color:var(--ceo-muted);">\${centerSub}</span>
    </div>
  </div>\`;
}

function svgLineChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const actual = [25, 40, 55, 72, 86, 101, 118, 135, 150, 186];
  const target = [40, 55, 70, 85, 100, 120, 140, 155, 180, 215];
  const proj = [null, null, null, null, null, null, null, null, null, 186, 202, 224];
  
  const w = 600, h = 140;
  const max = 250;
  
  const mapY = (v) => h - (v / max) * h;
  const mapX = (i) => 30 + i * ((w - 40) / (months.length+1));
  
  const actualPts = actual.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const targetPts = target.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const projPts = proj.map((v, i) => v !== null ? \`\${mapX(i)},\${mapY(v)}\` : '').filter(Boolean).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let y = mapY(i*50);
    grids += \`<line x1="30" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="25" y="\${y+3}" font-size="10" fill="var(--ceo-muted)" text-anchor="end">\${i*50} Cr</text>\`;
  }
  
  let xLabels = [...months, 'Nov', 'Dec'].map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 15}" font-size="10" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+30}" preserveAspectRatio="none" style="overflow:visible;">
    \${grids}
    \${xLabels}
    <polyline points="\${targetPts}" fill="none" stroke="var(--ceo-red)" stroke-width="2" stroke-dasharray="6"/>
    <polyline points="\${projPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="2" stroke-dasharray="6" opacity="0.6"/>
    <polyline points="\${actualPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="2"/>
    \${actual.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapY(v)}" r="4" fill="var(--ceo-blue)" stroke="#fff" stroke-width="1.5"/>\`).join('')}
  </svg>\`;
}

function svgCollectionChart() {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const d_due = [38, 42, 45, 40, 52, 50, 55];
  const d_col = [36, 40, 43, 38, 50, 48, 53];
  const d_eff = [94.7, 95.2, 95.5, 95.0, 96.1, 96.0, 96.4];
  
  const w = 400, h = 100;
  const maxBar = 80;
  const mapYBar = (v) => h - (v / maxBar) * h;
  const mapX = (i) => 30 + i * ((w - 40) / 6);
  const mapYEff = (v) => h - ((v - 90) / 10) * h;
  
  let bars = d_due.map((v, i) => \`<rect x="\${mapX(i) - 14}" y="\${mapYBar(v)}" width="12" height="\${h-mapYBar(v)}" fill="var(--ceo-blue)" rx="2"/>\`).join('') +
             d_col.map((v, i) => \`<rect x="\${mapX(i) + 2}" y="\${mapYBar(v)}" width="12" height="\${h-mapYBar(v)}" fill="var(--ceo-green)" rx="2"/>\`).join('');
  
  const effPts = d_eff.map((v, i) => \`\${mapX(i)},\${mapYEff(v)}\`).join(' ');
  
  let grids = '';
  for(let i=0; i<=4; i++){
    let y = mapYBar(i*20);
    grids += \`<line x1="30" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="25" y="\${y+3}" font-size="9" fill="var(--ceo-muted)" text-anchor="end">\${i*20}</text>\`;
  }
  
  let xLabels = months.map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 15}" font-size="9" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+30}" preserveAspectRatio="none" style="overflow:visible;">
    \${grids}
    \${bars}
    <polyline points="\${effPts}" fill="none" stroke="var(--ceo-red)" stroke-width="2"/>
    \${d_eff.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapYEff(v)}" r="3" fill="var(--ceo-red)" stroke="#fff" stroke-width="1.5"/>\`).join('')}
    \${xLabels}
  </svg>\`;
}

function htmlTatBar() {
  const data = [{ d: '< 1 Day', v: 34 }, { d: '1-2 Days', v: 28 }, { d: '2-3 Days', v: 18 }, { d: '3-5 Days', v: 14 }, { d: '> 5 Days', v: 6 }];
  return \`<div style="display:flex; height:100%; align-items:flex-end; gap:8px; justify-content:space-between; padding-top:20px;">
    \${data.map(d => \`
      <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:4px;">
        <span style="font-size:10px; color:var(--ceo-ink); font-weight:600;">\${d.v}%</span>
        <div style="width:100%; max-width:40px; height:\${d.v * 2.5}px; background:var(--ceo-blue-soft); border-radius:4px 4px 0 0; box-shadow:0 -2px 4px rgba(0,0,0,0.05);"></div>
        <span style="font-size:9px; color:var(--ceo-muted); text-align:center; white-space:nowrap;">\${d.d}</span>
      </div>
    \`).join('')}
  </div>\`;
}

renderCEOPersonalizedDashboard = function() {
  if (!window.lucideLoading) {
    window.lucideLoading = true;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lucide@latest';
    s.onload = () => { if (window.lucide) window.lucide.createIcons(); };
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
                 <div style="width:60px; height:24px;">
                   \${svgSpark(k.data, k.c, i >= 6)}
                 </div>
              </div>
            </div>
          \`).join('')}
        </div>

        <div class="ceo-row r1" style="display:grid; grid-template-columns:1.68fr 1.1fr 1fr; gap:12px; margin-bottom:12px;">
          \${_card('Target vs Actual Disbursement', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
            <div class="ceo-stats sm" style="display:flex; gap:16px; margin-bottom:8px;">
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-ink);">₹ 186 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Actual</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-ink);">₹ 215 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Target</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-green);">86.5%</b><span style="font-size:10px; color:var(--ceo-muted);">Achievement</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-blue);">₹ 224 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Projected</span></div>
            </div>
            <div style="flex:1; width:100%; min-height:160px; padding-top:10px;">
              \${svgLineChart()}
            </div>
            <div class="ceo-legend" style="display:flex; justify-content:center; gap:16px; font-size:10px; color:var(--ceo-muted); margin-top:12px;">
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; border-radius:50%; background:var(--ceo-blue);"></i>Actual</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-red);"></i>Target</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-blue); border-top:2px dashed var(--ceo-bg);"></i>Projection</span>
            </div>
          \`)}
          \${_card('Product Mix & Performance', '<div class="ceo-tabs"><button class="ceo-button on">AUM</button><button class="ceo-button">Disbursement</button><button class="ceo-button">Customers</button></div>', \`
            <div class="ceo-split" style="display:flex; align-items:center; gap:16px; flex:1;">
              \${cssDonut([
                {val: 22, c: '#1c4ed8'}, {val: 29, c: '#b91c1c'}, {val: 25, c: '#6d28d9'}, {val: 10, c: '#d97706'}, {val: 14, c: '#f59e0b'}
              ], '₹ 1,248 Cr', 'Total AUM')}
              <ul class="ceo-list" style="flex:1; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                \${[['Two Wheeler', '22%', '₹ 275 Cr', '#1c4ed8'], ['MSME', '29%', '₹ 362 Cr', '#b91c1c'], ['LAP', '25%', '₹ 312 Cr', '#6d28d9'], ['Solar Loan', '10%', '₹ 225 Cr', '#d97706'], ['Tractor Loan', '14%', '₹ 174 Cr', '#f59e0b']].map(p => \`
                <li style="display:flex; align-items:center; gap:8px; font-size:10px;">
                  <i style="width:8px; height:8px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                  <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${p[0]}</span>
                  <b style="color:var(--ceo-ink);">\${p[1]}</b>
                  <em style="color:var(--ceo-muted); font-style:normal; width:45px; text-align:right;">\${p[2]}</em>
                </li>\`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Loan Conversion Funnel', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
            <div class="ceo-funnel" style="display:flex; flex-direction:column; gap:8px; flex:1; padding-top:8px;">
              \${[['Leads', 12442, '100%'], ['Login / Application', 8214, '66%'], ['Credit', 4982, '60.6%'], ['Sanction', 2914, '58.5%'], ['Disbursed', 1618, '55.5%']].map((f, i, arr) => \`
                <div class="ceo-funnel-step" style="position:relative;">
                  <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; padding-left:\${i*8}px;">
                    <span style="color:var(--ceo-ink); font-weight:500;">\${f[0]}</span>
                    <b style="color:var(--ceo-ink);">\${f[1].toLocaleString()} <span style="font-weight:normal; color:var(--ceo-muted); margin-left:4px;">(\${f[2]})</span></b>
                  </div>
                  <div style="height:14px; background:var(--ceo-line); border-radius:2px; margin-left:\${i*8}px; overflow:hidden;">
                    <div style="height:100%; width:\${f[1]/124.42}%; background:\${i===4 ? 'var(--ceo-green)' : 'var(--ceo-blue)'};"></div>
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
          \${_card('Branch Performance \${_lucide("chevron-down")}', '<div class="ceo-pill">View All</div>', \`
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
          \${_card('Portfolio Quality \${_lucide("chevron-down")}', '<div class="ceo-pill">AUM</div>', \`
            <div class="ceo-split" style="display:flex; align-items:center; gap:16px; flex:1;">
              \${cssDonut([
                {val: 94.2, c: '#0f766e'}, {val: 3.1, c: '#1c4ed8'}, {val: 1.2, c: '#d97706'}, {val: 0.8, c: '#b91c1c'}, {val: 0.7, c: '#991b1b'}
              ], '1.8%', 'NPA')}
              <ul class="ceo-list" style="flex:1; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                \${[['Standard', '94.2%', '₹ 1,175 Cr', '#0f766e'], ['DPD 1-30', '3.1%', '₹ 39 Cr', '#1c4ed8'], ['DPD 31-60', '1.2%', '₹ 15 Cr', '#d97706'], ['DPD 61-90', '0.8%', '₹ 10 Cr', '#b91c1c'], ['NPA 90+', '0.7%', '₹ 9 Cr', '#991b1b']].map(p => \`
                <li style="display:flex; align-items:center; gap:8px; font-size:10px;">
                  <i style="width:8px; height:8px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                  <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${p[0]}</span>
                  <b style="color:var(--ceo-ink);">\${p[1]}</b>
                  <em style="color:var(--ceo-muted); font-style:normal; width:45px; text-align:right;">\${p[2]}</em>
                </li>\`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Collection Performance \${_lucide("chevron-down")}', '<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>', \`
             <div class="ceo-stats sm" style="display:flex; gap:16px; margin-bottom:8px;">
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-ink);">₹ 164 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Due</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-ink);">₹ 158 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Collected</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-green);">96.4%</b><span style="font-size:10px; color:var(--ceo-muted);">Efficiency</span></div>
              <div style="display:flex; flex-direction:column;"><b style="font-size:14px; color:var(--ceo-red);">₹ 6 Cr</b><span style="font-size:10px; color:var(--ceo-muted);">Remaining</span></div>
            </div>
            <div style="flex:1; width:100%; min-height:120px; padding-top:10px;">
              \${svgCollectionChart()}
            </div>
            <div class="ceo-legend" style="display:flex; justify-content:center; gap:16px; font-size:10px; color:var(--ceo-muted); margin-top:12px;">
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; background:var(--ceo-blue); border-radius:2px;"></i>Due</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:8px; height:8px; background:var(--ceo-green); border-radius:2px;"></i>Collected</span>
               <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:2px; background:var(--ceo-red);"></i>Efficiency %</span>
            </div>
          \`)}
        </div>

        <div class="ceo-row r3" style="display:grid; grid-template-columns:1.55fr 1.1fr 0.92fr; gap:12px; margin-bottom:12px;">
          \${_card('Credit Command Center \${_lucide("chevron-down")}', '', \`
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
                <div style="flex:1; width:100%; min-height:120px;">
                  \${htmlTatBar()}
                </div>
              </div>
              <div style="flex:1; display:flex; flex-direction:column;">
                <h3 style="font-size:10px; margin:0 0 8px 0; color:var(--ceo-ink);">Risk Grade Distribution</h3>
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                  \${cssDonut([
                    {val: 34, c: '#0f766e'}, {val: 28, c: '#1c4ed8'}, {val: 18, c: '#d97706'}, {val: 12, c: '#b91c1c'}, {val: 8, c: '#6d28d9'}
                  ], '284', 'Cases')}
                  <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; font-size:10px;">
                    \${[['A (34%)', '#0f766e'], ['B (28%)', '#1c4ed8'], ['C (18%)', '#d97706'], ['D (12%)', '#b91c1c'], ['E (8%)', '#6d28d9']].map(g => \`
                    <li style="display:flex; align-items:center; gap:6px;">
                      <i style="width:8px; height:8px; border-radius:50%; background:\${g[1]}; flex-shrink:0;"></i>
                      <span style="color:var(--ceo-ink); font-weight:500;">\${g[0]}</span>
                    </li>\`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          \`)}
          \${_card('Employee Performance \${_lucide("chevron-down")}', '<div class="ceo-pill">View All</div>', \`
            <div class="ceo-tabs" style="display:flex; gap:4px; margin-bottom:12px;"><button class="ceo-button on">Top Performers</button><button class="ceo-button">Bottom Performers</button><button class="ceo-button">Team View</button></div>
            <table style="width:100%; font-size:10px; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid var(--ceo-line); color:var(--ceo-muted);">
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
              <svg viewBox="0 0 200 110" style="width:120px; height:auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
                <path d="M70 8l18 6 10-4 8 10 14 2 6 12 16 4 8 14-10 8 4 12-14 6-6 14-16 2-10 12-14-6-8-14-16-4-4-14 6-10-10-10 4-14 12-6z" fill="var(--ceo-blue-soft)" stroke="white" stroke-width="1"/>
                <path d="M58 30l20-6 14 10-2 16 10 12-10 14-16-2-10-12-12-4 2-14z" fill="var(--ceo-blue)" stroke="white" stroke-width="1"/>
                <path d="M92 26l18 4 4 12-10 6-12-6z" fill="var(--ceo-blue-2)" stroke="white" stroke-width="1"/>
                <path d="M78 74l16 2 6 12-14 8-10-8z" fill="var(--ceo-blue-3)" stroke="white" stroke-width="1"/>
              </svg>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; flex:1;">
                \${[['Rajasthan', '482 Cr', '38.6%'], ['North', '312 Cr', '25.0%'], ['West', '224 Cr', '18.0%'], ['Central', '114 Cr', '11.8%'], ['East', '82 Cr', '6.6%']].map(([n, v, p], i) => \`
                  <li style="display:flex; align-items:center; gap:6px; font-size:10px;">
                    <i style="width:8px; height:8px; border-radius:2px; background: \${i ? 'var(--ceo-blue-soft)' : 'var(--ceo-blue)'}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:500;">\${n}</span>
                    <em style="color:var(--ceo-muted); font-style:normal;">₹ \${v}</em>
                    <b style="color:var(--ceo-ink); width:32px; text-align:right;">\${p}</b>
                  </li>
                \`).join('')}
              </ul>
            </div>
          \`)}
          \${_card('Assets & Admin Overview', '<div class="ceo-pill">View All</div>', \`
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; flex:1;">
              \${[['package', '148', 'Asset Requests', '22 Pending', 'blue'], ['user-check', '86', 'Assigned Assets', '+5 this month', 'teal'], ['receipt', '62', 'Admin Requests', '8 Budget Pending', 'red'], ['monitor', '14', 'Other Devices', '2 Critical', 'violet']].map(([I, n, l, s, t]) => \`
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
      </div>
    </div>
  </div>
  \`;

  document.getElementById("content").innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
};
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
  console.log('Successfully injected zero-dependency pure SVG version into app.js');
} else {
  console.log('Error: Could not find PORTED CEO DASHBOARD block.');
}
