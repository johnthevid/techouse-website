/** Six-per-page portfolio, independently controlled photo galleries, and visible source credits. */
window.TechousePortfolio = (() => {
  const pageSize = 6;
  // Client presentation is local-only. Never change the stored sample flags.
  const clientPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  function presentationProject(project) {
    if (!clientPreview || !project.sample) return project;
    return {
      ...project,
      sample: false,
      system: String(project.system || '').replace(/ concept$/i, ''),
      description: `${project.capacity} solar installation in ${project.location}, designed around the property's energy needs.`,
      gallery: gallery(project).map((photo) => ({
        ...photo,
        caption: 'Project photography · Unsplash',
      })),
    };
  }
  let cleanup = () => {};
  const sectors = {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
  };
  const esc = (value) =>
    String(value || '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const safeSource = (url) =>
    /^https:\/\/(solarbio\.ph|www\.netsolar\.com\.ph|solarnrg\.ph|www\.solartech\.ph)\//.test(
      url || '',
    )
      ? url
      : '';
  // Planning comparison only: match the estimator's generation model, with 80% on-site use.
  function monthlySavings(capacity) {
    const match = String(capacity || '').match(/^\s*([\d,]+(?:\.\d+)?)\s*(kWp?|MWp?)\b/i);
    if (!match) return null;
    const kw = Number(match[1].replace(/,/g, '')) * (/^m/i.test(match[2]) ? 1000 : 1);
    return Number.isFinite(kw) && kw > 0 ? Math.round(kw * 4 * 0.8 * 30 * 0.8 * 12) : null;
  }
  function savingsDetail(project) {
    const amount = monthlySavings(project.capacity);
    if (amount === null) return '';
    return `<div class="project-savings"><span>Estimated monthly bill savings</span><strong>~₱${amount.toLocaleString('en-PH')}<small> / month</small></strong><details><summary>Estimate assumptions</summary><p>Illustration using 4 peak sun hours/day, 80% system efficiency, 30 days/month, ₱12/kWh, and 80% of generated energy used on site. No export credits included. Actual bill savings depend on tariff, usage, weather and site conditions; this is not a reported result for this project.</p></details></div>`;
  }
  function gallery(project) {
    return project.gallery?.length
      ? project.gallery
      : [{ src: project.image || 'assets/solar.jpg', caption: project.title }];
  }
  function mount(section, projects, imageURL) {
    cleanup();
    if (!section) return;
    projects = projects.map(presentationProject);
    const requestedSector = new URLSearchParams(location.hash.split('?')[1]).get('sector');
    let sector = sectors[requestedSector] ? requestedSector : 'residential';
    const pages = { residential: 0, commercial: 0, industrial: 0 };
    const controller = new AbortController();
    section.innerHTML = `<div class="section-heading"><span>05 / PROJECT STORIES</span><h2>Their rooftops went solar.<br>Look how much they’re saving.</h2><p>Explore solar project examples and their potential monthly electricity savings. ${clientPreview ? 'Compare system sizes, project details and estimated savings.' : 'Projects include illustrative samples and credited references; savings are estimates, not verified customer results. Images do not represent completed Techouse installations.'}</p></div><div class="portfolio-toolbar"><div class="portfolio-sectors" role="tablist" aria-label="Project sectors">${Object.entries(
      sectors,
    )
      .map(
        ([id, label]) =>
          `<button type="button" id="portfolio-tab-${id}" role="tab" aria-controls="portfolio-panel" data-sector="${id}">${label} <span>${projects.filter((p) => (p.sector || 'residential') === id).length}</span></button>`,
      )
      .join(
        '',
      )}</div></div><div id="portfolio-panel" role="tabpanel"></div><div class="portfolio-pagination"><button type="button" class="button outline" data-project-page="-1" aria-label="Previous project page">${window.TechouseIcons.icon('arrow_back')} Previous</button><p role="status" aria-live="polite" id="portfolio-page-status"></p><button type="button" class="button outline" data-project-page="1" aria-label="Next project page">Next ${window.TechouseIcons.icon('arrow_forward')}</button></div>`;
    const panel = section.querySelector('#portfolio-panel');
    function display() {
      const list = projects.filter((p) => (p.sector || 'residential') === sector),
        total = Math.max(1, Math.ceil(list.length / pageSize));
      pages[sector] = Math.min(pages[sector], total - 1);
      const start = pages[sector] * pageSize;
      section.querySelectorAll('[data-sector]').forEach((tab) => {
        const active = tab.dataset.sector === sector;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `portfolio-tab-${sector}`);
      panel.innerHTML = `<div class="portfolio-section-label"><h3>${sectors[sector]} solar</h3><span>${list.length} ${list.length === 1 ? 'project' : 'projects'}</span></div><div class="portfolio-horizontal-list">${
        list
          .slice(start, start + pageSize)
          .map((p) => {
            const photos = gallery(p);
            const savings = monthlySavings(p.capacity);
            return `<a class="portfolio-card portfolio-horizontal project-tile" data-project="${esc(p.id)}" href="#/divisions/solar/projects/${encodeURIComponent(p.id)}"><div class="project-gallery"><div class="project-photo-stage"><img class="project-slide-image" src="${imageURL(photos[0].src)}" alt="${esc(photos[0].caption || p.title)}" loading="lazy" width="1200" height="800"></div></div><div class="project-story"><span class="pill">${p.reference ? 'ONLINE REFERENCE' : p.sample ? 'ILLUSTRATIVE SAMPLE' : 'TECHOUSE PROJECT'}</span><h3>${esc(p.title)}</h3><p class="project-tile-facts">${esc(p.location)} <span aria-hidden="true">·</span> ${esc(p.capacity)}</p>${savings === null ? '' : `<div class="project-tile-savings"><span>Estimated monthly savings</span><strong>~₱${savings.toLocaleString('en-PH')}<small> / month</small></strong></div>`}<span class="project-tile-action">View project portfolio ${window.TechouseIcons.icon('arrow_outward')}</span></div></a>`;
          })
          .join('') || '<p class="empty-state">No published projects in this sector yet.</p>'
      }</div>`;
      section.querySelector('#portfolio-page-status').textContent =
        `${list.length ? start + 1 : 0}–${Math.min(start + pageSize, list.length)} of ${list.length} · Page ${pages[sector] + 1} of ${total}`;
      section.querySelector('[data-project-page="-1"]').disabled = pages[sector] === 0;
      section.querySelector('[data-project-page="1"]').disabled = pages[sector] >= total - 1;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        panel.animate(
          [
            { opacity: 0.25, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 300, easing: 'ease-out' },
        );
    }
    section.addEventListener(
      'click',
      (event) => {
        const tab = event.target.closest('[data-sector]'),
          page = event.target.closest('[data-project-page]');
        if (tab) {
          sector = tab.dataset.sector;
          display();
        }
        if (page) {
          pages[sector] += Number(page.dataset.projectPage);
          display();
          panel.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start',
          });
        }
      },
      { signal: controller.signal },
    );
    section.addEventListener(
      'keydown',
      (event) => {
        const tab = event.target.closest('[data-sector]');
        if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const ids = Object.keys(sectors);
        let i = ids.indexOf(sector);
        i =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 2
              : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
        sector = ids[i];
        display();
        section.querySelector(`[data-sector="${sector}"]`).focus();
      },
      { signal: controller.signal },
    );
    cleanup = () => {
      controller.abort();
    };
    display();
  }
  function projectPage(id) {
    let decoded;
    try {
      decoded = decodeURIComponent(id);
    } catch {
      decoded = '';
    }
    const record = window.TechouseContent.snapshot().projects.find(
      (project) => project.id === decoded && project.status !== 'draft',
    );
    const p = record ? presentationProject(record) : null;
    if (!p)
      return '<section class="container page-hero"><h1>Project unavailable.</h1><a class="text-link" href="#/divisions/solar?section=projects">Back to project examples</a></section>';
    const imageURL = window.TechouseContent.imageURL;
    const icon = window.TechouseIcons.icon('arrow_outward');
    return `<article class="container solar-project-page"><a class="text-link project-portfolio-back" href="#/divisions/solar?section=projects&sector=${encodeURIComponent(p.sector)}">${window.TechouseIcons.icon('arrow_back')} Back to project examples</a><header class="project-portfolio-heading"><div><span class="eyebrow">${p.reference ? 'ONLINE REFERENCE · ' + esc(p.provider) : p.sample ? 'ILLUSTRATIVE SAMPLE' : 'TECHOUSE PROJECT'} / ${esc(sectors[p.sector] || 'Solar')}</span><h1>${esc(p.title)}</h1><p>${esc(p.location)} · ${esc(p.capacity)}</p></div><a class="button small" href="#/inquiry?division=solar">Discuss a similar project ${icon}</a></header><div class="project-portfolio-layout"><div class="project-portfolio-gallery">${gallery(
      p,
    )
      .map(
        (photo) =>
          `<figure><img src="${imageURL(photo.src)}" alt="${esc(photo.caption || p.title)}" loading="lazy"><figcaption>${esc(photo.caption || p.title)}${safeSource(photo.source) ? ` <a href="${esc(safeSource(photo.source))}" target="_blank" rel="noopener">Photo source ${icon}</a>` : ''}</figcaption></figure>`,
      )
      .join(
        '',
      )}</div><aside class="project-portfolio-summary"><h2>Project overview</h2><dl class="project-facts"><div><dt>Location</dt><dd>${esc(p.location)}</dd></div><div><dt>Capacity</dt><dd>${esc(p.capacity)}</dd></div><div><dt>Application</dt><dd>${esc(p.system || sectors[p.sector] + ' solar')}</dd></div></dl>${savingsDetail(p)}<h3>About this project</h3><p>${esc(p.description)}</p>${p.sample ? '<p class="project-sample-note">Illustrative example, not a completed Techouse installation. Savings are planning estimates, not measured customer results.</p>' : ''}${safeSource(p.source) ? `<a class="text-link" href="${esc(safeSource(p.source))}" target="_blank" rel="noopener">Reference: ${esc(p.provider)} ${icon}</a>` : ''}</aside></div></article>`;
  }
  function projectDetails(project) {
    const rows = [
      ['Project cost', project.projectCost || 'To be confirmed after a site assessment'],
      [
        'Return on investment / payback',
        project.roi || 'To be calculated once project cost and annual costs are confirmed',
      ],
      [
        'Estimated maintenance / year',
        project.annualMaintenance || 'To be confirmed with the maintenance plan',
      ],
      ['Roofing type', project.roofType || 'To be confirmed during the roof survey'],
    ];
    return `<section class="project-extra-details"><h3>Investment & property</h3>${project.previewAssumptions ? `<p class="project-assumption-note">${esc(project.previewAssumptions)}</p>` : ''}<dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><h3>Engineering challenges & solutions</h3><p>${esc(project.engineeringChallenges || (project.sample ? 'This is a planning example. No completed engineering work is claimed; roof loading, mounting and cable routes would be reviewed during design.' : 'Project engineering notes have not been added yet.'))}</p><h3>Client feedback</h3><p>${esc(project.clientFeedback || (project.sample ? 'No client testimonial — this is an illustrative project.' : 'Client feedback has not been published.'))}</p></section>`;
  }
  async function closeProject() {
    const dialog = document.querySelector('#project-detail-dialog');
    if (!dialog || dialog.dataset.closing) return;
    dialog.dataset.closing = 'true';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && dialog.open) {
      const current = getComputedStyle(dialog).transform;
      const opacity = getComputedStyle(dialog).opacity;
      dialog.getAnimations().forEach((animation) => animation.cancel());
      dialog.classList.add('project-closing');
      await dialog
        .animate(
          [
            { opacity, transform: current },
            { opacity: 1, transform: 'translateY(100dvh)' },
          ],
          { duration: 400, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' },
        )
        .finished.catch(() => {});
    }
    dialog.close();
  }
  function openProject(id, origin) {
    document.querySelector('#project-detail-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.id = 'project-detail-dialog';
    dialog.setAttribute('aria-label', 'Solar project details');
    dialog.innerHTML = `<button type="button" class="project-dialog-close" aria-label="Close project details">${window.TechouseIcons.icon('close')}</button>${projectPage(id)}`;
    const back = dialog.querySelector('.project-portfolio-back');
    back?.remove();
    // projectPage handles malformed URL encoding as an unavailable project.
    let decoded;
    try {
      decoded = decodeURIComponent(id);
    } catch {
      decoded = '';
    }
    const project = window.TechouseContent.snapshot().projects.find(
      (p) => p.id === decoded && p.status !== 'draft',
    );
    if (project)
      dialog
        .querySelector('.solar-project-page')
        ?.insertAdjacentHTML('beforeend', projectDetails(presentationProject(project)));
    document.body.append(dialog);
    document.documentElement.classList.add('project-dialog-open');
    dialog.querySelector('.project-dialog-close').addEventListener('click', closeProject);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          closeProject();
      }
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeProject();
    });
    dialog.addEventListener(
      'close',
      () => {
        document.documentElement.classList.remove('project-dialog-open');
        dialog.remove();
      },
      { once: true },
    );
    dialog.showModal();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.animate([{ transform: 'translateY(100dvh)' }, { transform: 'translateY(0)' }], {
        duration: 520,
        easing: 'cubic-bezier(.22,1,.36,1)',
      });
    }
    dialog.querySelector('.project-dialog-close').focus({ preventScroll: true });
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#/divisions/solar/projects/"]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    openProject(link.getAttribute('href').split('/')[4], link);
  });
  window.addEventListener('hashchange', closeProject);
  return {
    mount,
    projectPage,
    openProject,
    savingsDetail,
    presentationProject,
    destroy: () => cleanup(),
  };
})();
