import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceConfig } from '../lib/workspace-config';
import './workspace-selection.css';
import { 
  LayoutDashboard, Coffee, ListTodo, FileArchive, FolderOpen, Eye, CheckCircle, Undo2, Network, TrendingUp,
  Users, FileText, Briefcase, Files, UserCircle, Scale, ShieldCheck, Folder, Landmark, CreditCard, LineChart,
  Inbox, FileSignature, Cpu, ShieldAlert, ClipboardCheck, Wrench, Gavel, BadgeCheck, CheckSquare, Banknote,
  History, ArrowRightLeft, Key, Handshake, User, BriefcaseBusiness, Monitor, Settings, Video, Plane,
  ClipboardList, FileKey, Lock, BarChart3, Settings2, Plug, UsersRound, ScanSearch, Component,
  CheckCircle2, Search, X
} from 'lucide-react';

const workspaceIconMap = {
  Dashboard: LayoutDashboard,
  'Cases View': FolderOpen,
  Origination: Briefcase,
  'Credit & Decisioning': CreditCard,
  'Loan Operations / LMS': Banknote,
  'General Ledger': Landmark,
  'People & Work': Users,
  'Assets & Admin': Monitor,
  Governance: ShieldCheck,
  'Insights & Platform': BarChart3
};

const iconMap = {
  dashboard: LayoutDashboard,
  lobby: Coffee,
  tasks: ListTodo,
  caseDocs: FileArchive,
  casesView: FolderOpen,
  viewOnly: Eye,
  approvals: CheckCircle,
  sendBack: Undo2,
  hierarchy: Network,
  employeePerformance: TrendingUp,
  leads: UsersRound,
  newApplication: FileText,
  msmeFlow: Briefcase,
  applications: Files,
  customerProfile: UserCircle,
  preEligibility: Scale,
  kycDedupe: ShieldCheck,
  documents: Folder,
  banking: Landmark,
  bureau: CreditCard,
  financials: LineChart,
  credit: Inbox,
  cam: FileSignature,
  creditEngine: Cpu,
  fraud: ShieldAlert,
  underwriting: ClipboardCheck,
  technical: Wrench,
  legal: Gavel,
  sanction: BadgeCheck,
  postSanction: CheckSquare,
  disbursement: Banknote,
  repayments: History,
  dealMovement: ArrowRightLeft,
  pddCollateral: Key,
  partners: Handshake,
  employeeProfile: User,
  hrms: BriefcaseBusiness,
  projectTasks: ListTodo,
  assetInventory: Monitor,
  adminManagement: Settings,
  cctvMonitoring: Video,
  travelManagement: Plane,
  auditManagement: ClipboardList,
  complianceManagement: ShieldCheck,
  auditCompliance: FileKey,
  workflowControl: Lock,
  reports: BarChart3,
  configStudio: Settings2,
  integrationHub: Plug,
  platformArchitecture: Component
};

