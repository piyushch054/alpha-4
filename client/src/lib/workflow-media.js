import leadershipUrl from '@/assets/ceo-bust.png';
const leadership = { url: leadershipUrl };
import twoWheeler from '@/assets/two-wheeler-demo.jpg';
import msme from '@/assets/msme-demo.jpg';
import lap from '@/assets/lap-demo.jpg';
import solar from '@/assets/solar-demo.jpg';
import tractor from '@/assets/tractor-demo.jpg';

// Resolve legacy image names through build-managed URLs without changing workflows.
const images = {
  'ceo-md.png': leadership.url,
  'two-wheeler.png': twoWheeler,
  'msme.png': msme,
  'lap.png': lap,
  'solar.png': solar,
  'tractor.png': tractor
};

export const workflowMediaScript = `<script>
(() => {
  const images = ${JSON.stringify(images)};
  const productImages = {'Two Wheeler':'two-wheeler.png','MSME':'msme.png','LAP':'lap.png','Solar Loan':'solar.png','Tractor Loan':'tractor.png'};
  const moduleIcons = {
    employeeProfile: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    hrms: '<circle cx="9" cy="8" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M19 15a5 5 0 0 1 3 5"/>',
    projectTasks: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 5V3h6v2M8 11l2 2 4-4M8 17h8"/>',
    assetInventory: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5"/>',
    auditManagement: '<path d="M12 3l8 4v5c0 5-8 9-8 9s-8-4-8-9V7zM8 12l3 3 5-6"/>',
    complianceManagement: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
    cctvMonitoring: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    adminManagement: '<path d="M4 21V5h10v16M14 9h6v12M8 9h2M8 13h2M8 17h2M2 21h20"/>',
    travelManagement: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M8 7v14M16 7v14"/>',
  };
  function updateMedia() {
    document.querySelectorAll('.product-select').forEach(card => {
      const product = Object.keys(productImages).find(name => (card.getAttribute('onclick') || '').includes("'" + name + "'"));
      if (!product) return;
      const selected = card.classList.contains('selected');
      if (card.getAttribute('aria-pressed') !== String(selected)) card.setAttribute('aria-pressed', String(selected));
      if (card.dataset.productVisual) return;
      card.dataset.productVisual = 'true';
      const photo = document.createElement('div');
      photo.className = 'nf-product-photo';
      const img = document.createElement('img');
      img.src = images[productImages[product]];
      img.alt = '';
      img.decoding = 'async';
      photo.appendChild(img);
      const indicator = document.createElement('div');
      indicator.className = 'nf-product-choice';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"/></svg>';
      photo.appendChild(indicator);
      card.insertBefore(photo, card.firstChild);
      const copy = card.querySelector('.product-icon + div');
      if (copy) copy.classList.add('nf-product-copy');
    });
    document.querySelectorAll('.nf-personalized-v2,.nf-suite-overview').forEach(section => section.classList.add('nf-soft-spectrum'));
    document.querySelectorAll('.nf-ceo-v2').forEach(dashboard => {
      dashboard.classList.add('nf-soft-spectrum');
      dashboard.querySelectorAll('.nf-exec-kpi').forEach((card, index) => {
        const icon = card.querySelector('.nf-kpi-top i');
        if (!icon || icon.dataset.polished) return;
        const paths = [moduleIcons.assetInventory, moduleIcons.travelManagement, moduleIcons.complianceManagement, moduleIcons.hrms, moduleIcons.auditManagement, moduleIcons.projectTasks, moduleIcons.cctvMonitoring, moduleIcons.auditManagement];
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[index % paths.length] + '</svg>';
        icon.dataset.polished = 'true';
      });
    });
    document.querySelectorAll('.nf-exec-kpi-strip,.nf-exec-main-grid,.nf-exec-secondary-grid,.nf-exec-ops-grid').forEach(section => section.classList.add('nf-boardroom-analytics'));
    document.querySelectorAll('.v7-module-grid').forEach(grid => {
      const panel = grid.closest('.v7-panel');
      if (!panel || panel.querySelector('h3')?.textContent !== 'Corporate Operations Suite') return;
      panel.classList.add('nf-suite-overview');
      grid.querySelectorAll('.v7-module-card').forEach(card => {
        const icon = card.querySelector('.v7-module-icon');
        if (!icon || icon.dataset.polished) return;
        const view = Object.keys(moduleIcons).find(key => (card.getAttribute('onclick') || '').includes(key));
        if (!view) return;
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + moduleIcons[view] + '</svg>';
        icon.dataset.polished = 'true';
      });
    });
    document.querySelectorAll('img').forEach(img => {
      const filename = (img.getAttribute('src') || '').split('/').pop();
      if (images[filename]) {
        img.src = images[filename];
        img.decoding = 'async';
        img.width = filename === 'ceo-md.png' ? 200 : 1024;
        img.height = filename === 'ceo-md.png' ? 200 : 768;
      }
    });
    document.querySelectorAll('.nf-command-campaign').forEach(banner => {
      banner.style.setProperty('--campaign-photo', 'url(' + JSON.stringify(images['msme.png']) + ')');
    });
  }
  new MutationObserver(updateMedia).observe(document.body, {childList: true, subtree: true});
  updateMedia();
})();
</script>`;