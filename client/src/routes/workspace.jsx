import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { workflowDocument } from '@/lib/workflow-document';
import { workflowMediaScript } from '@/lib/workflow-media';
import { workflowKycScript } from '@/lib/workflow-kyc';
import { workflowTasksScript } from '@/lib/workflow-tasks';
import { workflowApplicantScript } from '@/lib/workflow-applicant';
import { workflowEmployeesScript } from '@/lib/workflow-employees';
import { workflowPersonalizationScript } from '@/lib/workflow-personalization';
import { workflowKpiTooltipsScript } from '@/lib/workflow-kpi-tooltips';
import { workflowDocumentsScript } from '@/lib/workflow-documents';
import { workflowNavigationScript } from '@/lib/workflow-navigation';
import { workflowEditPolicyScript } from '@/lib/workflow-edit-policy';
import { workflowCeoOversightScript } from '@/lib/workflow-ceo-oversight';
import { workflowHierarchyMonitorScript } from '@/lib/workflow-hierarchy-monitor';
import { workflowEmployeePerformanceScript } from '@/lib/workflow-employee-performance';
import { workflowAccessControlScript } from '@/lib/workflow-access-control';
import { workflowKycDedupeScript } from '@/lib/workflow-kyc-dedupe';
import { workflowTractorScript } from '@/lib/workflow-tractor';
import { workflowAuditScript } from '@/lib/workflow-audit';
import { workflowJourneyScript } from '@/lib/workflow-journey';
import { workflowListToolkitScript } from '@/lib/workflow-list-toolkit';
import { makeWorkflowPDScript } from '@/lib/workflow-pd';
import { makeProductJourneysScript } from '@/lib/workflow-product-journeys';
import { makeGeneralLedgerScript } from '@/lib/workflow-gl';
import { workflowLifecycleScript } from '@/lib/workflow-lifecycle';
import { workspaces } from '@/lib/dashboard-data';
import { workspaceConfigScript } from '@/lib/workspace-config';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { suggestFinanceTasks } from '@/lib/task-suggestions.functions';
import { workflowLocalizationScript, savedLanguage, languageCatalogs, installLocalization } from '@/lib/localization';
import { workspaceAppearanceScript, savedTheme } from '@/lib/workspace-appearance';
import { readKycDocument } from '@/lib/kyc-ocr.functions';
import { ThemeSelector } from '@/components/theme-selector';
import { WorkspaceSelection } from '@/components/workspace-selection';

const allItems = workspaces.flatMap((g) => g.items);

