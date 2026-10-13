// Demo list toolkit: search, column filter, sort, pagination, count, clear and role-gated export for every workspace table.
// Also enforces the CEO read-only rule on action buttons. Browser-local demo; not server authorization.
export const workflowListToolkitScript = String.raw`<script>
(() => {
  const NO_EXPORT = ['BSO'];
  const READ_ONLY = ['CEO'];
  const BLOCK = /^(approve|reject|send back|edit|delete|save|submit|disburse|sanction|assign|reassign|create|add |new |\+)/i;
  const role = () => { try { return (typeof currentUser !== 'undefined' && currentUser.role) || 'CEO'; } catch (e) { return 'CEO'; } };
  const css = document.createElement('style');
  css.textContent = '.nlt-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0;font-size:12px}.nlt-bar input,.nlt-bar select,.nlt-pager select{width:auto!important;max-width:220px;height:auto!important;flex:0 0 auto!important;border:1px solid #d6dbe3;border-radius:6px;padding:4px 8px;font-size:12px;background:#fff}.nlt-bar button{border:1px solid #d6dbe3;background:#fff;border-radius:6px;padding:4px 8px;font-size:12px;cursor:pointer}.nlt-bar button:hover{border-color:#D71920;color:#D71920}.nlt-count{color:#64748b;margin-left:auto}.nlt-pager{display:flex;gap:4px;align-items:center;justify-content:flex-end;margin:6px 0;font-size:12px}.nlt-pager button{border:1px solid #d6dbe3;background:#fff;border-radius:6px;padding:2px 8px;cursor:pointer}.nlt-pager button:disabled{opacity:.4;cursor:default}th.nlt-sort{cursor:pointer;user-select:none}th.nlt-sort:after{content:" \\2195";opacity:.35}';
  document.head.appendChild(css);
  const txt = el => (el.textContent || '').trim();

  function enhance(table) {
    if (table.dataset.nlt || table.closest('.modal,#modalRoot,.nf-nav')) return;
    const body = table.tBodies[0]; if (!body) return;
    const head = table.tHead && table.tHead.rows[0]; if (!head) return;
    table.dataset.nlt = '1';
    const all = Array.from(body.rows);
    const st = { q:'', col:-1, val:'', sort:-1, dir:1, size:10, page:0 };
    const bar = document.createElement('div'); bar.className = 'nlt-bar'; bar.setAttribute('data-no-translate','');
    const cols = Array.from(head.cells).map(txt);
    const canExport = !NO_EXPORT.includes(role());
    bar.innerHTML = '<input type="search" placeholder="Search..." aria-label="Search list"><select aria-label="Filter column"><option value="-1">Filter by column</option>' + cols.map((c,i)=>c?'<option value="'+i+'">'+c+'</option>':'').join('') + '</select><select aria-label="Filter value" disabled><option value="">All</option></select><button data-a="clear">Clear filters</button>' + (canExport ? '<button data-a="csv">CSV</button><button data-a="xls">Excel</button><button data-a="pdf">PDF</button><button data-a="print">Print</button>' : '') + '<span class="nlt-count"></span>';
    const pager = document.createElement('div'); pager.className = 'nlt-pager';
    const host = table.closest('.table-wrap,.table-container') || table;
    host.parentNode.insertBefore(bar, host); host.parentNode.insertBefore(pager, host.nextSibling);
    const [q, colSel, valSel] = bar.querySelectorAll('input,select');
    const visible = () => {
      let rows = all.filter(r => (!st.q || txt(r).toLowerCase().includes(st.q)) && (st.col < 0 || !st.val || (r.cells[st.col] && txt(r.cells[st.col]) === st.val)));
      if (st.sort >= 0) rows = rows.slice().sort((a,b) => { const x = txt(a.cells[st.sort]||a), y = txt(b.cells[st.sort]||b); const nx = parseFloat(x.replace(/[^0-9.-]/g,'')), ny = parseFloat(y.replace(/[^0-9.-]/g,'')); return (isNaN(nx)||isNaN(ny) ? x.localeCompare(y) : nx-ny) * st.dir; });
      return rows;
    };
    function draw() {
      const rows = visible(), pages = Math.max(1, Math.ceil(rows.length / st.size));
      st.page = Math.min(st.page, pages - 1);
      const start = st.page * st.size, shown = rows.slice(start, start + st.size);
      all.forEach(r => r.style.display = 'none');
      shown.forEach(r => { r.style.display = ''; body.appendChild(r); });
      bar.querySelector('.nlt-count').textContent = rows.length ? 'Showing ' + (start+1) + '-' + (start+shown.length) + ' of ' + rows.length + (rows.length !== all.length ? ' (filtered from ' + all.length + ')' : '') : 'No matching records';
      pager.innerHTML = 'Rows <select aria-label="Rows per page">' + [10,25,50,100,200].map(n=>'<option'+(n===st.size?' selected':'')+'>'+n+'</option>').join('') + '</select><button data-p="prev"'+(st.page?'':' disabled')+'>Prev</button><span>Page '+(st.page+1)+' of '+pages+'</span><button data-p="next"'+(st.page<pages-1?'':' disabled')+'>Next</button>';
    }
    function rowsData() { return [cols].concat(visible().map(r => Array.from(r.cells).map(txt))); }
    function download(name, data, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type})); a.download = name; a.click(); }
    function printOut() { const w = window.open('', '_blank'); if (!w) return showToast('Allow pop-ups to print.'); w.document.write('<table border=1 cellpadding=4 style="border-collapse:collapse;font:12px sans-serif">' + rowsData().map((r,i)=>'<tr>'+r.map(c=>(i?'<td>':'<th>')+c.replace(/</g,'&lt;')+(i?'</td>':'</th>')).join('')+'</tr>').join('') + '</table>'); w.document.close(); w.print(); }
    q.addEventListener('input', () => { st.q = q.value.trim().toLowerCase(); st.page = 0; draw(); });
    colSel.addEventListener('change', () => { st.col = +colSel.value; st.val = ''; const vals = st.col < 0 ? [] : Array.from(new Set(all.map(r => r.cells[st.col] ? txt(r.cells[st.col]) : ''))).filter(Boolean).sort().slice(0, 200); valSel.innerHTML = '<option value="">All</option>' + vals.map(v=>'<option>'+v.replace(/</g,'&lt;')+'</option>').join(''); valSel.disabled = st.col < 0; st.page = 0; draw(); });
    valSel.addEventListener('change', () => { st.val = valSel.value; st.page = 0; draw(); });
    bar.addEventListener('click', e => { const a = e.target.closest('button') && e.target.closest('button').dataset.a; if (!a) return;
      if (a === 'clear') { q.value = ''; colSel.value = '-1'; colSel.dispatchEvent(new Event('change')); st.q = ''; st.sort = -1; st.page = 0; draw(); return; }
      if (NO_EXPORT.includes(role())) return showToast('Your role is not allowed to export.');
      const csv = rowsData().map(r => r.map(c => '"' + c.replace(/"/g,'""') + '"').join(',')).join('\n');
      if (a === 'csv') download('export.csv', csv, 'text/csv');
      if (a === 'xls') download('export.xls', csv.replace(/","/g,'"\t"'), 'application/vnd.ms-excel');
      if (a === 'pdf' || a === 'print') printOut();
      showToast('Exported ' + (rowsData().length - 1) + ' filtered records.');
    });
    pager.addEventListener('change', e => { st.size = +e.target.value; st.page = 0; draw(); });
    pager.addEventListener('click', e => { const p = e.target.dataset && e.target.dataset.p; if (p === 'prev') st.page--; if (p === 'next') st.page++; if (p) draw(); });
    Array.from(head.cells).forEach((th,i) => { if (!txt(th)) return; th.classList.add('nlt-sort'); th.addEventListener('click', () => { st.dir = st.sort === i ? -st.dir : 1; st.sort = i; draw(); }); });
    draw();
  }
  // Card-list enhancer: same tools for card grids (Partners, Audit, Assets, Travel, CCTV, Admin, Projects).
  const CARD_LISTS = '.v7-module-grid,.nf-corp-list';
  function enhanceCards(grid) {
    if (grid.dataset.nlt || grid.closest('.modal,#modalRoot,.nf-nav')) return;
    const cards = Array.from(grid.children).filter(c => c.nodeType === 1);
    if (cards.length < 4) return;
    grid.dataset.nlt = '1';
    const st = { q:'', size:25, page:0 };
    const bar = document.createElement('div'); bar.className = 'nlt-bar'; bar.setAttribute('data-no-translate','');
    const canExport = !NO_EXPORT.includes(role());
    bar.innerHTML = '<input type="search" placeholder="Search..." aria-label="Search list"><button data-a="clear">Clear filters</button>' + (canExport ? '<button data-a="csv">CSV</button><button data-a="xls">Excel</button><button data-a="pdf">PDF</button><button data-a="print">Print</button>' : '') + '<span class="nlt-count"></span>';
    const pager = document.createElement('div'); pager.className = 'nlt-pager';
    grid.parentNode.insertBefore(bar, grid); grid.parentNode.insertBefore(pager, grid.nextSibling);
    const q = bar.querySelector('input');
    const visible = () => cards.filter(c => !st.q || txt(c).toLowerCase().includes(st.q));
    function draw() {
      const rows = visible(), pages = Math.max(1, Math.ceil(rows.length / st.size));
      st.page = Math.min(st.page, pages - 1);
      const start = st.page * st.size, shown = rows.slice(start, start + st.size);
      cards.forEach(c => c.style.display = 'none');
      shown.forEach(c => c.style.display = '');
      bar.querySelector('.nlt-count').textContent = rows.length ? 'Showing ' + (start+1) + '-' + (start+shown.length) + ' of ' + rows.length + (rows.length !== cards.length ? ' (filtered from ' + cards.length + ')' : '') : 'No matching records';
      pager.innerHTML = 'Rows <select aria-label="Rows per page">' + [10,25,50,100,200].map(n=>'<option'+(n===st.size?' selected':'')+'>'+n+'</option>').join('') + '</select><button data-p="prev"'+(st.page?'':' disabled')+'>Prev</button><span>Page '+(st.page+1)+' of '+pages+'</span><button data-p="next"'+(st.page<pages-1?'':' disabled')+'>Next</button>';
    }
    function rowsData() { return visible().map(c => txt(c).split(/\\s{2,}|\\n/).map(s => s.trim()).filter(Boolean)); }
    function download(name, data, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type})); a.download = name; a.click(); }
    q.addEventListener('input', () => { st.q = q.value.trim().toLowerCase(); st.page = 0; draw(); });
    bar.addEventListener('click', e => { const b = e.target.closest('button'); const a = b && b.dataset.a; if (!a) return;
      if (a === 'clear') { q.value = ''; st.q = ''; st.page = 0; draw(); return; }
      if (NO_EXPORT.includes(role())) return showToast('Your role is not allowed to export.');
      const csv = rowsData().map(r => r.map(c => '"' + c.replace(/"/g,'""') + '"').join(',')).join('\\n');
      if (a === 'csv') download('export.csv', csv, 'text/csv');
      if (a === 'xls') download('export.xls', csv.replace(/","/g,'"\\t"'), 'application/vnd.ms-excel');
      if (a === 'pdf' || a === 'print') { const w = window.open('', '_blank'); if (!w) return showToast('Allow pop-ups to print.'); w.document.write('<table border=1 cellpadding=4 style="border-collapse:collapse;font:12px sans-serif">' + rowsData().map(r=>'<tr>'+r.map(c=>'<td>'+c.replace(/</g,'&lt;')+'</td>').join('')+'</tr>').join('') + '</table>'); w.document.close(); w.print(); }
      showToast('Exported ' + rowsData().length + ' filtered records.');
    });
    pager.addEventListener('change', e => { st.size = +e.target.value; st.page = 0; draw(); });
    pager.addEventListener('click', e => { const p = e.target.dataset && e.target.dataset.p; if (p === 'prev') st.page--; if (p === 'next') st.page++; if (p) draw(); });
    draw();
  }
  function readOnly(root) {
    if (!READ_ONLY.includes(role())) return;
    root.querySelectorAll('button,a.btn').forEach(b => { if (b.dataset.nltRo || b.dataset.nltAllow === '1' || (document.getElementById('glMain') && b.closest('.gl-wrap,#modalRoot')) || b.closest('.nlt-bar,.nlt-pager,.nf-nav,.enterprise-header-tools,#loginForm')) return; if (b.dataset.nltAction && typeof window.nfCan === 'function' && window.nfCan(b.dataset.nltAction)) return; const t = txt(b); if (BLOCK.test(t)) { b.dataset.nltRo = '1'; b.disabled = true; b.title = 'CEO view is read-only'; b.style.opacity = '.45'; b.style.pointerEvents = 'none'; } });
  }
  let t = 0;
  const scan = () => { clearTimeout(t); t = setTimeout(() => { document.querySelectorAll('table').forEach(enhance); document.querySelectorAll(CARD_LISTS).forEach(enhanceCards); readOnly(document); }, 60); };
  new MutationObserver(scan).observe(document.body, { childList:true, subtree:true });
  scan();
})();
</script>`;