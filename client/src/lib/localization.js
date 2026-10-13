import hi from './locales/hi.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import mr from './locales/mr.json';

export const languageCatalogs = { en: {}, hi, gu, pa, or, mr };
export function savedLanguage() {
  try {const value = localStorage.getItem('namdev-language');return value && languageCatalogs[value] ? value : 'en';}
  catch {return 'en';}
}

// Shared DOM adapter: no wrappers, input-value edits, record mutation or legacy-script changes.
export function installLocalization(doc, initialLanguage, initialCatalog) {
  const win = doc.defaultView;
  if (!win) return () => {};
  let language = initialLanguage;
  let catalog = initialCatalog;
  const texts = new Map();
  const attributes = new Map();
  const skip = 'script,style,textarea,[data-no-translate],.application-id,.brand-name,.executive-brand,#sidebarUserName,#profileName,#sidebarAvatar,#profileAvatar';
  let phrases = [];
  function configure() {phrases = Object.keys(catalog).filter((key) => key.length > 2).sort((a, b) => b.length - a.length);}
  configure();
  function translate(source) {
    if (language === 'en') return source;
    const trimmed = source.trim();
    if (catalog[trimmed]) return source.replace(trimmed, catalog[trimmed]);
    // Composite labels retain numbers, case references and customer names verbatim.
    let result = source;
    for (const key of phrases) {
      if (!result.includes(key)) continue;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp('(?<![A-Za-z])' + escaped + '(?![A-Za-z])', 'g'), () => catalog[key] ?? key);
    }
    return result;
  }
  function apply() {
    observer.disconnect();
    doc.documentElement.lang = language;
    // Option text may change; its underlying workflow value must never change.
    doc.querySelectorAll('option:not([value])').forEach((option) => option.setAttribute('value', option.textContent ?? ''));
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || node.parentElement.closest(skip)) continue;
      const current = node.nodeValue ?? '';
      if (!/[A-Za-z\u0900-\u0dff]/.test(current)) continue;
      let record = texts.get(node);
      if (!record || current !== record.rendered) {record = { source: current, rendered: current };texts.set(node, record);}
      record.rendered = translate(record.source);
      if (current !== record.rendered) node.nodeValue = record.rendered;
    }
    doc.querySelectorAll('[placeholder],[title],[aria-label]').forEach((element) => {
      if (element.closest(skip)) return;
      let records = attributes.get(element);
      if (!records) {records = new Map();attributes.set(element, records);}
      for (const name of ['placeholder', 'title', 'aria-label']) {
        const current = element.getAttribute(name);
        if (current === null) continue;
        let record = records.get(name);
        if (!record || current !== record.rendered) {record = { source: current, rendered: current };records.set(name, record);}
        record.rendered = translate(record.source);
        if (current !== record.rendered) element.setAttribute(name, record.rendered);
      }
    });
    for (const node of texts.keys()) if (!node.isConnected) texts.delete(node);
    for (const element of attributes.keys()) if (!element.isConnected) attributes.delete(element);
    observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
  }
  let scheduled = false;
  function schedule() {if (scheduled) return;scheduled = true;queueMicrotask(() => {scheduled = false;apply();});}
  const observer = new MutationObserver(schedule);
  function restore() {
    observer.disconnect();
    texts.forEach((record, node) => {if (node.isConnected && node.nodeValue === record.rendered) {node.nodeValue = record.source;record.rendered = record.source;}});
    attributes.forEach((records, element) => records.forEach((record, name) => {if (element.isConnected && element.getAttribute(name) === record.rendered) {element.setAttribute(name, record.source);record.rendered = record.source;}}));
  }
  // Legacy handlers sometimes compare visible text with English workflow keys.
  // Restore sources during the event and repaint translations before the next frame.
  function beforeAction() {restore();schedule();}
  const events = ['click', 'input', 'change', 'keydown', 'submit'];
  events.forEach((name) => doc.addEventListener(name, beforeAction, true));
  function update(next, dictionary) {
    restore();language = next;catalog = dictionary;configure();apply();
  }
  function onLanguage(event) {
    const detail = event.detail;
    if (detail?.language && detail.catalog) update(detail.language, detail.catalog);
  }
  function onMessage(event) {
    if (event.source !== win?.parent || event.origin !== new URL(doc.baseURI).origin || event.data?.type !== 'namdev-language') return;
    if (['en', 'hi', 'gu', 'pa', 'or', 'mr'].includes(event.data.language) && event.data.catalog) update(event.data.language, event.data.catalog);
  }
  win.addEventListener('namdev-language-change', onLanguage);
  win.addEventListener('message', onMessage);
  apply();
  return () => {observer.disconnect();restore();events.forEach((name) => doc.removeEventListener(name, beforeAction, true));win.removeEventListener('namdev-language-change', onLanguage);win.removeEventListener('message', onMessage);};
}

export function broadcastLanguage(language) {
  const catalog = languageCatalogs[language] ?? {};
  window.dispatchEvent(new CustomEvent('namdev-language-change', { detail: { language, catalog } }));
  document.querySelectorAll('iframe').forEach((frame) => frame.contentWindow?.postMessage({ type: 'namdev-language', language, catalog }, window.location.origin));
}
export const workflowLocalizationScript = '<script>(' + installLocalization.toString() + ')(document,"en",{});if(window.parent!==window)window.parent.postMessage({type:"namdev-appearance-ready"},new URL(document.baseURI).origin);</script>';