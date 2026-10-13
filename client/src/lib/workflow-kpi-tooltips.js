// Read existing chart values and geometry; never invent milestone measurements.
export const workflowKpiTooltipsScript = `<script>
(() => {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = '/workflow/kpi-tooltips.css';
  document.head.append(sheet);
  const tooltip = document.createElement('div');
  tooltip.className = 'nf-kpi-tooltip';
  tooltip.id = 'nfKpiTooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let active = null;
  function hide() { tooltip.hidden = true; active = null; }
  function show(el, text, x, y) {
    active = el;
    tooltip.textContent = text;
    tooltip.hidden = false;
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = Math.max(12, Math.min(x + 12, innerWidth - rect.width - 12)) + 'px';
    tooltip.style.top = Math.max(12, Math.min(y + 14, innerHeight - rect.height - 12)) + 'px';
  }
  function bind(el, text) {
    el.setAttribute('aria-describedby', tooltip.id);
    el.addEventListener('pointermove', event => show(el, text, event.clientX, event.clientY));
    el.addEventListener('pointerleave', hide);
    el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); show(el, text, r.left, r.bottom); });
    el.addEventListener('blur', hide);
    el.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') show(el, text, event.clientX, event.clientY); });
  }
  function enhance() {
    document.querySelectorAll('.nf-line-chart:not([data-milestones])').forEach(svg => {
      svg.dataset.milestones = 'true';
      const dots = Array.from(svg.querySelectorAll('.dot'));
      const target = svg.querySelector('.target');
      const points = (target?.getAttribute('points') || '').trim().split(/\\s+/).map(p => p.split(',').map(Number));
      const grid = Array.from(svg.querySelectorAll('.grid')).map(l => Number(l.getAttribute('y1')));
      const baseline = Math.max(...grid);
      const height = svg.viewBox.baseVal.height;
      const width = svg.viewBox.baseVal.width;
      dots.forEach((dot, i) => {
        const title = dot.querySelector('title');
        const original = title?.textContent || '';
        const match = original.match(/^(.+): ₹([\\d.]+) Cr$/);
        if (!match) return;
        const actual = Number(match[2]);
        const x = Number(dot.getAttribute('cx'));
        const y = Number(dot.getAttribute('cy'));
        const targetY = points[i]?.[1];
        const targetValue = Number.isFinite(targetY) && baseline > y ? Math.round(actual * (baseline - targetY) / (baseline - y)) : null;
        const period = window.nfCeoPeriod === 'Today' ? match[1] + ':00' : match[1];
        const text = period + ' · Demo disbursement' + '\\nActual: ₹' + actual + ' Cr' + (targetValue === null ? '' : '\\nTarget: ₹' + targetValue + ' Cr\\nAchievement: ' + (actual / Math.max(1,targetValue) * 100).toFixed(1) + '%');
        const previous = dots[i-1];
        const next = dots[i+1];
        const left = previous ? (x + Number(previous.getAttribute('cx'))) / 2 : 0;
        const right = next ? (x + Number(next.getAttribute('cx'))) / 2 : width;
        const hit = document.createElementNS('http://www.w3.org/2000/svg','rect');
        hit.setAttribute('x', String(left)); hit.setAttribute('y', '0');
        hit.setAttribute('width', String(right-left)); hit.setAttribute('height', String(height-18));
        hit.setAttribute('class', 'nf-kpi-hit'); hit.setAttribute('tabindex', '0');
        hit.setAttribute('role','img'); hit.setAttribute('aria-label',text);
        svg.append(hit);
        title?.remove();
        bind(hit, text);
      });
    });
    document.querySelectorAll('.nf-exec-kpi, .nf-personal-kpis > div, .nf-product-mix-list > button, .nf-modern-funnel > button, .nf-risk-list > button, .nf-dept-health > button, .nf-region-list > button, .nf-leader-table > button, .nf-chart-summary > div').forEach(el => {
      if (el.dataset.kpiTooltip) return;
      el.dataset.kpiTooltip = 'true';
      const text = el.innerText.trim().replace(/Drag to reorder/g, '').replace(/↗/g,'').trim();
      if (!text) return;
      bind(el, text + '\\nDemo data');
    });
    if (active && !active.isConnected) hide();
  }
  new MutationObserver(enhance).observe(document.getElementById('mainContent') || document.body, {childList:true,subtree:true});
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  document.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  enhance();
})();
</script>`;