const compactPersistedDemoState = () => {
  const key = 'namdev-demo-full-state';
  const saved = localStorage.getItem(key);
  if (!saved) return;

  let state;
  try {
    state = JSON.parse(saved);
  } catch (error) {
    console.error(`Unable to parse ${key} before workspace selection save.`, error);
    return;
  }
  if (!state || typeof state !== 'object') return;

  const isDemoId = id => typeof id === 'string' && id.startsWith('DEMO-');
  const limitDemoRecords = (records, isDemoRecord) => {
    if (!Array.isArray(records)) return records;
    let kept = 0;
    return records.filter(record => !isDemoRecord(record) || kept++ < 50);
  };
  const applications = limitDemoRecords(state.applications, app => app?.synthetic || isDemoId(app?.id));
  const retainedApplicationIds = new Set(
    (applications || []).filter(app => app?.synthetic || isDemoId(app?.id)).map(app => app.id)
  );
  const compactDomain = domain => {
    if (!domain || typeof domain !== 'object' || Array.isArray(domain)) return domain;
    return Object.fromEntries(
      Object.entries(domain).filter(([id]) => !isDemoId(id) || retainedApplicationIds.has(id))
    );
  };
  const crm = state.crm && typeof state.crm === 'object'
    ? {
        ...state.crm,
        leads: limitDemoRecords(state.crm.leads, lead => lead?.synthetic || isDemoId(lead?.id)),
        activities: limitDemoRecords(state.crm.activities, activity => isDemoId(activity?.leadId))
      }
    : state.crm;
  const compacted = {
    ...state,
    crm,
    applications,
    v7Tasks: limitDemoRecords(state.v7Tasks, task => isDemoId(task?.id)),
    v7Customers: limitDemoRecords(state.v7Customers, customer => isDemoId(customer?.id) || isDemoId(customer?.applicationId)),
    v7Partners: limitDemoRecords(state.v7Partners, partner => isDemoId(partner?.id)),
    auditEvents: limitDemoRecords(state.auditEvents, event => isDemoId(event?.caseId)),
    approvalEvents: limitDemoRecords(state.approvalEvents, event => isDemoId(event?.caseId)),
    v7Kyc: compactDomain(state.v7Kyc),
    v7Banking: compactDomain(state.v7Banking),
    v7Bureau: compactDomain(state.v7Bureau),
    v7RCU: compactDomain(state.v7RCU),
    v7UW: compactDomain(state.v7UW),
    v7Sanction: compactDomain(state.v7Sanction),
    v7PDD: compactDomain(state.v7PDD)
  };
  const serialized = JSON.stringify(compacted);
  if (serialized.length >= saved.length) return;

  try {
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Unable to compact persisted demo data in ${key}.`, error);
  }
};

export function WorkspaceSelection() {
  const navigate = useNavigate();
  const workspaces = Object.values(workspaceConfig);
  const selectableSubmodules = workspaces.flatMap(workspace =>
    workspace.disabled
      ? []
      : workspace.submodules
        .filter(submodule => !submodule.disabled)
        .map(submodule => ({ workspaceName: workspace.name, id: submodule.id }))
  );
  
  const getInitialSelection = () => {
    try {
      const saved = localStorage.getItem('namdevSelectedWorkspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch(e) {}
    return {
      "Dashboard": ["dashboard"],
      "Insights & Platform": ["reports", "dashboard"]
    };
  };

  const [selection, setSelection] = useState(getInitialSelection());
  const [activeModal, setActiveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };
  const saveSelection = (nextSelection) => {
    try {
      compactPersistedDemoState();
      localStorage.setItem('namdevSelectedWorkspaces', JSON.stringify(nextSelection));
      return true;
    } catch (error) {
      console.error('Unable to save workspace selection.', error);
      showToast('Could not save workspace selection. Free browser storage space and try again.');
      return false;
    }
  };

  const toggleChild = (parentName, childId) => {
    const workspace = workspaces.find(item => item.name === parentName);
    const submodule = workspace?.submodules.find(item => item.id === childId);
    if (workspace?.disabled || submodule?.disabled) return;

    setSelection(prev => {
      const current = prev[parentName] || [];
      const updated = current.includes(childId) 
        ? current.filter(id => id !== childId)
        : [...current, childId];
        
      const newState = { ...prev };
      if (updated.length > 0) {
        newState[parentName] = updated;
      } else {
        delete newState[parentName];
      }
      return newState;
    });
  };

  const selectAll = (parentName, allIds) => {
    setSelection(prev => ({ ...prev, [parentName]: allIds }));
  };

  const clearAll = (parentName) => {
    setSelection(prev => {
      const newState = { ...prev };
      delete newState[parentName];
      return newState;
    });
  };

  const selectedSelectableCount = selectableSubmodules.reduce(
    (count, item) => count + (selection[item.workspaceName]?.includes(item.id) ? 1 : 0),
    0
  );
  const allSelected = selectableSubmodules.length > 0 && selectedSelectableCount === selectableSubmodules.length;
  const partiallySelected = selectedSelectableCount > 0 && !allSelected;

  const toggleAll = () => {
    setSelection(allSelected
      ? {}
      : Object.fromEntries(
        workspaces
          .filter(workspace => !workspace.disabled)
          .map(workspace => [
            workspace.name,
            workspace.submodules
              .filter(submodule => !submodule.disabled)
              .map(submodule => submodule.id)
          ])
          .filter(([, ids]) => ids.length > 0)
      )
    );
  };

  const handleContinue = () => {
    if (selectedSelectableCount === 0) {
      showToast('Please select at least one module.');
      return;
    }
    if (!saveSelection(selection)) return;
    navigate('/workspace?view=dashboard', { replace: true });
  };

  const handleSkip = () => {
    if (!saveSelection({})) return;
    showToast('Continuing with default dashboard...');
    setTimeout(() => {
      navigate('/workspace?view=dashboard', { replace: true });
    }, 650);
  };

  const getParentState = (w) => {
    const availableSubmodules = w.disabled ? [] : w.submodules.filter(submodule => !submodule.disabled);
    const selectedCount = availableSubmodules.filter(submodule =>
      (selection[w.name] || []).includes(submodule.id)
    ).length;
    const totalCount = availableSubmodules.length;
    if (selectedCount === 0) return { selected: false, partial: false, text: totalCount + ' modules available' };
    if (selectedCount === totalCount) return { selected: true, partial: false, text: selectedCount + ' modules selected' };
    return { selected: true, partial: true, text: selectedCount + ' modules selected' };
  };

  const totalSelectedCount = Object.values(selection).reduce((acc, curr) => acc + curr.length, 0);
  
  const modalWorkspace = activeModal ? workspaceConfig[activeModal] : null;
  const modalSelectedIds = modalWorkspace ? (selection[modalWorkspace.name] || []) : [];

  return (
    <div className="workspace-selection-page">
      <header className="ws-topbar">
        <div className="ws-brand">
          <img className="ws-brand-logo" src="/nf-namdev-logo.webp" alt="Namdev Finvest Limited" />
        </div>
        <div className="ws-top-actions">
          <div className="ws-search"><Search size={15} aria-hidden="true" /><span>Search here...</span></div>
          <div className="ws-user">
            <div className="ws-avatar">JT</div>
            <div>
              <div className="ws-user-name">JITENDRA TANWAR</div>
              <div className="ws-user-role">MD &amp; CEO</div>
            </div>
          </div>
        </div>
      </header>

      <section className="ws-hero">
        <div className="ws-hero-inner">
          <div className="ws-eyebrow">WELCOME TO NAMDEV FINVEST</div>
          <h1>Choose Your <span>Workspaces</span></h1>
          <p className="ws-sub">
            Select the specific modules you want to access. Click a workspace to select its submodules.
          </p>
        </div>
      </section>

      <main className="ws-workspace-area">
        <div className="ws-selection-toolbar">
          <button
            type="button"
            className={`ws-select-all${allSelected ? ' selected' : ''}${partiallySelected ? ' partial' : ''}${selectableSubmodules.length === 0 ? ' disabled' : ''}`}
            aria-pressed={allSelected}
            disabled={selectableSubmodules.length === 0}
            onClick={toggleAll}
          >
            <span className="ws-select-all-check" aria-hidden="true">
              {allSelected ? <CheckCircle2 size={18} strokeWidth={2.5} /> : partiallySelected ? <Component size={18} strokeWidth={2.5} /> : null}
            </span>
            <span className="ws-select-all-copy">
              <strong>{allSelected ? 'Deselect All' : 'Select All'}</strong>
              <small>
                {allSelected
                  ? `All ${selectableSubmodules.length} available submodules selected`
                  : `${selectedSelectableCount} of ${selectableSubmodules.length} available submodules selected`}
              </small>
            </span>
          </button>
        </div>
        <div className="ws-grid">
          {workspaces.map(w => {
            const { selected, partial, text } = getParentState(w);
            const isDisabled = w.disabled === true;
            const WorkspaceIcon = workspaceIconMap[w.name] || LayoutDashboard;
            return (
              <div 
                key={w.name}
                className={"ws-card " + (selected ? (partial ? "partial" : "selected") : "") + (isDisabled ? " disabled" : "")}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                onClick={() => { if (!isDisabled) setActiveModal(w.name); }}
                onKeyDown={event => {
                  if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    setActiveModal(w.name);
                  }
                }}
              >
                <div className="ws-check">{selected && !partial ? <CheckCircle2 size={16} strokeWidth={2.5} /> : selected && partial ? <Component size={16} strokeWidth={2.5} /> : null}</div>
                <div className={"ws-card-icon " + w.colorClass}><WorkspaceIcon size={27} strokeWidth={1.8} aria-hidden="true" /></div>
                <h3>{w.name}</h3>
                <p>{w.desc}</p>
                <div className="ws-tags">
                  <span className="ws-tag">{text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="ws-bottom">
        <div className="ws-selected-info">
          <LayoutDashboard size={20} aria-hidden="true" />
          <span>{totalSelectedCount} Module{totalSelectedCount === 1 ? '' : 's'} Selected</span>
        </div>
        <button type="button" className="ws-continue" onClick={handleContinue}>Continue to Dashboard</button>
        <button className="ws-skip" onClick={handleSkip}>Skip for Now<small>You can select later from settings</small></button>
      </div>

      <div className={"ws-toast " + (toastMsg ? "show" : "")}>{toastMsg}</div>

      {modalWorkspace && (
        <div className="ws-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ws-modal-content" onClick={e => e.stopPropagation()}>
            <div className="ws-modal-header">
              <div className="ws-modal-title">
                {(() => {
                  const WorkspaceIcon = workspaceIconMap[modalWorkspace.name] || LayoutDashboard;
                  return <div className={"ws-card-icon modal-icon " + modalWorkspace.colorClass}><WorkspaceIcon size={27} strokeWidth={1.8} aria-hidden="true" /></div>;
                })()}
                <div>
                  <h2>{modalWorkspace.name}</h2>
                  <p>{modalWorkspace.desc}</p>
                </div>
              </div>
              <button className="ws-modal-close" aria-label="Close workspace details" onClick={() => setActiveModal(null)}><X size={18} aria-hidden="true" /></button>
            </div>
            
            <div className="ws-modal-body">
              <div className="ws-modal-grid">
                {modalWorkspace.submodules.map(sub => {
                  const isSubSelected = modalSelectedIds.includes(sub.id);
                  const isDisabled = modalWorkspace.disabled === true || sub.disabled === true;
                  const IconComp = iconMap[sub.id] || Files;
                  
                  return (
                    <div 
                      key={sub.id} 
                      className={"ws-sub-card " + (isSubSelected ? "selected" : "") + (isDisabled ? " disabled" : "")}
                      role="checkbox"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-checked={isSubSelected}
                      aria-disabled={isDisabled}
                      onClick={() => { if (!isDisabled) toggleChild(modalWorkspace.name, sub.id); }}
                      onKeyDown={event => {
                        if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          toggleChild(modalWorkspace.name, sub.id);
                        }
                      }}
                    >
                      <div className="ws-check">
                        {isSubSelected ? <CheckCircle2 size={16} color="#fff" strokeWidth={2.5} /> : null}
                      </div>
                      <div className="ws-sub-icon">
                        <IconComp size={20} strokeWidth={1.5} />
                      </div>
                      <div className="ws-sub-content">
                        <h4>{sub.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ws-modal-footer">
              <div className="ws-modal-info">
                <strong>{modalWorkspace.disabled ? 0 : modalWorkspace.submodules.filter(submodule => !submodule.disabled && modalSelectedIds.includes(submodule.id)).length}</strong> of {modalWorkspace.disabled ? 0 : modalWorkspace.submodules.filter(submodule => !submodule.disabled).length} selected
              </div>
              <div className="ws-modal-actions">
                <button 
                  className="ws-btn-ghost" 
                  onClick={() => clearAll(modalWorkspace.name)}
                >Clear All</button>
                <button 
                  className="ws-btn-ghost" 
                  disabled={modalWorkspace.disabled}
                  onClick={() => selectAll(
                    modalWorkspace.name,
                    modalWorkspace.submodules
                      .filter(submodule => !submodule.disabled)
                      .map(submodule => submodule.id)
                  )}
                >Select All</button>
                <button 
                  className="ws-btn-primary" 
                  onClick={() => setActiveModal(null)}
                >Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
