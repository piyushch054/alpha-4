import { useEffect, useMemo, useState } from 'react';
import { installLocalization, languageCatalogs, savedLanguage } from '@/lib/localization';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownToLine, ArrowRight, Plus, Search, SlidersHorizontal, PanelLeft, X, Check, ChevronRight, TrendingUp, Clock3, ShieldCheck, Building2, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { ExecutiveSidebar } from '@/components/executive-sidebar';
import { LanguageSelector } from '@/components/language-selector';
import { ThemeSelector } from '@/components/theme-selector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import apiClient from '@/lib/apiClient';
import { initialApplications, productStats, stages, stageStats, monthlyTrend, branches, workspaces } from '@/lib/dashboard-data';

function WorkspaceLink({ view, children, className = '' }) {
  return <Link to="/workspace" search={{ view }} className={className}>{children}</Link>;
}
function exportCsv(name, rows) {
  const text = rows.map((row) => row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');a.href = url;a.download = name;a.click();URL.revokeObjectURL(url);
}
export function Dashboard() {
  useEffect(() => {const language = savedLanguage();return installLocalization(document, language, languageCatalogs[language] ?? {});}, []);
  const [product, setProduct] = useState('All Products');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [region, setRegion] = useState('All Regions');
  const [period, setPeriod] = useState('QTD');
  const [stage, setStage] = useState('All');
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState(initialApplications);
  const [realStats, setRealStats] = useState(null);
  useEffect(() => {
    apiClient.get('/dashboard/stats').then(res => setRealStats(res.data.data)).catch(console.error);
  }, []);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [launcherSearch, setLauncherSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('Recent Applications');
  const [notice, setNotice] = useState('');
  const [resolved, setResolved] = useState([]);
  const [sort, setSort] = useState(false);
  const [note, setNote] = useState('');
  const scoped = useMemo(() => apps.filter((a) => (product === 'All Products' || a.product === product) && (region === 'All Regions' || a.region === region)), [apps, product, region]);
  const filtered = useMemo(() => scoped.filter((a) => (stage === 'All' || a.stage === stage) && (tab !== 'Watchlist' || a.score < 725) && (tab !== 'Ready to Fund' || a.stage === 'Disbursement') && `${a.name} ${a.id} ${a.product}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort ? b.amount - a.amount : 0), [scoped, stage, search, sort, tab]);
  const stat = productStats.find((p) => p.product === product);
  const regionRatio = region === 'All Regions' ? 1 : branches.filter((b) => b.region === region).reduce((s, b) => s + b.aum, 0) / 842.5;
  const factor = (stat ? stat.share / 100 : 1) * regionRatio;
  const flowFactor = period === 'MTD' ? 1 : period === 'QTD' ? 2.7 : 5.2;
  const aum = (842.5 * factor).toFixed(2);
  const active = Math.round(12482 * factor).toLocaleString('en-IN');
  const trend = monthlyTrend.slice(period === 'MTD' ? -3 : period === 'QTD' ? -3 : 0).map((t) => ({ ...t, disbursed: +(t.disbursed * factor).toFixed(1), collected: +(t.collected * factor).toFixed(1) }));
  const displayBranches = branches.filter((b) => region === 'All Regions' || b.region === region);
  function reset() {setProduct('All Products');setRegion('All Regions');setStage('All');setSearch('');setPage(1);setTab('Recent Applications');}
  function decide(decision) {if (!selected) return;setApps((prev) => prev.map((a) => a.id === selected.id ? { ...a, stage: decision } : a));setNotice(`${selected.name}: ${decision}${note ? ' · ' + note : ''}`);setSelected(null);setNote('');}
  function download() {exportCsv('Namdev-applications-demo.csv', [['Application ID', 'Applicant', 'Product', 'Amount (Lakh)', 'Region', 'Stage', 'Bureau Score', 'Documents %', 'Owner'], ...filtered.map((a) => [a.id, a.name, a.product, a.amount, a.region, a.stage, a.score, a.docs, a.owner])]);}
  return <main className={'dashboard-page enterprise-dashboard ' + (navCollapsed ? 'enterprise-nav-collapsed' : '')}>
    <ExecutiveSidebar product={product} onProduct={(p) => {setProduct(p);setPage(1);}} onOverview={reset} onTasks={() => setModal('tasks')} onLauncher={() => setModal('launcher')} />
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Button variant="ghost" size="icon" aria-label="Toggle navigation" title="Toggle navigation" aria-controls="executiveNavigation" aria-expanded={!navCollapsed} onClick={() => setNavCollapsed(!navCollapsed)}><PanelLeft /></Button>
        <div>
          <div className="executive-eyebrow"><span />EXECUTIVE OFFICE · DEMO PORTFOLIO</div>
          <h1>Portfolio Performance</h1>
          <p className="header-subtitle">FY 2026–27 <span> / </span> Executive office <span> / </span> October 04, 2026</p>
        </div>
        <div className="header-actions">
          <ThemeSelector />
          <LanguageSelector />
          <span className="demo-indicator"><span className="status-dot" />Demo portfolio</span>
          <Button variant="default" asChild><WorkspaceLink view="newApplication"><Plus />New Application</WorkspaceLink></Button>
        </div>
      </header>
      <div className="filter-bar">
        <div className="period-control" aria-label="Reporting period">{['MTD', 'QTD', 'YTD'].map((p) => <Button key={p} variant={period === p ? 'periodActive' : 'period'} size="sm" onClick={() => setPeriod(p)}>{p}</Button>)}</div>
        <span className="filter-separator" />
        <label className="filter-select"><Building2 size={14} /><select aria-label="Region" value={region} onChange={(e) => {setRegion(e.target.value);setPage(1);}}>{['All Regions', 'Rajasthan', 'Gujarat', 'Madhya Pradesh'].map((r) => <option key={r}>{r}</option>)}</select></label>
        <label className="filter-select"><Filter size={14} /><select aria-label="Product" value={product} onChange={(e) => {setProduct(e.target.value);setPage(1);}}>{['All Products', ...productStats.map((p) => p.product)].map((p) => <option key={p}>{p}</option>)}</select></label>
        {(product !== 'All Products' || region !== 'All Regions' || stage !== 'All') && <Button size="sm" variant="ghost" onClick={reset}><X />Reset</Button>}
        <div className="filter-actions"><Button variant="ghost" size="sm" onClick={() => setModal('metrics')}><SlidersHorizontal />KPI details</Button><Button variant="ghost" size="sm" onClick={download}><ArrowDownToLine />Export</Button></div>
      </div>
      {notice && <div className="action-notice" role="status"><Check size={16} />{notice}<Button variant="ghost" size="icon" aria-label="Dismiss notification" onClick={() => setNotice('')}><X /></Button></div>}
      <section className="metrics-grid" aria-label="Executive indicators">
        <div className="metric-card"><div className="metric-top"><span>Total AUM</span><TrendingUp size={17} /></div><strong>₹ {aum}<small> Cr</small></strong><div className="metric-bottom"><span className="positive-chip"><ArrowUpRight size={12} />12.4%</span><span>vs last quarter</span><svg className="sparkline" viewBox="0 0 90 25" aria-hidden="true"><path d="M1 22L13 18L24 20L36 12L48 14L60 8L72 10L88 2" /></svg></div></div>
        <div className="metric-card"><div className="metric-top"><span>Active Disbursals</span><ArrowUpRight size={17} /></div><strong>{active}</strong><div className="metric-bottom"><span className="muted-copy">₹{(48.2 * factor * flowFactor).toFixed(1)} Cr disbursed · {period}</span></div><div className="metric-progress"><span /></div></div>
        <div className="metric-card"><div className="metric-top"><span>Portfolio Health <small>(PAR 90+)</small></span><ShieldCheck size={17} /></div><strong>{stat ? stat.par.toFixed(2) : '0.82'}<small>%</small></strong><div className="metric-bottom"><span className="positive-chip">−8 bps</span><span>within risk appetite</span></div></div>
        <div className="metric-card metric-priority"><div className="metric-top"><span>Pending Tasks (SLAs)</span><Clock3 size={17} /></div><strong>{48 - resolved.length}<small> Priority</small></strong><div className="metric-bottom"><span className="urgent-dot" /><span>{12 - resolved.length} overdue</span><Button variant="ghost" size="sm" onClick={() => setModal('tasks')}>Review<ArrowRight /></Button></div></div>
      </section>
      <div className="main-grid">
        <section className="lifecycle-panel">
          <div className="panel-heading"><div><span className="section-kicker">ORIGINATION & DECISIONING</span><h2>Lending Lifecycle <small>(LOS / CRM)</small></h2></div><WorkspaceLink view="applications" className="subtle-link">All applications<ArrowUpRight size={15} /></WorkspaceLink></div>
          <div className="pipeline-grid">{stages.map((s, i) => <Button key={s} variant="pipeline" className={stage === s ? 'pipeline-selected' : ''} onClick={() => {setStage(stage === s ? 'All' : s);setPage(1);}}><span className="pipeline-label">{s}</span><strong>{Math.max(1, Math.round((stageStats[i] ?? 0) * factor))}</strong><span className={'pipeline-caption tone-' + ['green', 'amber', 'neutral', 'brand', 'green'][i]}>{['+4% flow', '12 high risk', 'Avg 1.2 days', '3 pending MD', 'Ready to fund'][i]}</span><span className="pipeline-track"><span className={'pipeline-fill fill-' + i} /></span></Button>)}</div>
          <div className="growth-panel"><div className="chart-heading"><div><h3>Disbursement Growth</h3><span className="muted-copy">₹ Cr · {period === 'YTD' ? 'Apr – Sep 2026' : 'Jul – Sep 2026'}</span></div><div className="chart-legend"><span><i className="legend-brand" />Disbursed</span><span><i className="legend-blue" />Collected</span></div></div>
          <div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="disbursalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.12} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="chart-tooltip"><b>{label} 2026</b>{payload.map((p) => <div key={String(p.dataKey)}>{p.dataKey === 'disbursed' ? 'Disbursed' : 'Collected'} <strong>₹{p.value} Cr</strong></div>)}</div> : null} /><Area isAnimationActive={false} type="monotone" dataKey="disbursed" stroke="var(--primary)" strokeWidth={2.5} fill="url(#disbursalFill)" /><Area isAnimationActive={false} type="monotone" dataKey="collected" stroke="var(--financial)" strokeWidth={2} strokeDasharray="5 4" fill="transparent" /></AreaChart></ResponsiveContainer></div></div>
          <div className="application-section"><div className="applications-heading"><h2>High-Value Applications</h2><WorkspaceLink view="applications" className="financial-link">View all applications<ArrowUpRight size={14} /></WorkspaceLink></div>
            <div className="application-toolbar"><div className="table-tabs">{['Recent Applications', 'Watchlist', 'Ready to Fund'].map((t) => <Button variant="tableTab" key={t} className={tab === t ? 'tab-active' : ''} onClick={() => {setTab(t);setPage(1);}}>{t}</Button>)}</div><div className="table-search"><Search size={14} /><input aria-label="Search applications" placeholder="Search applications" value={search} onChange={(e) => {setSearch(e.target.value);setPage(1);}} /></div></div>
            <div className="table-scroll"><table className="data-table"><thead><tr><th>Applicant / ID</th><th>Product</th><th><Button variant="tableTab" size="sm" onClick={() => setSort(!sort)}>Amount {sort ? '↓' : '↕'}</Button></th><th className="text-right">Status</th><th /></tr></thead><tbody>{filtered.slice((page - 1) * 5, page * 5).map((a) => <tr key={a.id}><td><Button variant="applicant" onClick={() => {setSelected(a);setNote('');}}>{a.name}</Button><span className="application-id">{a.id} · {a.region}</span></td><td className="muted-copy">{a.product}</td><td className="amount-cell">₹ {a.amount >= 100 ? (a.amount / 100).toFixed(1) + ' Cr' : a.amount.toFixed(1) + ' L'}</td><td className="text-right"><span className={'stage-badge ' + (a.stage === 'Tech/Legal' ? 'badge-amber' : a.stage === 'Underwriting' ? 'badge-blue' : a.stage === 'Leads' ? 'badge-neutral' : 'badge-green')}>{a.stage}</span></td><td><Button variant="ghost" size="icon" aria-label={'Review ' + a.name} onClick={() => setSelected(a)}><ChevronRight /></Button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No applications match these filters.<Button variant="link" onClick={reset}>Clear filters</Button></div>}</div>
            <div className="table-footer"><span>{filtered.length === 0 ? 0 : (page - 1) * 5 + 1}–{Math.min(page * 5, filtered.length)} of {filtered.length} applications</span><div><Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="ghost" size="sm" disabled={page * 5 >= filtered.length} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Button></div></div>
          </div>
        </section>
        <aside className="side-column">
          <section className="portfolio-panel"><div className="panel-heading"><h2>Portfolio Mix</h2><span className="unit-label">% of AUM</span></div><div className="portfolio-list">{productStats.map((p) => <Button variant="portfolio" key={p.product} className={product === p.product ? 'portfolio-selected' : ''} onClick={() => {setProduct(product === p.product ? 'All Products' : p.product);setPage(1);}}><span className="portfolio-label"><span>{p.label}</span><strong>{p.share}%</strong></span><span className="portfolio-track"><span className={'portfolio-fill portfolio-' + p.tone} /></span><span className="portfolio-detail">₹{(p.aum * regionRatio).toFixed(1)} Cr <span>{Math.round(p.loans * regionRatio).toLocaleString('en-IN')} loans</span></span></Button>)}</div><div className="portfolio-summary"><div><span>Portfolio yield</span><strong>18.4%</strong></div><div><span>Cost of funds</span><strong>9.2%</strong></div><div><span>Net margin</span><strong className="tone-green">9.2%</strong></div></div></section>
          <section className="repayment-panel"><div className="panel-heading"><h2>Repayment Health</h2><ShieldCheck size={17} className="tone-green" /></div><div className="repayment-content"><div className="collection-ring"><svg viewBox="0 0 100 100" aria-label="Collection efficiency 98.2 percent"><circle cx="50" cy="50" r="42" className="ring-track" /><circle cx="50" cy="50" r="42" className="ring-value" /></svg><strong>98.2<small>%</small></strong></div><div><span className="section-kicker">COLLECTION EFF.</span><p className="collection-target">Target: 99.5%</p><WorkspaceLink view="repayments" className="financial-link">View repayments<ArrowRight size={13} /></WorkspaceLink></div></div><div className="repayment-stats"><div><span>Collected · {period}</span><strong>₹{(46.8 * factor * flowFactor).toFixed(1)} Cr</strong></div><div><span>Overdue book</span><strong>₹{(15.17 * factor).toFixed(2)} Cr</strong></div></div></section>
          <section className="corporate-panel">
  <div className="corporate-title"><span>System Realtime Statistics</span><span className="status-dot" /></div>
  <div className="corporate-links">
    <WorkspaceLink view="applications"><Building2 size={14} />Users <b>{realStats?.totalUsers || 0}</b><ArrowUpRight size={12} /></WorkspaceLink>
    <WorkspaceLink view="employeeProfile"><ShieldCheck size={14} />Employees <b>{realStats?.totalEmployees || 0}</b><ArrowUpRight size={12} /></WorkspaceLink>
  </div>
  <div className="corporate-detail">
    <WorkspaceLink view="projectTasks">Tasks <span>{realStats?.totalTasks || 0} active<ChevronRight size={12} /></span></WorkspaceLink>
    <WorkspaceLink view="applications">KYC Records <span className="tone-amber">{realStats?.totalKyc || 0} total<ChevronRight size={12} /></span></WorkspaceLink>
  </div>
</section>
          <section className="priority-panel"><div className="panel-heading"><h2>Attention Required</h2><span className="priority-count">3</span></div>{[{ title: 'Technical report overdue', sub: 'Mahesh Kumar · NF-2601047', tone: 'brand', view: 'technical' }, { title: 'Credit deviation approval', sub: '3 cases awaiting decision', tone: 'amber', view: 'approvals' }, { title: 'PDD documents pending', sub: '8 files · Operations', tone: 'blue', view: 'pddCollateral' }].map((t) => <WorkspaceLink view={t.view} key={t.title} className="priority-item"><span className={'priority-mark mark-' + t.tone} /><span><b>{t.title}</b><small>{t.sub}</small></span><ChevronRight size={15} /></WorkspaceLink>)}</section>
        </aside>
      </div>
      <section className="branch-section"><div className="panel-heading"><div><span className="section-kicker">DISTRIBUTION & PRODUCTIVITY</span><h2>Branch Performance</h2></div><Button variant="ghost" size="sm" onClick={() => exportCsv('Namdev-branches-demo.csv', [['Branch', 'Region', 'AUM Cr', 'Disbursed Cr', 'Collection %', 'PAR %', 'Cases'], ...displayBranches.map((b) => [b.name, b.region, b.aum, b.disbursed, b.collection, b.par, b.cases])])}><ArrowDownToLine />Export report</Button></div><div className="table-scroll"><table className="data-table branch-table"><thead><tr><th>Branch</th><th>AUM</th><th>Disbursed MTD</th><th>Collection Eff.</th><th>PAR 90+</th><th>Open Cases</th><th /></tr></thead><tbody>{displayBranches.map((b) => <tr key={b.name}><td><b>{b.name}</b><span className="application-id">{b.region}</span></td><td>₹{(b.aum * (stat ? stat.share / 100 : 1)).toFixed(1)} Cr</td><td>₹{(b.disbursed * (stat ? stat.share / 100 : 1)).toFixed(1)} Cr</td><td><span className={b.collection < 98 ? 'tone-amber' : 'tone-green'}>{b.collection}%</span></td><td><span className={b.par > 1 ? 'tone-brand' : ''}>{b.par}%</span></td><td>{b.cases}</td><td><Button variant="ghost" size="sm" onClick={() => {setRegion(b.region);setNotice(`${b.name} · Region selected: ${b.region}`);}}>View region<ArrowUpRight /></Button></td></tr>)}</tbody></table></div></section>
      <footer className="dashboard-footer"><span>Namdev Finvest Ltd. <span> / </span> Enterprise Lending OS</span><span>Live System - Connected to MongoDB MERN Backend</span></footer>
    </div>
    <Dialog open={selected !== null} onOpenChange={(open) => {if (!open) setSelected(null);}}><DialogContent className="review-dialog"><DialogHeader><span className="section-kicker">APPLICATION REVIEW</span><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{selected?.id} · {selected?.product} · {selected?.region} · Demo case</DialogDescription></DialogHeader>{selected && <><div className="review-grid">{[['Requested amount', `₹${selected.amount.toFixed(1)} L`], ['Current stage', selected.stage], ['Bureau score', selected.score], ['Documents', selected.docs + '% complete'], ['Assigned to', selected.owner], ['Queue time', selected.age]].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div><label className="review-note">Decision remarks<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add your review remarks" rows={3} /></label><div className="review-actions"><Button variant="outline" onClick={() => decide('Returned')}>Send back</Button><Button onClick={() => decide('CAM Approval')}><Check />Approve for CAM</Button></div><WorkspaceLink view="applications" className="financial-link">Open original application workspace<ArrowRight size={14} /></WorkspaceLink></>}</DialogContent></Dialog>
    <Dialog open={modal !== null} onOpenChange={(open) => {if (!open) setModal(null);}}><DialogContent className={modal === 'launcher' ? 'launcher-dialog' : ''}><DialogHeader><DialogTitle>{modal === 'launcher' ? 'All Workspaces' : modal === 'tasks' ? 'Priority Tasks & SLA' : 'Executive KPI Details'}</DialogTitle><DialogDescription>{modal === 'launcher' ? 'Namdev Finvest Ltd. · Enterprise Lending OS' : modal === 'tasks' ? 'Executive office · Demo task queue' : 'Illustrative reporting · Current selection'}</DialogDescription></DialogHeader>{modal === 'launcher' ? <><div className="launcher-search"><Search size={18} /><input autoFocus aria-label="Search workspaces" placeholder="Search lending, credit, operations…" value={launcherSearch} onChange={(e) => setLauncherSearch(e.target.value)} /></div><div className="launcher-groups">{workspaces.map((g) => {const items = g.items.filter((i) => (i[1] ?? '').toLowerCase().includes(launcherSearch.toLowerCase()));return items.length ? <div key={g.group}><h3>{g.group}</h3>{items.map(([v = 'applications', l = 'Workspace']) => <WorkspaceLink key={v} view={v} className="launcher-item">{l}<ArrowUpRight size={13} /></WorkspaceLink>)}</div> : null;})}</div></> : modal === 'tasks' ? <div className="task-list">{['Complete technical valuation · NF-2601047', 'Review credit deviation · NF-2601048', 'Verify PDD documents · NF-2601043', 'Approve HRMS asset request · IT-041'].map((t, i) => <div key={t}><div><b>{t}</b><span>{i < 2 ? 'Overdue · ' + (i + 1) * 4 + ' hours' : 'Due today'} · {resolved.includes(t) ? 'Resolved' : 'Open'}</span></div><Button variant={resolved.includes(t) ? 'secondary' : 'outline'} size="sm" disabled={resolved.includes(t)} onClick={() => setResolved([...resolved, t])}>{resolved.includes(t) ? <Check /> : 'Resolve'}</Button></div>)}<Button variant="financial" asChild><WorkspaceLink view="taskSla">Open Task & SLA workspace<ArrowRight /></WorkspaceLink></Button></div> : <div className="review-grid">{[['Total AUM', `₹${aum} Cr`], ['Active loans', active], ['Disbursal target', `₹${(60 * factor * flowFactor).toFixed(1)} Cr`], ['Collection efficiency', '98.2%'], ['Net interest margin', '9.2%'], ['Average TAT', '4.2 days'], ['Approval rate', '64.2%'], ['STP ratio', '28.0%'], ['Product', product], ['Region', region], ['Period', period], ['Source', 'Demo portfolio']].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>}</DialogContent></Dialog>
  </main>;
}