const hasRequestedView = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('view');
function WorkspacePage() {
  const navigate = useNavigate(); const location = useLocation(); const router = { navigate: (opts) => { const currentSearch = Object.fromEntries(new URLSearchParams(location.search)); const nextSearch = typeof opts.search === 'function' ? opts.search(currentSearch) : opts.search; const query = nextSearch ? new URLSearchParams(nextSearch).toString() : ''; return navigate(opts.to + (query ? '?' + query : ''), { replace:opts.replace }); }, history: { back: () => navigate(-1) }, state: { location: { state: { __TSR_index: 1 } } } };
  const view = new URLSearchParams(location.search).get('view') || 'login';
  const shownView = useRef(view);
  // Keep the address bar in step with the page open inside the workspace, so refresh and deep links reopen it.
  useEffect(() => {
    const changed = (event) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;

      if (event.data?.type === 'namdev-view-changed') {
        const next = event.data.view;
        if (next !== 'dashboard') setContentRect(null);
        if (typeof next !== 'string' || next !== 'dashboard' && !allItems.some((i) => i[0] === next) || next === shownView.current) return;
        shownView.current = next;
        void router.navigate({ to: '/workspace', search: (prev) => ({ ...prev, view: next }), replace: true });
      } else if (event.data?.type === 'namdev-dashboard-mount-ready') {

      }
    };
    window.addEventListener('message', changed);
    return () => window.removeEventListener('message', changed);
  }, [router]);
  useEffect(() => {
    if (view === shownView.current) return;
    shownView.current = view;
    iframeRef.current?.contentWindow?.postMessage({ type: 'namdev-view', view }, window.location.origin);
  }, [view]);
  useEffect(() => {const language = savedLanguage();return installLocalization(document, language, languageCatalogs[language] ?? {});}, []);
  const iframeRef = useRef(null);
  const [headerMount, setHeaderMount] = useState(null);
  const [contentRect, setContentRect] = useState(null);

  useEffect(() => {
    const back = (event) => {
      if (event.data?.type === 'namdev-login-success') {
        const role = event.data.role;
        if (role === 'CEO') {
          router.navigate({ to: '/workspace', search: { view: 'choose-workspace' }, replace: true });
        } else if (!event.data.returnView) {
          if (role === 'SUPER_SUPER_ADMIN') {
            router.navigate({ to: '/workspace', search: { view: 'dashboard' }, replace: true });
          }
        }
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.origin !== window.location.origin || event.data?.type !== 'namdev-back-fallback') return;
      if (router.state.location.state.__TSR_index > 0) router.history.back();
    };
    window.addEventListener('message', back);
    return () => window.removeEventListener('message', back);
  }, [router]);
  useEffect(() => {
    let busy = false;
    const ocr = async (event) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;
      const m = event.data;
      if (m?.type !== 'namdev-kyc-ocr' || typeof m.id !== 'string' || m.id.length > 100 || typeof m.image !== 'string') return;
      const target = iframeRef.current?.contentWindow;
      const reply = (r) => target?.postMessage({ type: 'namdev-kyc-ocr-result', id: m.id, ...r }, window.location.origin);
      if (busy) {reply({ status: 429, error: 'Another document is being read. Please wait.', fields: {} });return;}
      busy = true;
      try {reply(await readKycDocument({ data: { image: m.image, hint: String(m.hint || 'KYC document').slice(0, 80) } }));}
      catch {reply({ status: 500, error: 'The document could not be read right now. Please try again.', fields: {} });} finally
      {busy = false;}
    };
    window.addEventListener('message', ocr);
    return () => window.removeEventListener('message', ocr);
  }, []);
  useEffect(() => {
    const sync = () => {
      setHeaderMount(iframeRef.current?.contentDocument?.getElementById('enterpriseHeaderTools') ?? null);
      const target = iframeRef.current?.contentWindow;
      const language = savedLanguage();
      target?.postMessage({ type: 'namdev-language', language, catalog: languageCatalogs[language] ?? {} }, window.location.origin);
      target?.postMessage({ type: 'namdev-theme', theme: savedTheme() }, window.location.origin);
    };
    const ready = (event) => {if (event.source === iframeRef.current?.contentWindow && event.origin === window.location.origin && event.data?.type === 'namdev-appearance-ready') sync();};
    window.addEventListener('message', ready);
    const frame = iframeRef.current;
    frame?.addEventListener('load', sync);
    sync();
    return () => {window.removeEventListener('message', ready);frame?.removeEventListener('load', sync);};
  }, []);
  useEffect(() => {
    if (view !== 'dashboard') {
      setContentRect(null);
      return;
    }
    const interval = setInterval(() => {
      const el = iframeRef.current?.contentDocument?.getElementById('content');
      if (el) {
        const rect = el.getBoundingClientRect();
        setContentRect((prev) => {
          if (!prev || prev.top !== rect.top || prev.left !== rect.left || prev.width !== rect.width || prev.height !== rect.height) {
            return rect;
          }
          return prev;
        });
      }
    }, 150);
    return () => clearInterval(interval);
  }, [view]);

  useEffect(() => {
    const pending = new Map();
    const cache = new Map();
    let blocked = '';
    const listener = async (event) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;
      const message = event.data;
      if (!message || typeof message.id !== 'string' || message.id.length > 100) return;
      if (message.type === 'namdev-task-ai-stop') {pending.get(message.id)?.abort();pending.delete(message.id);return;}
      if (message.type !== 'namdev-task-ai' || typeof message.prefix !== 'string' || !message.prefix.trim() || message.prefix.length > 160 || pending.size >= 1) return;
      const target = iframeRef.current?.contentWindow;
      const reply = (result) => target?.postMessage({ type: 'namdev-task-ai-result', id: message.id, ...result }, window.location.origin);
      if (blocked) {reply({ suggestions: [], error: blocked, status: 403 });return;}
      const role = typeof message.role === 'string' ? message.role.slice(0, 60) : 'Finance';
      const key = role + ':' + message.prefix.trim().toLowerCase();
      const hit = cache.get(key);
      if (hit) {reply({ suggestions: hit, error: '', status: 200 });return;}
      const controller = new AbortController();pending.set(message.id, controller);
      try {
        const result = await suggestFinanceTasks({ data: { prefix: message.prefix, role }, signal: controller.signal });
        if (controller.signal.aborted) return;
        if ([402, 403, 404, 401].includes(result.status)) blocked = result.error;
        if (result.status === 200) {if (cache.size >= 50) cache.clear();cache.set(key, result.suggestions);}
        reply(result);
      } catch {if (!controller.signal.aborted) reply({ suggestions: [], status: 500, error: 'AI suggestions could not connect. Your task text is unchanged.' });} finally
      {pending.delete(message.id);}
    };
    window.addEventListener('message', listener);
    return () => {window.removeEventListener('message', listener);pending.forEach((controller) => controller.abort());};
  }, []);
  const title = allItems.find((i) => i[0] === view)?.[1] ?? 'Applications';
  return <main className="workspace-page enterprise-workspace" style={{ position: 'relative' }}>
    {view === 'choose-workspace' ? <WorkspaceSelection /> : (
      <>
        <iframe ref={iframeRef} title={title + ' workspace'} className="workflow-frame" style={{ width: '100%', height: '100%', border: 'none' }} srcDoc={workflowDocument.replace('</body>', workflowKycScript + workflowTasksScript + workflowApplicantScript + workflowEmployeesScript + workflowPersonalizationScript + workflowMediaScript + workspaceAppearanceScript + workflowKpiTooltipsScript + workflowDocumentsScript + workflowJourneyScript + workflowTractorScript + workflowAuditScript + workflowEditPolicyScript + workspaceConfigScript + workflowCeoOversightScript + workflowHierarchyMonitorScript + workflowEmployeePerformanceScript + workflowKycDedupeScript + workflowLifecycleScript + workflowAccessControlScript + workflowListToolkitScript + workflowNavigationScript + workflowLocalizationScript + makeWorkflowPDScript(import.meta.env.VITE_API_URL || '/api') + makeProductJourneysScript(import.meta.env.VITE_API_URL || '/api') + makeGeneralLedgerScript(import.meta.env.VITE_API_URL || '/api') + '</body>').replace('</head>', '<link rel="stylesheet" href="/workflow/ceo-dashboard.css" /><link rel="stylesheet" href="/workflow/pd-details.css" /></head>')} onLoad={(e) => {const target = e.currentTarget.contentWindow;setHeaderMount(e.currentTarget.contentDocument?.getElementById('enterpriseHeaderTools') ?? null);const language = savedLanguage();target?.postMessage({ type: 'namdev-language', language, catalog: languageCatalogs[language] ?? {} }, window.location.origin);target?.postMessage({ type: 'namdev-theme', theme: savedTheme() }, window.location.origin);}} />
        {headerMount && createPortal(<div className="enterprise-header-tools" data-no-translate><Button variant="ghost" size="icon" title="Back to previous page" aria-label="Back to previous page" onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'namdev-go-back' }, window.location.origin)}><ArrowLeft /></Button><ThemeSelector /><LanguageSelector /></div>, headerMount)}
      </>
    )}
  </main>;
}

export default WorkspacePage;
