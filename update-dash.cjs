const fs = require('fs');

const f = 'client/src/components/dashboard.jsx';
let c = fs.readFileSync(f, 'utf8');

const regex = /<section className="corporate-panel">.*?<\/section>/s;
const replace = `<section className="corporate-panel">
  <div className="corporate-title"><span>System Realtime Statistics</span><span className="status-dot" /></div>
  <div className="corporate-links">
    <WorkspaceLink view="applications"><Building2 size={14} />Users <b>{realStats?.totalUsers || 0}</b><ArrowUpRight size={12} /></WorkspaceLink>
    <WorkspaceLink view="employeeProfile"><ShieldCheck size={14} />Employees <b>{realStats?.totalEmployees || 0}</b><ArrowUpRight size={12} /></WorkspaceLink>
  </div>
  <div className="corporate-detail">
    <WorkspaceLink view="projectTasks">Tasks <span>{realStats?.totalTasks || 0} active<ChevronRight size={12} /></span></WorkspaceLink>
    <WorkspaceLink view="applications">KYC Records <span className="tone-amber">{realStats?.totalKyc || 0} total<ChevronRight size={12} /></span></WorkspaceLink>
  </div>
</section>`;

c = c.replace(regex, replace);

// Let's also fix the footer text from "Illustrative data" to "Connected to real MongoDB Backend"
c = c.replace(/Illustrative data.*live services/g, "Live System - Connected to MongoDB MERN Backend");

fs.writeFileSync(f, c);
