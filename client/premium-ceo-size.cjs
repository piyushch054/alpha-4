const fs = require('fs');

const fullPort = `
// --- PORTED CEO DASHBOARD ---

const C = { blue: 'var(--ceo-blue)', red: 'var(--ceo-red)', green: 'var(--ceo-green)', amber: 'var(--ceo-amber)', violet: 'var(--ceo-violet)', teal: 'var(--ceo-teal)', grid: 'var(--ceo-line)', muted: 'var(--ceo-muted)' };

function _lucide(name) { return \`<i data-lucide="\${name}"></i>\`; }

function _card(title, right, content, className="") {
  return \`
    <section class="ceo-card \${className}" style="box-sizing:border-box; display:flex; flex-direction:column; height:100%; min-height:300px; background:var(--ceo-card); border:1px solid var(--ceo-line); border-radius:12px; padding:24px; min-width:0;">
      <div class="ceo-card-head" style="display:flex; justify-content:space-between; align-items:center; min-height:30px; padding-bottom:16px; border-bottom:1px solid var(--ceo-line); margin-bottom:20px; gap:8px;">
        <h2 style="margin:0; font-weight:700; color:var(--ceo-ink); font-size:16px; min-width:0; white-space:normal; line-height:1.2;">\${title}</h2>
        <div style="flex-shrink:0;">\${right || ''}</div>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; min-width:0; position:relative;">
        \${content}
      </div>
    </section>\`;
}

function svgSpark(data, color, isBar) {
  if(!data || !data.length) return '';
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const w = 120, h = 50;
  if (isBar) {
    const bw = (w / data.length) - 2;
    return \`<svg width="100%" height="100%" viewBox="0 0 \${w} \${h}" preserveAspectRatio="none" style="display:block; overflow:visible;">\` + 
      data.map((v, i) => {
        const bh = ((v - Math.min(0, min)) / (max - Math.min(0, min))) * h;
        return \`<rect x="\${i * (w / data.length)}" y="\${h - bh}" width="\${bw}" height="\${bh}" fill="\${color}" rx="2"/>\`;
      }).join('') + \`</svg>\`;
  } else {
    const pts = data.map((v, i) => \`\${i * (w / (data.length - 1))},\${h - ((v - min) / (max - min)) * h}\`).join(' ');
    return \`<svg width="100%" height="100%" viewBox="0 -2 \${w} \${h+4}" preserveAspectRatio="none" style="display:block; overflow:visible;">
      <polyline points="\${pts}" fill="none" stroke="\${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="\${w}" cy="\${h - ((data[data.length-1] - min) / (max - min)) * h}" r="3" fill="\${color}"/>
    </svg>\`;
  }
}

function svgModalLineChart(data, color) {
  if(!data || !data.length) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const w = 1000, h = 400;
  const max = Math.max(...data) * 1.05;
  const min = Math.max(0, Math.min(...data) * 0.95);
  
  const mapY = (v) => h - ((v - min) / (max - min)) * h;
  const mapX = (i) => 70 + i * ((w - 90) / (months.length - 1));
  
  const pts = data.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let val = min + (i/5)*(max-min);
    let y = mapY(val);
    grids += \`<line x1="70" y1="\${y}" x2="\${w-20}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="60" y="\${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">\${val > 1000 ? (val/1000).toFixed(1)+'k' : (val > 100 ? Math.round(val) : val.toFixed(1))}</text>\`;
  }
  
  let xLabels = months.map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 28}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -15 \${w} \${h+45}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    \${grids}
    \${xLabels}
    <polyline points="\${pts}" fill="none" stroke="\${color}" stroke-width="3"/>
    \${data.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapY(v)}" r="6" fill="\${color}" stroke="#fff" stroke-width="2"/>
    <text x="\${mapX(i)}" y="\${mapY(v) - 14}" font-size="11" fill="var(--ceo-ink)" text-anchor="middle" font-weight="700">\${v}</text>\`).join('')}
  </svg>\`;
}

function cssDonut(data, centerText, centerSub, size=180, innerSize=130) {
  const total = data.reduce((s, d) => s + d.val, 0);
  let acc = 0;
  const stops = data.map(d => {
    const start = acc;
    const pct = (d.val / total) * 100;
    acc += pct;
    return \`\${d.c} \${start}% \${acc}%\`;
  }).join(', ');
  
  return \`<div style="position:relative; width:\${size}px; height:\${size}px; border-radius:50%; background: conic-gradient(\${stops}); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 6px rgba(0,0,0,0.05) inset; margin:0 auto; flex-shrink:0;">
    <div style="position:absolute; width:\${innerSize}px; height:\${innerSize}px; background:var(--ceo-card); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <b style="font-size:20px; color:var(--ceo-ink);">\${centerText}</b>
      <span style="font-size:12px; color:var(--ceo-muted); margin-top:2px;">\${centerSub}</span>
    </div>
  </div>\`;
}

function svgTargetActual() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const actual = [25, 38, 52, 70, 86, 101, 117, 134, 150, 168, 184, 186];
  const target = [40, 55, 70, 85, 100, 120, 140, 158, 178, 195, 210, 215];
  const proj = [null, null, null, null, null, null, null, null, null, 168, 185, 224];
  
  const w = 1000, h = 320;
  const max = 250;
  
  const mapY = (v) => h - (v / max) * h;
  const mapX = (i) => 65 + i * ((w - 75) / (months.length - 1));
  
  const actualPts = actual.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const targetPts = target.map((v, i) => \`\${mapX(i)},\${mapY(v)}\`).join(' ');
  const projPts = proj.map((v, i) => v !== null ? \`\${mapX(i)},\${mapY(v)}\` : '').filter(Boolean).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let y = mapY(i*50);
    grids += \`<line x1="65" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="55" y="\${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">\${i*50} Cr</text>\`;
  }
  
  let xLabels = months.map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 26}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+40}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    \${grids}
    \${xLabels}
    <polyline points="\${targetPts}" fill="none" stroke="var(--ceo-red)" stroke-width="3" stroke-dasharray="6"/>
    <polyline points="\${projPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="3" stroke-dasharray="6" opacity="0.6"/>
    <polyline points="\${actualPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="3.5"/>
    \${actual.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapY(v)}" r="6" fill="var(--ceo-blue)" stroke="#fff" stroke-width="2"/>\`).join('')}
  </svg>\`;
}

function svgCollectionChart() {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const d_due = [42, 45, 48, 52, 58, 61, 64];
  const d_col = [40, 43, 46, 50, 56, 59, 62];
  const d_eff = [95, 95.5, 95.8, 96, 96.2, 96.3, 96.4];
  
  const w = 800, h = 260;
  const maxBar = 80;
  const mapYBar = (v) => h - (v / maxBar) * h;
  const mapX = (i) => 65 + i * ((w - 85) / (months.length - 1));
  const mapYEff = (v) => h - ((v - 90) / 10) * h;
  
  let bars = d_due.map((v, i) => \`<rect x="\${mapX(i) - 22}" y="\${mapYBar(v)}" width="20" height="\${h-mapYBar(v)}" fill="var(--ceo-blue)" rx="2"/>\`).join('') +
             d_col.map((v, i) => \`<rect x="\${mapX(i) + 2}" y="\${mapYBar(v)}" width="20" height="\${h-mapYBar(v)}" fill="var(--ceo-green)" rx="2"/>\`).join('');
  
  const effPts = d_eff.map((v, i) => \`\${mapX(i)},\${mapYEff(v)}\`).join(' ');
  
  let grids = '';
  for(let i=0; i<=4; i++){
    let y = mapYBar(i*20);
    grids += \`<line x1="65" y1="\${y}" x2="\${w}" y2="\${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>\`;
    grids += \`<text x="55" y="\${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">\${i*20}</text>\`;
  }
  
  let xLabels = months.map((m, i) => \`<text x="\${mapX(i)}" y="\${h + 26}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">\${m}</text>\`).join('');
  
  return \`<svg width="100%" height="100%" viewBox="0 -10 \${w} \${h+40}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    \${grids}
    \${bars}
    <polyline points="\${effPts}" fill="none" stroke="var(--ceo-red)" stroke-width="3"/>
    \${d_eff.map((v, i) => \`<circle cx="\${mapX(i)}" cy="\${mapYEff(v)}" r="6" fill="var(--ceo-red)" stroke="#fff" stroke-width="2"/>
    <text x="\${mapX(i)}" y="\${mapYEff(v) - 14}" font-size="11" fill="var(--ceo-red)" text-anchor="middle" font-weight="800">\${v}%</text>
    \`).join('')}
    \${xLabels}
  </svg>\`;
}

function svgTatBar() {
  const data = [{ d: '< 1 Day', v: 34 }, { d: '1-2 Days', v: 28 }, { d: '2-3 Days', v: 18 }, { d: '3-5 Days', v: 14 }, { d: '> 5 Days', v: 6 }];
  const w = 600, h = 180;
  const max = 40;
  const mapY = (v) => h - (v / max) * h;
  const bw = (w / data.length) - 24;
  
  let svg = \`<svg width="100%" height="100%" viewBox="0 -20 \${w} \${h+45}" preserveAspectRatio="none" style="overflow:visible; display:block;">\`;
  svg += data.map((d, i) => {
    let x = i * (w / data.length) + 12;
    let y = mapY(d.v);
    let bar = \`<rect x="\${x}" y="\${y}" width="\${bw}" height="\${h-y}" fill="var(--ceo-blue)" rx="4"/>\`;
    let label = \`<text x="\${x + bw/2}" y="\${h + 22}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">\${d.d}</text>\`;
    let val = \`<text x="\${x + bw/2}" y="\${y - 10}" font-size="15" fill="var(--ceo-ink)" font-weight="800" text-anchor="middle">\${d.v}%</text>\`;
    return bar + label + val;
  }).join('');
  svg += \`</svg>\`;
  return svg;
}

function svgMap() {
  const w = 280, h = 240;
  return \`<svg width="100%" height="100%" viewBox="0 0 \${w} \${h}" style="filter:drop-shadow(0 10px 16px rgba(0,0,0,0.1)); display:block; max-width:280px; margin:0 auto;">
    <path d="M120 20 l35 15 15-5 10 20 25 5 5 25 30 5 10 25 -15 20 5 25 -25 10 -10 30 -30 5 -15-25 -30-10 -15-30 -30-5 -5-25 15-20 -20-15 5-30 25-10 15 15 z" fill="var(--ceo-blue-soft)" stroke="white" stroke-width="2"/>
    <path d="M95 65 l35-15 25 20 -5 30 20 25 -20 25 -30-5 -15-25 -25-5 5-25 z" fill="var(--ceo-blue)" stroke="white" stroke-width="2"/>
    <path d="M155 60 l35 5 5 25 -20 15 -25-15 z" fill="var(--ceo-blue-2)" stroke="white" stroke-width="2"/>
    <path d="M130 150 l30 5 15 25 -25 20 -20-20 z" fill="var(--ceo-blue-3)" stroke="white" stroke-width="2"/>
  </svg>\`;
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
  
  window.kpiData = [
    { t: 'Total AUM', v: '₹1,248 Cr', d: '12.5%', up: true, c: '#2563eb', i: 'indian-rupee', tone: 'blue', desc: 'Total Assets Under Management', metrics: [['YoY Growth', '+18.4%'], ['MoM Growth', '+3.2%'], ['Target', '₹1,220 Cr'], ['Achievement', '102.3%']], chartData: [980, 1015, 1040, 1085, 1120, 1155, 1180, 1205, 1228, 1248] },
    { t: 'Disbursement', v: '₹186 Cr', d: '28.4%', up: true, c: '#dc2626', i: 'receipt', tone: 'red', desc: 'Total funds disbursed to borrowers', metrics: [['MTD', '₹186 Cr'], ['Target', '₹215 Cr'], ['Achievement', '86.5%'], ['Projected', '₹224 Cr']], chartData: [112, 125, 134, 141, 150, 158, 165, 172, 179, 186] },
    { t: 'Sanctioned', v: '₹214 Cr', d: '31.2%', up: true, c: '#16a34a', i: 'badge-check', tone: 'teal', desc: 'Total loan amounts sanctioned', metrics: [['MTD', '₹214 Cr'], ['Target', '₹250 Cr'], ['Achievement', '85.6%'], ['Projected', '₹260 Cr']], chartData: [135, 148, 155, 166, 174, 181, 190, 198, 205, 214] },
    { t: 'Active Customers', v: '52,318', d: '8.2%', up: true, c: '#7c3aed', i: 'users', tone: 'violet', desc: 'Total active borrowing customers', metrics: [['YoY Growth', '+15.2%'], ['New (MTD)', '+1,118'], ['Closed (MTD)', '-240'], ['Net Gain', '+878']], chartData: [42000, 43200, 44500, 45800, 47000, 48200, 49500, 50300, 51200, 52318] },
    { t: 'Approval Ratio', v: '78.3%', d: '8.1%', up: true, c: '#16a34a', i: 'percent', tone: 'teal', desc: 'Percentage of applications approved', metrics: [['Total Apps', '8,214'], ['Approved', '6,431'], ['Rejected', '1,783'], ['Pending', '124']], chartData: [71, 72, 73, 74, 74.5, 75.2, 76, 76.8, 77.5, 78.3] },
    { t: 'Collection Efficiency', v: '96.4%', d: '4.1%', up: true, c: '#2563eb', i: 'gauge', tone: 'blue', desc: 'Current month collection efficiency', metrics: [['Due', '₹164 Cr'], ['Collected', '₹158 Cr'], ['Efficiency', '96.4%'], ['Remaining', '₹6 Cr']], chartData: [92, 93, 93.5, 94, 94.5, 95, 95.4, 95.8, 96.1, 96.4] },
    { t: 'Portfolio at Risk', v: '2.6%', d: '0.8%', up: false, c: '#d97706', i: 'alert-triangle', tone: 'amber', desc: 'Percentage of portfolio at risk (PAR 30+)', metrics: [['PAR Amount', '₹32.4 Cr'], ['Total Portfolio', '₹1,248 Cr'], ['Risk Target', '< 3.0%'], ['Status', 'Healthy']], chartData: [3.4, 3.3, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7, 2.65, 2.6] },
    { t: 'NPA', v: '1.8%', d: '0.4%', up: false, c: '#dc2626', i: 'shield-alert', tone: 'red', desc: 'Non-Performing Assets (90+ DPD)', metrics: [['NPA Amount', '₹22.4 Cr'], ['Provisioning', '74.2%'], ['NPA Target', '< 2.0%'], ['Status', 'Healthy']], chartData: [2.4, 2.3, 2.2, 2.15, 2.1, 2.0, 1.95, 1.9, 1.85, 1.8] }
  ];

  window.openCeoKpiModal = function(index) {
    const k = window.kpiData[index];
    const modalHtml = \`
      <div id="ceo-modal-backdrop" onclick="closeCeoKpiModal(event)" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); padding:20px; box-sizing:border-box;">
        <div class="ceo-modal-content" onclick="event.stopPropagation()" style="background:white; border-radius:16px; width:100%; max-width:1100px; max-height:calc(100vh - 40px); overflow-y:auto; box-shadow:0 24px 48px rgba(0,0,0,0.3); display:flex; flex-direction:column;">
          
          <div style="padding:32px 36px; border-bottom:1px solid var(--ceo-line); display:flex; align-items:flex-start; justify-content:space-between; position:sticky; top:0; background:white; z-index:10;">
            <div style="display:flex; align-items:center; gap:20px;">
              <span class="ceo-ic \${k.tone}" style="display:flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:16px; flex-shrink:0;">\${_lucide(k.i)}</span>
              <div>
                <h2 style="margin:0 0 8px 0; font-size:32px; font-weight:800; color:var(--ceo-ink); display:flex; align-items:center; gap:16px; line-height:1;">\${k.t} <span style="color:var(--ceo-blue);">\${k.v}</span></h2>
                <div style="display:flex; align-items:center; gap:16px; font-size:14px;">
                  <span style="color:var(--ceo-muted); font-weight:600;">\${k.desc}</span>
                  <span style="display:flex; align-items:center; gap:6px; font-weight:800; color:\${k.up ? 'var(--ceo-green)' : 'var(--ceo-red)'}; background:\${k.up ? 'var(--ceo-green-soft)' : 'var(--ceo-red-soft)'}; padding:6px 12px; border-radius:8px;">
                    \${k.up ? '↑' : '↓'} \${k.d} vs last period
                  </span>
                </div>
              </div>
            </div>
            <button onclick="closeCeoKpiModal()" style="background:var(--ceo-bg); border:1px solid var(--ceo-line); color:var(--ceo-ink); cursor:pointer; padding:12px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.2s;">
              \${_lucide('x')}
            </button>
          </div>
          
          <div style="padding:36px;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:40px;">
              \${k.metrics.map(m => \`
                <div style="background:var(--ceo-bg); padding:24px; border-radius:12px; border:1px solid var(--ceo-line); display:flex; flex-direction:column; gap:8px;">
                  <span style="font-size:14px; color:var(--ceo-muted); font-weight:700;">\${m[0]}</span>
                  <b style="font-size:28px; color:var(--ceo-ink); line-height:1;">\${m[1]}</b>
                </div>
              \`).join('')}
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
              <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--ceo-ink);">Historical Trend (10 Months)</h3>
              <div class="ceo-tabs" style="display:flex; background:var(--ceo-bg); padding:4px; border-radius:8px; gap:4px; border:1px solid var(--ceo-line);">
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">MTD</button>
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">QTD</button>
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">YTD</button>
                <button class="ceo-button on" style="background:white; padding:8px 16px; border:none; font-weight:700; color:var(--ceo-blue); box-shadow:0 2px 4px rgba(0,0,0,0.05); border-radius:6px; cursor:pointer;">FY 2026-27</button>
              </div>
            </div>
            
            <div style="width:100%; height:450px; min-height:420px; position:relative; background:white; border:1px solid var(--ceo-line); border-radius:16px; padding:24px; box-sizing:border-box;">
              \${svgModalLineChart(k.chartData, k.c)}
            </div>
          </div>

        </div>
      </div>
    \`;
    const container = document.getElementById('ceo-modal-root');
    if(container) {
      container.innerHTML = modalHtml;
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
    }
  };

  window.closeCeoKpiModal = function(e) {
    if(e && e.target.id !== 'ceo-modal-backdrop') return;
    const container = document.getElementById('ceo-modal-root');
    if(container) {
      container.innerHTML = '';
      document.body.style.overflow = '';
    }
  };

  window.addEventListener('keydown', function(e) {
    if(e.key === 'Escape') window.closeCeoKpiModal();
  });

  const html = \`
  <style>
    :root {
      --ceo-blue: #2563eb;
      --ceo-blue-2: #3b82f6;
      --ceo-blue-3: #60a5fa;
      --ceo-blue-soft: #eff6ff;
      --ceo-blue-tint: #f8fafc;
      --ceo-red: #dc2626;
      --ceo-red-soft: #fef2f2;
      --ceo-green: #16a34a;
      --ceo-green-soft: #f0fdf4;
      --ceo-amber: #d97706;
      --ceo-amber-soft: #fffbeb;
      --ceo-violet: #7c3aed;
      --ceo-violet-soft: #f5f3ff;
      --ceo-teal: #0d9488;
      --ceo-teal-soft: #f0fdfa;
      --ceo-ink: #0f172a;
      --ceo-muted: #64748b;
      --ceo-line: #e2e8f0;
      --ceo-bg: #f8fafc;
      --ceo-card: #ffffff;
    }
    
    .ceo-ic.blue { background: var(--ceo-blue-soft); color: var(--ceo-blue); }
    .ceo-ic.red { background: var(--ceo-red-soft); color: var(--ceo-red); }
    .ceo-ic.green { background: var(--ceo-green-soft); color: var(--ceo-green); }
    .ceo-ic.amber { background: var(--ceo-amber-soft); color: var(--ceo-amber); }
    .ceo-ic.violet { background: var(--ceo-violet-soft); color: var(--ceo-violet); }
    .ceo-ic.teal { background: var(--ceo-teal-soft); color: var(--ceo-teal); }
    .ceo-ic.muted { background: var(--ceo-bg); color: var(--ceo-muted); }
    
    .dashboard-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; align-items: stretch; box-sizing: border-box; min-width: 0; width: 100%; margin-bottom:24px; }
    .ceo-root { box-sizing: border-box; min-width: 0; width: 100%; max-width: 100%; overflow-x: hidden; padding-bottom: 60px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:var(--ceo-bg);}
    .ceo-main { box-sizing: border-box; min-width: 0; width: 100%; padding:24px;}
    .ceo-content { box-sizing: border-box; min-width: 0; width: 100%; }
    
    .span-8 { grid-column: span 8; } .span-7 { grid-column: span 7; } .span-6 { grid-column: span 6; } .span-5 { grid-column: span 5; } .span-4 { grid-column: span 4; } .span-3 { grid-column: span 3; } .span-2 { grid-column: span 2; }
    
    .ceo-kpis { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; box-sizing: border-box; width: 100%; }
    
    .ceo-kpi-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(37,99,235,0.08) !important; border-color: rgba(37,99,235,0.4) !important; z-index:1; }
    
    .funnel-row { display: grid; grid-template-columns: minmax(130px, 180px) minmax(100px, 1fr) auto; gap: 16px; align-items: center; width: 100%; min-width: 0; box-sizing: border-box; margin-bottom:14px; min-height: 28px; }
    .funnel-bar-container { width: 100%; min-width: 0; height: 26px; background: var(--ceo-line); border-radius: 6px; overflow: hidden; }
    .funnel-bar { height: 100%; border-radius: 6px; }

    @media (max-width: 1440px) {
      .ceo-kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); gap:16px; margin-bottom:24px; }
      .span-7 { grid-column: span 6; } .span-3 { grid-column: span 3; } .span-2 { grid-column: span 3; } .span-5 { grid-column: span 6; }
    }
    
    @media (max-width: 1199px) {
      .dashboard-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      .span-8, .span-7, .span-6, .span-5 { grid-column: span 6; }
      .span-4, .span-3, .span-2 { grid-column: span 3; }
    }
    
    @media (max-width: 767px) {
      .dashboard-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .ceo-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .span-8, .span-7, .span-6, .span-5, .span-4, .span-3, .span-2 { grid-column: span 1; }
      .funnel-row { grid-template-columns: 1fr auto; gap: 8px; margin-bottom:16px; }
      .funnel-bar-container { grid-column: 1 / -1; }
    }
    
    @media (max-width: 420px) {
      .ceo-kpis { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    }
  </style>
  <div class="ceo-root">
    <div id="ceo-modal-root"></div>
    <div class="ceo-main">
      <div class="ceo-content">
        
        <div class="ceo-banner" style="position:relative; margin-bottom:24px; display:flex; flex-wrap:wrap; align-items:center; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); border-radius:16px; overflow:hidden; min-height:130px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border:1px solid rgba(37,99,235,0.15);">
          <svg style="position:absolute; right:0; top:0; width:50%; height:100%; pointer-events:none; opacity:0.6;" viewBox="0 0 500 130" preserveAspectRatio="none">
            <path d="M0 130 L500 130 L500 0 L150 0 Z" fill="url(#gradShape)" />
            <defs>
              <linearGradient id="gradShape" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="rgba(37,99,235,0)" />
                <stop offset="100%" stop-color="rgba(37,99,235,0.12)" />
              </linearGradient>
            </defs>
          </svg>
          
          <div style="flex:1 1 300px; padding:28px 36px; position:relative; z-index:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
               <div style="width:28px; height:28px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.06);"><img src="/favicon.png" style="width:18px; height:18px;" onerror="this.style.display='none'" /></div>
               <b style="color:var(--ceo-blue); font-size:13px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">NAMDEV FINVEST</b>
            </div>
            <h1 style="font-size:28px; font-weight:800; margin:0 0 6px 0; color:var(--ceo-ink); letter-spacing:-0.5px;">CEO Executive Command Center</h1>
            <p style="font-size:15px; margin:0; color:var(--ceo-muted); font-weight:500;">Real-time view of lending, risk, collections and operational performance</p>
          </div>

          <div style="display:flex; align-items:center; gap:16px; padding:24px 36px; position:relative; z-index:1; flex:0 0 auto;">
            <div style="text-align:right;">
              <b style="display:block; font-size:18px; color:var(--ceo-ink); font-weight:800;">Jitendra Tanwar</b>
              <span style="font-size:14px; color:var(--ceo-blue); font-weight:700;">MD & CEO</span>
              <span style="display:block; font-size:11px; color:var(--ceo-muted); margin-top:4px; font-weight:600;">Namdev Finvest Pvt. Ltd.</span>
            </div>
            <img src="/ceo-bust.png" style="height:86px; width:86px; object-fit:cover; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(37,99,235,0.15);" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%2394a3b8\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\"/></svg>'" />
          </div>
        </div>

        <div class="ceo-kpis">
          \${window.kpiData.map((k,i) => \`
            <div class="ceo-kpi-card" onclick="window.openCeoKpiModal(\${i})" style="box-sizing:border-box; background:white; border-radius:16px; padding:22px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border:1px solid var(--ceo-line); display:flex; flex-direction:column; min-height: 140px; min-width:0; cursor:pointer; transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position:relative;">
              <div class="ceo-kpi-t" style="display:flex; align-items:center; gap:12px; color:var(--ceo-muted); font-size:13px; margin-bottom:16px; min-width:0;">
                 <span class="ceo-ic \${k.tone}" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; flex-shrink:0;">\${_lucide(k.i)}</span>
                 <span style="font-weight:700; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${k.t}</span>
              </div>
              <strong style="font-size:28px; color:var(--ceo-ink); margin-bottom:14px; font-weight:800; line-height:1; letter-spacing:-0.5px;">\${k.v}</strong>
              <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto;">
                 <div style="display:flex; flex-direction:column; gap:4px;">
                   <small style="font-size:14px; color:\${k.up ? 'var(--ceo-green)' : 'var(--ceo-red)'}; display:flex; align-items:center; gap:4px; font-weight:800;">
                      \${k.up ? '↑' : '↓'} \${k.d}
                   </small>
                   <span style="font-size:11px; color:var(--ceo-muted); font-weight:600;">vs last period</span>
                 </div>
                 <div style="width:120px; height:50px; min-height:50px; margin-left:auto;">
                   \${svgSpark(k.chartData, k.c, i >= 6)}
                 </div>
              </div>
            </div>
          \`).join('')}
        </div>

        <div class="dashboard-grid">
          <div class="span-7">
            \${_card('Target vs Actual Disbursement', \`<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-blue); font-weight:700; font-size:12px; background:var(--ceo-blue-soft); padding:6px 12px; border-radius:20px; cursor:pointer;">MTD \${_lucide("chevron-right")}</div>\`, \`
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:20px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-ink); font-weight:800;">₹186 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Actual</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-ink); font-weight:800;">₹215 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Target</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-green); font-weight:800;">86.5%</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Achievement</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-blue); font-weight:800;">₹224 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Projected</span></div>
              </div>
              <div style="flex:1; width:100%; min-height:300px; position:relative; margin-top:10px;">
                \${svgTargetActual()}
              </div>
              <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:28px; font-size:13px; color:var(--ceo-muted); font-weight:600; margin-top:24px;">
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; border-radius:50%; background:var(--ceo-blue);"></i>Actual</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-red);"></i>Target</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-blue); border-top:3px dashed transparent;"></i>Projection</span>
              </div>
            \`, 'min-height: 460px;')}
          </div>
          <div class="span-2">
            \${_card('Product Mix', \`<div style="display:flex; gap:4px; background:var(--ceo-bg); padding:4px; border-radius:8px; border:1px solid var(--ceo-line);"><button style="background:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.05); color:var(--ceo-blue);">AUM</button></div>\`, \`
              <div style="display:flex; flex-direction:column; align-items:center; gap:36px; flex:1; padding:24px 0;">
                \${cssDonut([
                  {val: 22, c: '#2563eb'}, {val: 29, c: '#dc2626'}, {val: 25, c: '#7c3aed'}, {val: 10, c: '#d97706'}, {val: 14, c: '#f59e0b'}
                ], '₹1,248 Cr', 'Total AUM', 180, 135)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px;">
                  \${[['Two Wheeler', '22%', '₹275 Cr', '#2563eb'], ['MSME', '29%', '₹362 Cr', '#dc2626'], ['LAP', '25%', '₹312 Cr', '#7c3aed'], ['Solar Loan', '10%', '₹225 Cr', '#d97706'], ['Tractor Loan', '14%', '₹174 Cr', '#f59e0b']].map(p => \`
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:14px; font-weight:800;">\${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; font-weight:600; width:65px; text-align:right; flex-shrink:0;">\${p[2]}</em>
                  </li>\`).join('')}
                </ul>
              </div>
            \`, 'min-height: 400px;')}
          </div>
          <div class="span-3">
            \${_card('Conversion Funnel', \`<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">MTD</div>\`, \`
              <div style="display:flex; flex-direction:column; flex:1; padding-top:16px; min-height:300px;">
                \${[['Leads', 12442, '100%'], ['Login / Application', 8214, '66%'], ['Credit', 4982, '60.6%'], ['Sanction', 2914, '58.5%'], ['Disbursed', 1618, '55.5%']].map((f, i, arr) => \`
                  <div class="funnel-row">
                    <span style="color:var(--ceo-ink); font-weight:700; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="\${f[0]}">\${f[0]}</span>
                    <div class="funnel-bar-container">
                      <div class="funnel-bar" style="width:\${f[1]/124.42}%; background:\${i===4 ? 'var(--ceo-green)' : 'var(--ceo-blue)'};"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; font-size:14px;">
                      <b style="color:var(--ceo-ink); font-weight:800; white-space:nowrap;">\${f[1].toLocaleString()}</b>
                      <span style="font-weight:600; color:var(--ceo-muted); white-space:nowrap;">\${f[2]}</span>
                    </div>
                  </div>
                \`).join('')}
              </div>
              <div style="margin-top:auto; padding-top:24px; border-top:1px dashed var(--ceo-line); display:flex; justify-content:space-between; font-size:15px; align-items:center;">
                 <span style="color:var(--ceo-muted); font-weight:600;">Lead to Disbursal Conversion</span>
                 <b style="color:var(--ceo-ink); font-size:18px; font-weight:800;">13.0%</b>
              </div>
            \`, 'min-height: 400px;')}
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="span-5">
            \${_card('Branch Performance', \`<div style="font-size:13px; font-weight:700; color:var(--ceo-blue); cursor:pointer;">View All</div>\`, \`
              <div style="width:100%; overflow-x:auto;">
                <table style="width:100%; min-width:400px; font-size:14px; border-collapse:collapse; text-align:left;">
                  <thead>
                    <tr style="border-bottom:2px solid var(--ceo-line); color:var(--ceo-muted);">
                      <th style="padding:14px 4px; font-weight:700; width:24px;">#</th>
                      <th style="padding:14px 4px; font-weight:700;">Branch</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Target</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Actual</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Ach%</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${[['Jaipur VKI', '25', '28.4', '114%', '18%', '96%'], ['Sanganer', '24', '26.2', '110%', '12%', '95%'], ['Udaipur', '18', '18.6', '103%', '9%', '97%'], ['Kota', '15', '16.8', '112%', '14%', '96%'], ['Jodhpur', '14', '17.4', '124%', '20%', '94%']].map((r, i) => \`
                    <tr style="border-bottom:1px solid var(--ceo-line);">
                      <td style="padding:18px 4px; color:var(--ceo-muted); font-weight:600;">\${i + 1}</td>
                      <td style="padding:18px 4px; font-weight:800; color:var(--ceo-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${r[0]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-muted); text-align:right; font-weight:600;">\${r[1]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-ink); text-align:right; font-weight:800;">\${r[2]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-green); font-weight:800; text-align:right;">\${r[3]}</td>
                    </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
            \`, 'min-height: 380px;')}
          </div>
          <div class="span-3">
            \${_card('Portfolio Quality', \`<div style="font-size:12px; font-weight:700; color:var(--ceo-ink); background:var(--ceo-bg); padding:4px 10px; border-radius:12px; border:1px solid var(--ceo-line);">AUM</div>\`, \`
              <div style="display:flex; flex-direction:column; align-items:center; gap:32px; flex:1; padding:24px 0;">
                \${cssDonut([
                  {val: 94.2, c: '#0f766e'}, {val: 3.1, c: '#2563eb'}, {val: 1.2, c: '#d97706'}, {val: 0.8, c: '#b91c1c'}, {val: 0.7, c: '#991b1b'}
                ], '1.8%', 'NPA', 170, 120)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:18px;">
                  \${[['Standard', '94.2%', '1,175', '#0f766e'], ['DPD 1-30', '3.1%', '39', '#2563eb'], ['DPD 31-60', '1.2%', '15', '#d97706'], ['DPD 61-90', '0.8%', '10', '#b91c1c'], ['NPA 90+', '0.7%', '9', '#991b1b']].map(p => \`
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: \${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:15px; font-weight:800;">\${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; font-weight:600; width:45px; text-align:right;">\${p[2]}</em>
                  </li>\`).join('')}
                </ul>
              </div>
            \`, 'min-height: 380px;')}
          </div>
          <div class="span-4">
            \${_card('Collection Performance', \`<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">MTD</div>\`, \`
               <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-ink); font-weight:800;">₹164 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Due</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-ink); font-weight:800;">₹158 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Collected</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-green); font-weight:800;">96.4%</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Efficiency</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-red); font-weight:800;">₹6 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Remaining</span></div>
              </div>
              <div style="flex:1; width:100%; min-height:280px; position:relative; margin-top:10px;">
                \${svgCollectionChart()}
              </div>
              <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:24px; font-size:13px; color:var(--ceo-muted); font-weight:600; margin-top:24px;">
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; background:var(--ceo-blue); border-radius:3px;"></i>Due</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; background:var(--ceo-green); border-radius:3px;"></i>Collected</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-red);"></i>Efficiency</span>
              </div>
            \`, 'min-height: 420px;')}
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="span-4">
            \${_card('Credit Command Center', '', \`
              <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:20px; margin-bottom:28px;">
                \${[['clipboard-list', '127', 'Credit Queue', 'blue'], ['clock-3', '3.8d', 'Avg TAT', 'violet'], ['shield-alert', '18', 'Fraud Flags', 'red'], ['gavel', '8', 'Legal Pending', 'red']].map(([I, n, l, t]) => \`
                  <div style="display:flex; align-items:center; gap:16px; padding:20px; border:1px solid var(--ceo-line); border-radius:12px; background:var(--ceo-bg); min-width:0;">
                    <span class="ceo-ic \${t}" style="display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:10px; flex-shrink:0;">\${_lucide(I)}</span>
                    <div style="display:flex; flex-direction:column; min-width:0;">
                      <b class="\${t}" style="font-size:24px; line-height:1; font-weight:800; margin-bottom:6px;">\${n}</b>
                      <small style="font-size:13px; color:var(--ceo-muted); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${l}</small>
                    </div>
                  </div>
                \`).join('')}
              </div>
              <div style="display:flex; flex-direction:column; flex:1; border-top:1px solid var(--ceo-line); padding-top:24px;">
                  <h3 style="font-size:15px; margin:0 0 20px 0; font-weight:700; color:var(--ceo-ink);">Credit TAT Analysis <small style="color:var(--ceo-muted); font-weight:600;">(Applications)</small></h3>
                  <div style="flex:1; width:100%; min-height:180px; position:relative;">
                    \${svgTatBar()}
                  </div>
              </div>
            \`, 'min-height: 400px;')}
          </div>
          <div class="span-4">
            \${_card('Risk Grade Distribution', '', \`
              <div style="display:flex; flex-direction:column; align-items:center; gap:36px; flex:1; padding:24px 0;">
                \${cssDonut([
                  {val: 34, c: '#16a34a'}, {val: 28, c: '#0ea5e9'}, {val: 18, c: '#eab308'}, {val: 12, c: '#f97316'}, {val: 8, c: '#ef4444'}
                ], '284', 'Cases', 170, 120)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:18px;">
                  \${[['Grade A', '34%', '#16a34a'], ['Grade B', '28%', '#0ea5e9'], ['Grade C', '18%', '#eab308'], ['Grade D', '12%', '#f97316'], ['Grade E', '8%', '#ef4444']].map(p => \`
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: \${p[2]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:15px; font-weight:800;">\${p[1]}</b>
                  </li>\`).join('')}
                </ul>
              </div>
            \`, 'min-height: 400px;')}
          </div>
          <div class="span-4">
            \${_card('Geographic Performance', \`<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">Disbursement</div>\`, \`
              <div style="display:flex; flex-direction:column; align-items:center; gap:32px; flex:1; padding-top:16px;">
                <div style="width:100%; min-height:220px; flex:1; display:flex; align-items:center; justify-content:center; position:relative;">
                  \${svgMap()}
                </div>
                <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px; width:100%;">
                  \${[['Rajasthan', '482', '38.6%'], ['North', '312', '25.0%'], ['West', '224', '18.0%'], ['Central', '114', '11.8%'], ['East', '82', '6.6%']].map(([n, v, p], i) => \`
                    <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                      <i style="width:12px; height:12px; border-radius:3px; background: \${i ? 'var(--ceo-blue-soft)' : 'var(--ceo-blue)'}; flex-shrink:0;"></i>
                      <span style="flex:1; color:var(--ceo-ink); font-weight:700;">\${n}</span>
                      <em style="color:var(--ceo-muted); font-style:normal; font-weight:600;">₹\${v} Cr</em>
                      <b style="color:var(--ceo-ink); width:50px; text-align:right; font-weight:800;">\${p}</b>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            \`, 'min-height: 440px;')}
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
  console.log('Successfully injected size-adjusted CEO dashboard.');
}
