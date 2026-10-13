export const themes = ['brand', 'ocean', 'forest', 'rose'];
export function savedTheme() {try {const value = localStorage.getItem('namdev-theme');return themes.find((theme) => theme === value) ?? 'brand';} catch {return 'brand';}}
export function applyTheme(theme) {
  document.documentElement.dataset['theme'] = theme;
  document.querySelectorAll('iframe').forEach((frame) => frame.contentWindow?.postMessage({ type: 'namdev-theme', theme }, window.location.origin));
}
export const workspaceAppearanceScript = `<script>
(() => {
  const logo = '/nf-namdev-logo.webp';
  document.querySelectorAll('.brand-mark').forEach(mark => { mark.textContent=''; const image=document.createElement('img');image.src=logo;image.alt='Namdev Finvest';mark.appendChild(image); });
  document.querySelectorAll('.brand-name').forEach(name => name.remove());
  const style=document.createElement('link');style.rel='stylesheet';style.href='/workflow/workspace-appearance.css';document.head.appendChild(style);
  const shellStyle=document.createElement('link');shellStyle.rel='stylesheet';shellStyle.href='/workflow/enterprise-shell.css';document.head.appendChild(shellStyle);
  const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href='https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap';document.head.appendChild(fonts);
  const topbar=document.querySelector('.topbar-actions');
  if(topbar){const tools=document.createElement('div');tools.id='enterpriseHeaderTools';topbar.insertBefore(tools,topbar.querySelector('[title="Notifications"]'));}
  const launcher=document.querySelector('.nf-app-launcher');
  const menu=document.querySelector('.nav-menu');
  if(launcher && menu)menu.insertBefore(launcher,menu.firstChild);
  const toggle=document.getElementById('mobileMenuBtn');
  if(toggle){toggle.classList.remove('mobile-only');toggle.setAttribute('aria-label','Toggle navigation');toggle.title='Toggle navigation';toggle.addEventListener('click',()=>{if(window.innerWidth>860){document.body.classList.toggle('nf-nav-collapsed');document.getElementById('sidebar')?.classList.remove('open');}toggle.setAttribute('aria-expanded',String(window.innerWidth>860?!document.body.classList.contains('nf-nav-collapsed'):document.getElementById('sidebar')?.classList.contains('open')));});}
  document.querySelectorAll('.nav-item,.nf-nav-group-toggle').forEach(item=>item.title=item.textContent.trim());
  const sidebar=document.getElementById('sidebar');
  if(sidebar){const close=document.createElement('button');close.type='button';close.className='icon-btn enterprise-nav-close';close.textContent='×';close.setAttribute('aria-label','Close navigation');close.onclick=()=>sidebar.classList.remove('open');sidebar.prepend(close);}
  window.addEventListener('message',event=>{
    if(event.source!==window.parent || event.origin!==window.parent.location.origin)return;
    if(event.data?.type==='namdev-theme' && ['brand','ocean','forest','rose'].includes(event.data.theme))document.documentElement.dataset.theme=event.data.theme;
    if(event.data?.type==='namdev-launcher')openAppLauncher();
  });
})();
</script>`;