const fs = require('fs');

const fullPort = `
// --- PORTED CEO DASHBOARD ---
const C = { blue: 'var(--ceo-blue)', red: 'var(--ceo-red)', green: 'var(--ceo-green)', amber: 'var(--ceo-amber)', violet: 'var(--ceo-violet)', teal: 'var(--ceo-teal)', grid: 'var(--ceo-line)', muted: 'var(--ceo-muted)' };

function _lucide(name) { return \`<i data-lucide="\${name}"></i>\`; }

function _card(title, right, content, className="") {
  return \`
    <section class="ceo-card ceo-detail-card \${className}" style="box-sizing:border-box; cursor:default; display:flex; flex-direction:column; min-height:100%; height:100%; background:#fff; border:1px solid var(--ceo-line); border-radius:10px; padding:16px; min-width:0; overflow:hidden;">
      <div class="ceo-card-head" style="display:flex; justify-content:space-between; align-items:center; min-height:30px; padding-bottom:12px; border-bottom:1px solid var(--ceo-line); margin-bottom:12px;">
        <h2 style="margin:0; font-weight:700; color:var(--ceo-ink); font-size:14px;">\${title}</h2>
        \${right || ''}
      </div>
      <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
        \${content}
      </div>
    </section>\`;
}

function svgSpark(data, color, isBar) {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const w = 100, h = 45;
  if (isBar) {
    const bw = w / data.length - 2;
    return \`<svg width="100%" height="100%" viewBox="0 0 \${w} \${h}" preserveAspectRatio="none" style="display:block;">\` + 
      data.map((v, i) => {
        const bh = (v / max) * h;
        return \`<rect x="\${i * (w / data.length)}" y="\${h - bh}" width="\${bw}" height="\${bh}" fill="\${color}" rx="2"/>\`;
      }).join('') + \`</svg>\`;
  } else {
    const pts = data.map((v, i) => \`\${i * (w / (data.length - 1))},\${h - ((v - min) / (max - min)) * h}\`).join(' ');
    return \`<svg width="100%" height="100%" viewBox="0 -2 \${w} \${h+4}" preserveAspectRatio="none" style="display:block;">
      <polyline points="\${pts}" fill="none" stroke="\${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>\`;
  }
}

function cssDonut(data, centerText, centerSub, size=160, innerSize=120) {
  const total = data.reduce((s, d) => s + d.val, 0);
  let acc = 0;
  const stops = data.map(d => {
    const start = acc;
    const pct = (d.val / total) * 100;
    acc += pct;
    return \`\${d.c} \${start}% \${acc}%\`;
  }).join(', ');
  
  return \`<div style="position:relative; width:\${size}px; height:\${size}px; border-radius:50%; background: conic-gradient(\${stops}); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 6px rgba(0,0,0,0.05) inset; margin:0 auto; flex-shrink:0;">
    <div style="position:absolute; width:\${innerSize}px; height:\${innerSize}px; background:var(--ceo-card, white); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <b style="font-size:16px; color:var(--ceo-ink);">\${centerText}</b>
      <span style="font-size:10px; color:var(--ceo-muted);">\${centerSub}</span>
    </div>
  </div>\`;
}

function svgLineChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const actual = [25, 40, 55, 72, 86, 101, 118, 135, 150, 186];
  const target = [40, 55, 70, 85, 100, 120, 140, 155, 180, 215];
  const proj = [null, null, null, null, null, null, null, null, null, 186, 202, 224];
  
  const w = 1000, h = 280;
  const max = 250;
  
  const mapY = (v) => h - (v / max) * h;
  const mapX = (i) => 50 + i * ((w - 60) / (months.length+1));
  
  const actualPts = actual.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const targetPts = target.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const projPts = proj.map((v, i) => v !== null ? \`\${mapX(i)},\${mapY(v)}\` : '').filter(Boolean).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let y = mapY(i*50);
    grids += \`<line x1="50" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="40" y="\${y+4}" font-size="12" fill="var(--ceo-muted)" text-anchor="end">\${i*50} Cr</text>\`;
  }
  
  let xLabels = [...months, 'Nov', 'Dec'].map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 20}" font-size="12" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+30}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    \${grids}
    \${xLabels}
    <polyline points="\${targetPts}" fill="none" stroke="var(--ceo-red)" stroke-width="2.5" stroke-dasharray="6"/>
    <polyline points="\${projPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="2.5" stroke-dasharray="6" opacity="0.6"/>
    <polyline points="\${actualPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="3"/>
    \${actual.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapY(v)}" r="5" fill="var(--ceo-blue)" stroke="#fff" stroke-width="2"/>\`).join('')}
  </svg>\`;
}

function svgCollectionChart() {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const d_due = [42, 45, 48, 52, 58, 61, 64];
  const d_col = [40, 43, 46, 50, 56, 59, 62];
  const d_eff = [95, 95.5, 95.8, 96, 96.2, 96.3, 96.4];
  
  const w = 600, h = 240;
  const maxBar = 80;
  const mapYBar = (v) => h - (v / maxBar) * h;
  const mapX = (i) => 40 + i * ((w - 50) / 6);
  const mapYEff = (v) => h - ((v - 90) / 10) * h;
  
  let bars = d_due.map((v, i) => \`<rect x="\${mapX(i) - 16}" y="\${mapYBar(v)}" width="14" height="\${h-mapYBar(v)}" fill="var(--ceo-blue)" rx="2"/>\`).join('') +
             d_col.map((v, i) => \`<rect x="\${mapX(i) + 2}" y="\${mapYBar(v)}" width="14" height="\${h-mapYBar(v)}" fill="var(--ceo-green)" rx="2"/>\`).join('');
  
  const effPts = d_eff.map((v, i) => \`\${mapX(i)},\${mapYEff(v)}\`).join(' ');
  
  let grids = '';
  for(let i=0; i<=4; i++){
    let y = mapYBar(i*20);
    grids += \`<line x1="40" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="35" y="\${y+4}" font-size="11" fill="var(--ceo-muted)" text-anchor="end">\${i*20}</text>\`;
  }
  
  let xLabels = months.map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 20}" font-size="11" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+30}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    \${grids}
    \${bars}
    <polyline points="\${effPts}" fill="none" stroke="var(--ceo-red)" stroke-width="2.5"/>
    \${d_eff.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapYEff(v)}" r="4" fill="var(--ceo-red)" stroke="#fff" stroke-width="2"/>\`).join('')}
    \${xLabels}
  </svg>\`;
}

function htmlTatBar() {
  const data = [{ d: '< 1 Day', v: 34 }, { d: '1-2 Days', v: 28 }, { d: '2-3 Days', v: 18 }, { d: '3-5 Days', v: 14 }, { d: '> 5 Days', v: 6 }];
  return \`<div style="display:flex; height:100%; align-items:flex-end; gap:12px; justify-content:space-between; padding-top:20px;">
    \${data.map(d => \`
      <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:6px;">
        <span style="font-size:12px; color:var(--ceo-ink); font-weight:700;">\${d.v}%</span>
        <div style="width:100%; max-width:48px; height:\${d.v * 3.5}px; background:var(--ceo-blue-soft); border-radius:6px 6px 0 0; box-shadow:0 -2px 6px rgba(0,0,0,0.05);"></div>
        <span style="font-size:10px; color:var(--ceo-muted); text-align:center; white-space:nowrap; font-weight:500;">\${d.d}</span>
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
  <style>
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 14px;
      align-items: stretch;
      box-sizing: border-box;
      min-width: 0;
    }
    @media (max-width: 1199px) {
      .dashboard-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }
    @media (max-width: 767px) {
      .dashboard-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    }
    .span-8 { grid-column: span 8; }
    .span-7 { grid-column: span 7; }
    .span-6 { grid-column: span 6; }
    .span-4 { grid-column: span 4; }
    .span-3 { grid-column: span 3; }
    .span-5 { grid-column: span 5; }
    
    @media (max-width: 1199px) {
      .span-8, .span-7, .span-6, .span-5, .span-4, .span-3 { grid-column: span 6; }
    }
    @media (max-width: 767px) {
      .span-8, .span-7, .span-6, .span-5, .span-4, .span-3 { grid-column: span 1; }
    }
  </style>
  <div class="ceo-root" style="min-height:100%; height:auto;">
    <div class="ceo-main">
      <div class="ceo-content">
        
        <div class="ceo-banner" style="position:relative; margin-bottom:16px; display:flex; flex-wrap:wrap; align-items:center; background: var(--ceo-blue-tint) url('/ceo-banner-bg.jpg') center/cover no-repeat; border-radius:10px; overflow:hidden; min-height: 125px;">
          <div style="flex:1 1 300px; padding:24px 32px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
               <img src="/favicon.png" style="width:24px; height:24px;" onerror="this.style.display='none'" />
               <b style="color:var(--ceo-blue); font-size:12px;">NAMDEV FINVEST</b>
            </div>
            <h1 style="font-size:26px; font-weight:700; margin:0 0 6px 0; color:var(--ceo-ink)">CEO Executive Command Center</h1>
            <p style="font-size:13px; margin:0; color:var(--ceo-muted)">Real-time view of lending, risk, collections and operational performance</p>
          </div>
          <div style="display:flex; align-items:center; gap:20px; padding:24px 32px; flex:0 0 auto;">
            <div style="text-align:right;">
              <b style="display:block; font-size:15px; color:var(--ceo-ink)">Jitendra Sharma</b>
              <span style="font-size:12px; color:var(--ceo-muted)">Managing Director & CEO</span>
              <q style="display:block; font-size:11px; font-style:italic; margin-top:6px; color:var(--ceo-blue)">"Driving growth through financial inclusion."</q>
            </div>
            <img src="/ceo-bust.png" style="height:90px; width:90px; object-fit:contain; border-radius:50%; background:white; border:2px solid var(--ceo-blue-soft)" onerror="this.style.display='none'" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:14px;">
          \${kpis.map((k,i) => \`
            <div class="ceo-kpi" style="box-sizing:border-box; background:white; border-radius:10px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.04); border:1px solid var(--ceo-line); display:flex; flex-direction:column; min-height: 110px;">
              <div class="ceo-kpi-t" style="display:flex; align-items:center; gap:8px; color:var(--ceo-muted); font-size:11px; margin-bottom:10px;">
                 <span class="ceo-ic \${k.tone}" style="display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px;">\${_lucide(k.i)}</span>
                 <span style="font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">\${k.t}</span>
              </div>
              <strong style="font-size:22px; color:var(--ceo-ink); margin-bottom:8px; font-weight:700;">\${k.v}</strong>
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
                 <small style="font-size:11px; color:\${k.up ? 'var(--ceo-green)' : 'var(--ceo-red)'}; display:flex; align-items:center; gap:4px; font-weight:700;">
                    \${k.up ? '↑' : '↓'} \${k.d}
                 </small>
                 <div style="width:100px; height:45px; min-height:45px; margin-left:auto;">
                   \${svgSpark(k.data, k.c, i >= 6)}
                 </div>
              </div>
            </div>
          \`).join('')}
        </div>

        <div class="dashboard-grid" style="margin-bottom:14px;">
          <div class="span-7">
            \${_card('Target vs Actual Disbursement', \`<div class="ceo-pill">MTD \${_lucide("chevron-right")}</div>\`, \`
              <div class="ceo-stats sm" style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:20px; color:var(--ceo-ink);">₹ 186 Cr</b><span style="font-size:11px; color:var(--ceo-muted); font-weight:500;">Actual</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:20px; color:var(--ceo-ink);">₹ 215 Cr</b><span style="font-size:11px; color:var(--ceo-muted); font-weight:500;">Target</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:20px; color:var(--ceo-green);">86.5%</b><span style="font-size:11px; color:var(--ceo-muted); font-weight:500;">Achievement</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:20px; color:var(--ceo-blue);">₹ 224 Cr</b><span style="font-size:11px; color:var(--ceo-muted); font-weight:500;">Projected</span></div>
              </div>
              <div style="flex:1; width:100%; height:300px; min-height:280px; position:relative; margin-top:10px;">
                \${svgLineChart()}
              </div>
              <div class="ceo-legend" style="display:flex; justify-content:center; gap:20px; font-size:11px; color:var(--ceo-muted); margin-top:20px;">
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:10px; height:10px; border-radius:50%; background:var(--ceo-blue);"></i>Actual</span>
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:16px; height:2px; background:var(--ceo-red);"></i>Target</span>
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:16px; height:2px; background:var(--ceo-blue); border-top:2px dashed transparent;"></i>Projection</span>
              </div>
            \`)}
          </div>
          <div class="span-3">
            \${_card('Product Mix', \`<div class="ceo-tabs"><button class="ceo-button on">AUM</button></div>\`, \`
              <div class="ceo-split" style="display:flex; flex-direction:column; align-items:center; gap:24px; flex:1; padding:20px 0;">
                \${cssDonut([
                  {val: 22, c: '#1c4ed8'}, {val: 29, c: '#b91c1c'}, {val: 25, c: '#6d28d9'}, {val: 10, c: '#d97706'}, {val: 14, c: '#f59e0b'}
                ], '₹ 1,248 Cr', 'Total AUM', 160, 120)}
                <ul class="ceo-list" style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">
                  \${[['Two Wheeler', '22%', '₹ 275 Cr', '#1c4ed8'], ['MSME', '29%', '₹ 362 Cr', '#b91c1c'], ['LAP', '25%', '₹ 312 Cr', '#6d28d9'], ['Solar', '10%', '₹ 225 Cr', '#d97706'], ['Tractor', '14%', '₹ 174 Cr', '#f59e0b']].map(p => \`
                  <li style="display:flex; align-items:center; gap:10px; font-size:11px;">
                    <i style="width:10px; height:10px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:12px;">\${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; width:55px; text-align:right;">\${p[2]}</em>
                  </li>\`).join('')}
                </ul>
              </div>
            \`)}
          </div>
          <div class="span-2">
            \${_card('Conversion Funnel', \`<div class="ceo-pill">MTD</div>\`, \`
              <div class="ceo-funnel" style="display:flex; flex-direction:column; gap:14px; flex:1; padding-top:12px;">
                \${[['Leads', 12442, '100%'], ['App', 8214, '66%'], ['Credit', 4982, '60.6%'], ['Sanction', 2914, '58.5%'], ['Disbursed', 1618, '55.5%']].map((f, i, arr) => \`
                  <div class="ceo-funnel-step" style="position:relative;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
                      <span style="color:var(--ceo-ink); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${f[0]}</span>
                      <b style="color:var(--ceo-ink); white-space:nowrap;">\${f[1].toLocaleString()} <span style="font-weight:500; color:var(--ceo-muted); margin-left:2px;">(\${f[2]})</span></b>
                    </div>
                    <div style="height:24px; min-height:24px; background:var(--ceo-line); border-radius:4px; overflow:hidden;">
                      <div style="height:100%; width:\${f[1]/124.42}%; background:\${i===4 ? 'var(--ceo-green)' : 'var(--ceo-blue)'}; border-radius:4px;"></div>
                    </div>
                  </div>
                \`).join('')}
              </div>
              <div style="margin-top:auto; padding-top:16px; border-top:1px dashed var(--ceo-line); display:flex; justify-content:space-between; font-size:11px; align-items:center;">
                 <span style="color:var(--ceo-muted); font-weight:500;">Conversion</span>
                 <b style="color:var(--ceo-ink); font-size:14px;">13.0%</b>
              </div>
            \`)}
          </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom:14px;">
          <div class="span-5">
            \${_card('Branch Performance', \`<div class="ceo-pill">View All</div>\`, \`
              <table style="width:100%; font-size:11px; border-collapse:collapse; text-align:left; flex:1; table-layout:fixed;">
                <thead>
                  <tr style="border-bottom:2px solid var(--ceo-line); color:var(--ceo-muted);">
                    <th style="padding:8px 4px; font-weight:600; width:20px;">#</th>
                    <th style="padding:8px 4px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Branch</th>
                    <th style="padding:8px 4px; font-weight:600; text-align:right;">Target</th>
                    <th style="padding:8px 4px; font-weight:600; text-align:right;">Actual</th>
                    <th style="padding:8px 4px; font-weight:600; text-align:right;">Ach%</th>
                  </tr>
                </thead>
                <tbody>
                  \${[['Jaipur VKI', '25', '28.4', '114%', '18%', '96%'], ['Sanganer', '24', '26.2', '110%', '12%', '95%'], ['Udaipur', '18', '18.6', '103%', '9%', '97%'], ['Kota', '15', '16.8', '112%', '14%', '96%'], ['Jodhpur', '14', '17.4', '124%', '20%', '94%']].map((r, i) => \`
                  <tr style="border-bottom:1px solid var(--ceo-line);">
                    <td style="padding:10px 4px; color:var(--ceo-muted);">\${i + 1}</td>
                    <td style="padding:10px 4px; font-weight:700; color:var(--ceo-ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${r[0]}</td>
                    <td style="padding:10px 4px; color:var(--ceo-muted); text-align:right;">\${r[1]}</td>
                    <td style="padding:10px 4px; color:var(--ceo-ink); text-align:right; font-weight:600;">\${r[2]}</td>
                    <td style="padding:10px 4px; color:var(--ceo-green); font-weight:700; text-align:right;">\${r[3]}</td>
                  </tr>
                  \`).join('')}
                </tbody>
              </table>
            \`)}
          </div>
          <div class="span-3">
            \${_card('Portfolio Quality', \`<div class="ceo-pill">AUM</div>\`, \`
              <div class="ceo-split" style="display:flex; flex-direction:column; align-items:center; gap:24px; flex:1; padding:20px 0;">
                \${cssDonut([
                  {val: 94.2, c: '#0f766e'}, {val: 3.1, c: '#1c4ed8'}, {val: 1.2, c: '#d97706'}, {val: 0.8, c: '#b91c1c'}, {val: 0.7, c: '#991b1b'}
                ], '1.8%', 'NPA', 150, 110)}
                <ul class="ceo-list" style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">
                  \${[['Standard', '94.2%', '1,175', '#0f766e'], ['DPD 1-30', '3.1%', '39', '#1c4ed8'], ['DPD 31-60', '1.2%', '15', '#d97706'], ['DPD 61-90', '0.8%', '10', '#b91c1c'], ['NPA 90+', '0.7%', '9', '#991b1b']].map(p => \`
                  <li style="display:flex; align-items:center; gap:10px; font-size:11px;">
                    <i style="width:10px; height:10px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:12px;">\${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; width:35px; text-align:right;">\${p[2]}</em>
                  </li>\`).join('')}
                </ul>
              </div>
            \`)}
          </div>
          <div class="span-4">
            \${_card('Collection Performance', \`<div class="ceo-pill">MTD</div>\`, \`
               <div class="ceo-stats sm" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:8px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:16px; color:var(--ceo-ink);">₹164 Cr</b><span style="font-size:10px; color:var(--ceo-muted); font-weight:500;">Due</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:16px; color:var(--ceo-ink);">₹158 Cr</b><span style="font-size:10px; color:var(--ceo-muted); font-weight:500;">Collected</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:16px; color:var(--ceo-green);">96.4%</b><span style="font-size:10px; color:var(--ceo-muted); font-weight:500;">Efficiency</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:16px; color:var(--ceo-red);">₹6 Cr</b><span style="font-size:10px; color:var(--ceo-muted); font-weight:500;">Remaining</span></div>
              </div>
              <div style="flex:1; width:100%; height:260px; min-height:240px; position:relative; margin-top:10px;">
                \${svgCollectionChart()}
              </div>
              <div class="ceo-legend" style="display:flex; justify-content:center; gap:20px; font-size:11px; color:var(--ceo-muted); margin-top:20px;">
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:10px; height:10px; background:var(--ceo-blue); border-radius:2px;"></i>Due</span>
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:10px; height:10px; background:var(--ceo-green); border-radius:2px;"></i>Collected</span>
                 <span style="display:flex; align-items:center; gap:6px;"><i style="width:16px; height:2px; background:var(--ceo-red);"></i>Efficiency</span>
              </div>
            \`)}
          </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom:14px;">
          <div class="span-4">
            \${_card('Credit Command Center', '', \`
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:24px;">
                \${[['clipboard-list', '127', 'Credit Queue', 'blue'], ['clock-3', '3.8d', 'Avg TAT', 'violet'], ['shield-alert', '18', 'Fraud Flags', 'red'], ['gavel', '8', 'Legal Pending', 'red']].map(([I, n, l, t]) => \`
                  <div style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--ceo-line); border-radius:8px; background:var(--ceo-bg);">
                    <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px;">\${_lucide(I)}</span>
                    <div style="display:flex; flex-direction:column;">
                      <b class="\${t}" style="font-size:16px; line-height:1; margin-bottom:2px;">\${n}</b>
                      <small style="font-size:10px; color:var(--ceo-muted); font-weight:500;">\${l}</small>
                    </div>
                  </div>
                \`).join('')}
              </div>
              <div style="display:flex; flex-direction:column; flex:1; border-top:1px solid var(--ceo-line); padding-top:20px;">
                  <h3 style="font-size:12px; margin:0 0 12px 0; color:var(--ceo-ink);">Credit TAT Analysis <small style="color:var(--ceo-muted); font-weight:normal;">(Applications)</small></h3>
                  <div style="flex:1; width:100%; min-height:160px; height:160px;">
                    \${htmlTatBar()}
                  </div>
              </div>
            \`)}
          </div>
          <div class="span-4">
            \${_card('Employee Performance', \`<div class="ceo-pill">View All</div>\`, \`
              <table style="width:100%; font-size:11px; border-collapse:collapse; text-align:left; flex:1; table-layout:fixed;">
                <thead>
                  <tr style="border-bottom:2px solid var(--ceo-line); color:var(--ceo-muted);">
                    <th style="padding:8px 4px; font-weight:600; width:25%;">Employee</th>
                    <th style="padding:8px 4px; font-weight:600; width:15%;">Role</th>
                    <th style="padding:8px 4px; font-weight:600; text-align:right;">Disbursed</th>
                    <th style="padding:8px 4px; font-weight:600; text-align:right;">Achieve</th>
                  </tr>
                </thead>
                <tbody>
                \${[['Neha Jain', 'BSO', '2.8', '2.5', '112%'], ['Amit Sharma', 'BDM', '12.4', '10', '124%'], ['Rakesh Meena', 'ASM', '28.1', '25', '112%'], ['Pooja Rathore', 'RSM', '36.2', '40', '90%'], ['Manish Gupta', 'ZSM', '82.4', '80', '103%']].map((r, i) => \`
                  <tr style="border-bottom:1px solid var(--ceo-line);">
                    <td style="padding:12px 4px; font-weight:700; color:var(--ceo-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${r[0]}</td>
                    <td style="padding:12px 4px; color:var(--ceo-muted); font-weight:500;">\${r[1]}</td>
                    <td style="padding:12px 4px; text-align:right; font-weight:600; color:var(--ceo-ink);">₹ \${r[2]}</td>
                    <td style="padding:12px 4px; text-align:right; font-weight:700; color:\${parseInt(r[4]) < 100 ? 'var(--ceo-red)' : 'var(--ceo-green)'};">\${r[4]}</td>
                  </tr>
                \`).join('')}
                </tbody>
              </table>
            \`)}
          </div>
          <div class="span-4">
            \${_card('Management Watchlist', \`<div class="ceo-pill">View All</div>\`, \`
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0; flex:1;">
                \${[['alert-triangle', 'High Risk Cases', 18, 'CRITICAL', 'red'], ['alert-octagon', 'SLA Breaches', 27, 'HIGH', 'amber'], ['file-clock', 'Pending Approvals', 12, 'MEDIUM', 'blue'], ['gavel', 'Legal Exceptions', 8, 'HIGH', 'amber'], ['package', 'PDD Overdue', 11, 'HIGH', 'amber'], ['cctv', 'Critical Incidents', 2, 'MEDIUM', 'blue']].map(([I, l, n, s, c]) => \`
                  <li style="display:flex; align-items:center; gap:12px; padding:16px 0; border-bottom:1px solid var(--ceo-line); font-size:11px;">
                    <span class="ceo-ic \${c}" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:6px; flex-shrink:0;">\${_lucide(I)}</span>
                    <span style="color:var(--ceo-ink); font-weight:600;">\${l}</span>
                    <b style="color:var(--ceo-ink); font-size:13px; margin-left:8px;">\${n}</b>
                    <em style="margin-left:auto; font-style:normal; font-size:9px; padding:4px 8px; border-radius:6px; font-weight:700; background:var(--ceo-\${c}-soft); color:var(--ceo-\${c}); width:70px; text-align:center;">\${s}</em>
                  </li>
                \`).join('')}
              </ul>
            \`)}
          </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom:16px;">
          <div class="span-4">
            \${_card('Geographic Performance', \`<div class="ceo-pill">Disbursement</div>\`, \`
              <div style="display:flex; align-items:center; gap:20px; flex:1; padding-top:8px;">
                <svg viewBox="0 0 200 110" style="width:140px; height:auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1)); flex-shrink:0;">
                  <path d="M70 8l18 6 10-4 8 10 14 2 6 12 16 4 8 14-10 8 4 12-14 6-6 14-16 2-10 12-14-6-8-14-16-4-4-14 6-10-10-10 4-14 12-6z" fill="var(--ceo-blue-soft)" stroke="white" stroke-width="1.5"/>
                  <path d="M58 30l20-6 14 10-2 16 10 12-10 14-16-2-10-12-12-4 2-14z" fill="var(--ceo-blue)" stroke="white" stroke-width="1.5"/>
                  <path d="M92 26l18 4 4 12-10 6-12-6z" fill="var(--ceo-blue-2)" stroke="white" stroke-width="1.5"/>
                  <path d="M78 74l16 2 6 12-14 8-10-8z" fill="var(--ceo-blue-3)" stroke="white" stroke-width="1.5"/>
                </svg>
                <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; flex:1;">
                  \${[['Rajasthan', '482', '38.6%'], ['North', '312', '25.0%'], ['West', '224', '18.0%'], ['Central', '114', '11.8%'], ['East', '82', '6.6%']].map(([n, v, p], i) => \`
                    <li style="display:flex; align-items:center; gap:10px; font-size:11px;">
                      <i style="width:10px; height:10px; border-radius:2px; background: \${i ? 'var(--ceo-blue-soft)' : 'var(--ceo-blue)'}; flex-shrink:0;"></i>
                      <span style="flex:1; color:var(--ceo-ink); font-weight:600;">\${n}</span>
                      <em style="color:var(--ceo-muted); font-style:normal; font-weight:500;">₹\${v}</em>
                      <b style="color:var(--ceo-ink); width:40px; text-align:right;">\${p}</b>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            \`)}
          </div>
          <div class="span-4">
            \${_card('Assets & Admin Overview', \`<div class="ceo-pill">View All</div>\`, \`
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; flex:1;">
                \${[['package', '148', 'Asset Requests', '22 Pending', 'blue'], ['user-check', '86', 'Assigned Assets', '+5 month', 'teal'], ['receipt', '62', 'Admin Requests', '8 Pending', 'red'], ['monitor', '14', 'Other Devices', '2 Critical', 'violet']].map(([I, n, l, s, t]) => \`
                  <div style="display:flex; align-items:flex-start; gap:12px; padding:16px; border:1px solid var(--ceo-line); border-radius:8px; background:var(--ceo-bg);">
                    <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; flex-shrink:0;">\${_lucide(I)}</span>
                    <div style="display:flex; flex-direction:column;">
                      <b style="font-size:18px; line-height:1; color:var(--ceo-ink); margin-bottom:4px;">\${n}</b>
                      <small style="font-size:10px; color:var(--ceo-muted); margin-bottom:8px; font-weight:500;">\${l}</small>
                      <em class="\${t}" style="font-style:normal; font-size:10px; font-weight:700;">\${s}</em>
                    </div>
                  </div>
                \`).join('')}
              </div>
            \`)}
          </div>
          <div class="span-4">
            \${_card('Governance & Audit', \`<div class="ceo-pill">View All</div>\`, \`
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; flex:1;">
                \${[['clipboard-check', '12', 'Open Audits', '4 Critical', 'blue', 'red'], ['file-check-2', '18', 'Compliance Due', '6 Overdue', 'red', 'red'], ['lock', '5', 'Consent', '2 High Risk', 'red', 'muted'], ['award', '96%', 'Score', '↑ 2%', 'teal', 'teal']].map(([I, n, l, s, t, st]) => \`
                  <div style="display:flex; align-items:flex-start; gap:12px; padding:16px; border:1px solid var(--ceo-line); border-radius:8px; background:var(--ceo-bg);">
                    <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; flex-shrink:0;">\${_lucide(I)}</span>
                    <div style="display:flex; flex-direction:column;">
                      <b style="font-size:18px; line-height:1; color:var(--ceo-ink); margin-bottom:4px;">\${n}</b>
                      <small style="font-size:10px; color:var(--ceo-muted); margin-bottom:8px; font-weight:500;">\${l}</small>
                      <em class="\${st}" style="font-style:normal; font-size:10px; font-weight:700;">\${s}</em>
                    </div>
                  </div>
                \`).join('')}
              </div>
            \`)}
          </div>
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
  console.log('Successfully injected final responsive dashboard into app.js');
} else {
  console.log('Error: Could not find PORTED CEO DASHBOARD block.');
}
