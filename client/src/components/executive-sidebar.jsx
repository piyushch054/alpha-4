import { Link } from 'react-router-dom';
import { LayoutGrid, Building2, Sun, Bike, House, Tractor, ShieldCheck, Users, BriefcaseBusiness, ListChecks, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExecutiveSidebar({ product, onProduct, onOverview, onTasks, onLauncher }) {
  return <aside className="executive-sidebar" id="executiveNavigation">
    <Link to="/" className="executive-brand"><img className="executive-logo" src="/nf-namdev-logo.webp" alt="Namdev Finvest" /></Link>
    <nav aria-label="Principal menu"><Button className="executive-nav quick-access-button" title="All Workspaces" onClick={onLauncher}><LayoutGrid />All Workspaces<ChevronRight /></Button><span className="nav-section-label">PRINCIPAL MENU</span>
      <Button variant="ghost" className={'executive-nav ' + (product === 'All Products' ? 'nav-selected' : '')} onClick={onOverview}><LayoutGrid />Executive Overview</Button>
      {[{ p: 'MSME', label: 'MSME Portfolios', Icon: Building2 }, { p: 'LAP', label: 'Loan Against Property', Icon: House }, { p: 'Solar', label: 'Solar & Green Finance', Icon: Sun }, { p: 'Two Wheeler', label: 'Two Wheeler', Icon: Bike }, { p: 'Tractor', label: 'Tractor Loan', Icon: Tractor }].map(({ p, label, Icon }) => <Button variant="ghost" className={'executive-nav ' + (product === p ? 'nav-selected' : '')} key={p} onClick={() => onProduct(p)}><Icon />{label}</Button>)}
      <Button variant="ghost" className="executive-nav" asChild><Link to="/workspace" search={{ view: 'repayments' }}><ShieldCheck />Collections & Risk</Link></Button>
      <span className="nav-section-label">OPERATIONS</span>
      {[{ view: 'crm', label: 'CRM & Leads', Icon: Users }, { view: 'applications', label: 'Applications', Icon: BriefcaseBusiness }, { view: 'underwriting', label: 'Underwriting', Icon: ShieldCheck }, { view: 'hrms', label: 'People & HRMS', Icon: Users }, { view: 'assetInventory', label: 'Assets & Administration', Icon: Building2 }].map(({ view, label, Icon }) => <Button variant="ghost" className="executive-nav" asChild key={view}><Link to="/workspace" search={{ view }}><Icon />{label}</Link></Button>)}
      <Button variant="ghost" className="executive-nav" onClick={onTasks}><ListChecks />Priority Tasks</Button>
    </nav>
    <div className="sidebar-efficiency"><span>BRANCH EFFICIENCY</span><strong>84.5%</strong><div className="metric-progress"><span /></div><small>Illustrative portfolio</small></div>
  </aside>;
}