/** Six-per-page portfolio, independently controlled photo galleries, and visible source credits. */
window.TechousePortfolio = (() => {
  const pageSize = 6;
  // Client presentation is local-only. Never change the stored sample flags.
  const clientPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  function presentationProject(project) {
    // Local preview polish applies to the solar samples only.
    if (!clientPreview || !project.sample || divisionOf(project) !== 'solar') return project;
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
  // Every division has its own categories, key-fact label and showcase heading.
  // Keep ids in step with platform/worker.mjs (projectDivisions).
  const divisions = {
    solar: {
      name: 'Solar',
      sectors: { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial' },
      fact: 'System capacity',
      factHint: 'For example, 10.5 kWp',
      kicker: 'Project stories',
      heading: 'Their rooftops went solar.<br>Look how much they’re saving.',
      intro: 'Explore solar project examples and their potential monthly electricity savings.',
      noun: 'solar',
    },
    construction: {
      name: 'Construction',
      sectors: { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial' },
      fact: 'Scope',
      factHint: 'For example, 3-storey house · cast-in-place',
      kicker: 'In the field',
      heading: 'Built, and<br>standing.',
      intro: 'Homes, workplaces and facilities from our construction teams.',
      noun: 'construction',
    },
    prefabrication: {
      name: 'Prefabrication',
      sectors: {
        housing: 'Housing',
        institutional: 'Schools & dormitories',
        commercial: 'Commercial',
      },
      fact: 'Modules',
      factHint: 'For example, 6 modules · 3 storeys',
      kicker: 'In the field',
      heading: 'Modules,<br>put to work.',
      intro: 'Precast homes, classrooms and spaces assembled from our modules.',
      noun: 'prefabrication',
    },
    development: {
      name: 'Real estate',
      sectors: { residential: 'Residential', commercial: 'Commercial', 'mixed-use': 'Mixed-use' },
      fact: 'Scale',
      factHint: 'For example, 24 units · 1.2 hectares',
      kicker: 'In the field',
      heading: 'Places we’ve<br>helped shape.',
      intro: 'Developments we have planned and delivered.',
      noun: 'development',
    },
    elevators: {
      name: 'Elevators',
      sectors: {
        installation: 'New installation',
        maintenance: 'Maintenance',
        modernisation: 'Modernisation',
      },
      fact: 'Lift',
      factHint: 'For example, Hitachi passenger lift · 8 floors',
      kicker: 'In the field',
      heading: 'Lifts we’ve installed<br>and keep running.',
      intro: 'Installations, maintenance contracts and modernisations across our three brands.',
      noun: 'elevator',
    },
  };
  const divisionOf = (project) => (divisions[project.division] ? project.division : 'solar');
  const kindOf = (project) => divisions[divisionOf(project)];
  const sectorOf = (project) => {
    const keys = Object.keys(kindOf(project).sectors);
    return keys.includes(project.sector) ? project.sector : keys[0];
  };
  // Published projects first; built-in samples only stand in while a division has none.
  const divisionSamples = (division) =>
    (window.TechouseDivisionSamples || []).filter((p) => p.division === division);
  function findProject(id) {
    const published = window.TechouseContent.snapshot().projects.filter(
      (p) => p.status !== 'draft',
    );
    const record = published.find((p) => p.id === id);
    if (record) return record;
    const fallback = (window.TechouseDivisionSamples || []).find((p) => p.id === id);
    return fallback && !published.some((p) => divisionOf(p) === fallback.division)
      ? fallback
      : null;
  }
  const projectHref = (project) =>
    `#/divisions/${divisionOf(project)}/projects/${encodeURIComponent(project.id)}`;
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
  function mount(section, projects, imageURL, division = 'solar') {
    cleanup();
    if (!section) return;
    const kind = divisions[division] || divisions.solar;
    const sectors = kind.sectors;
    const solar = kind === divisions.solar;
    projects = projects.filter((p) => divisionOf(p) === division);
    const usingSamples = !projects.length && division !== 'solar';
    if (usingSamples) projects = divisionSamples(division);
    projects = projects.map(presentationProject);
    const requestedSector = new URLSearchParams(location.hash.split('?')[1]).get('sector');
    const firstWithProjects =
      Object.keys(sectors).find((id) => projects.some((p) => sectorOf(p) === id)) ||
      Object.keys(sectors)[0];
    let sector = sectors[requestedSector] ? requestedSector : firstWithProjects;
    const pages = Object.fromEntries(Object.keys(sectors).map((id) => [id, 0]));
    const controller = new AbortController();
    const note = usingSamples
      ? 'These are illustrative samples with placeholder photos; our own project stories will replace them.'
      : solar
        ? clientPreview
          ? 'Compare system sizes, project details and estimated savings.'
          : 'Projects include illustrative samples and credited references; savings are estimates, not verified customer results. Images do not represent completed Techouse installations.'
        : '';
    const heading = `<div class="section-heading"><span>${solar ? '05 / ' : ''}${kind.kicker}</span><h2>${kind.heading}</h2><p>${kind.intro}${note ? ' ' + note : ''}</p></div>`;
    // A division without published projects yet keeps its place on the page with an honest note.
    if (!projects.length) {
      section.innerHTML = `${heading}<div class="portfolio-coming-soon"><span>${window.TechouseIcons.icon('construction')}</span><div><h3>Project stories are on the way.</h3><p>We’re preparing photos and details of our ${kind.noun} work. In the meantime, tell us about your project and we’ll share relevant examples.</p><a class="text-link" href="#/inquiry?division=${division}">Start a conversation ${window.TechouseIcons.icon('arrow_outward')}</a></div></div>`;
      cleanup = () => {};
      return;
    }
    section.innerHTML = `${heading}<div class="portfolio-toolbar"><div class="portfolio-sectors" role="tablist" aria-label="Project sectors">${Object.entries(
      sectors,
    )
      .map(
        ([id, label]) =>
          `<button type="button" id="portfolio-tab-${id}" role="tab" aria-controls="portfolio-panel" data-sector="${id}">${label} <span>${projects.filter((p) => sectorOf(p) === id).length}</span></button>`,
      )
      .join(
        '',
      )}</div></div><div id="portfolio-panel" role="tabpanel"></div><div class="portfolio-pagination"><button type="button" class="button outline" data-project-page="-1" aria-label="Previous project page">${window.TechouseIcons.icon('arrow_back')} Previous</button><p role="status" aria-live="polite" id="portfolio-page-status"></p><button type="button" class="button outline" data-project-page="1" aria-label="Next project page">Next ${window.TechouseIcons.icon('arrow_forward')}</button></div>`;
    const panel = section.querySelector('#portfolio-panel');
    function display() {
      const list = projects.filter((p) => sectorOf(p) === sector),
        total = Math.max(1, Math.ceil(list.length / pageSize));
      pages[sector] = Math.min(pages[sector], total - 1);
      const start = pages[sector] * pageSize;
      section.querySelectorAll('[data-sector]').forEach((tab) => {
        const active = tab.dataset.sector === sector;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `portfolio-tab-${sector}`);
      panel.innerHTML = `<div class="portfolio-section-label"><h3>${sectors[sector]}${solar ? ' solar' : ''}</h3><span>${list.length} ${list.length === 1 ? 'project' : 'projects'}</span></div><div class="portfolio-horizontal-list">${
        list
          .slice(start, start + pageSize)
          .map((p) => {
            const photos = gallery(p);
            const savings = solar ? monthlySavings(p.capacity) : null;
            return `<a class="portfolio-card portfolio-horizontal project-tile" data-project="${esc(p.id)}" href="${projectHref(p)}"><div class="project-gallery"><div class="project-photo-stage"><img class="project-slide-image" src="${imageURL(photos[0].src)}" alt="${esc(photos[0].caption || p.title)}" loading="lazy" width="1200" height="800"></div></div><div class="project-story"><span class="pill">${p.reference ? 'Online reference' : p.sample ? 'Illustrative sample' : 'Techouse project'}</span><h3>${esc(p.title)}</h3><p class="project-tile-facts">${esc(p.location)} <span aria-hidden="true">·</span> ${esc(p.capacity)}</p>${savings === null ? '' : `<div class="project-tile-savings"><span>Estimated monthly savings</span><strong>~₱${savings.toLocaleString('en-PH')}<small> / month</small></strong></div>`}<span class="project-tile-action">View project portfolio ${window.TechouseIcons.icon('arrow_outward')}</span></div></a>`;
          })
          .join('') || '<p class="empty-state">No published projects in this sector yet.</p>'
      }</div>`;
      section.querySelector('#portfolio-page-status').textContent =
        `${list.length ? start + 1 : 0}–${Math.min(start + pageSize, list.length)} of ${list.length} · Page ${pages[sector] + 1} of ${total}`;
      // One page needs no paging controls; the heading already counts the projects.
      section.querySelector('.portfolio-pagination').hidden = total <= 1;
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
              ? ids.length - 1
              : (i + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length;
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
    const record = findProject(decoded);
    const p = record ? presentationProject(record) : null;
    const routeDivision = location.hash.split('/')[2] || 'solar';
    if (!p)
      return `<section class="container page-hero"><h1>Project unavailable.</h1><a class="text-link" href="#/divisions/${esc(divisions[routeDivision] ? routeDivision : 'solar')}?section=projects">Back to project examples</a></section>`;
    const kind = kindOf(p);
    const division = divisionOf(p);
    const solar = division === 'solar';
    const sectorLabel = kind.sectors[sectorOf(p)];
    const imageURL = window.TechouseContent.imageURL;
    const icon = window.TechouseIcons.icon('arrow_outward');
    return `<article class="container solar-project-page" data-division="${division}"><a class="text-link project-portfolio-back" href="#/divisions/${division}?section=projects&sector=${encodeURIComponent(sectorOf(p))}">${window.TechouseIcons.icon('arrow_back')} Back to project examples</a><header class="project-portfolio-heading"><div><span class="eyebrow">${p.reference ? 'ONLINE REFERENCE · ' + esc(p.provider) : p.sample ? 'Illustrative sample' : 'Techouse project'} / ${esc(sectorLabel)}</span><h1>${esc(p.title)}</h1><p>${esc(p.location)} · ${esc(p.capacity)}</p></div><a class="button small" href="#/inquiry?division=${division}">Discuss a similar project ${icon}</a></header><div class="project-portfolio-layout"><div class="project-portfolio-gallery">${gallery(
      p,
    )
      .map(
        (photo) =>
          `<figure><img src="${imageURL(photo.src)}" alt="${esc(photo.caption || p.title)}" loading="lazy"><figcaption>${esc(photo.caption || p.title)}${safeSource(photo.source) ? ` <a href="${esc(safeSource(photo.source))}" target="_blank" rel="noopener">Photo source ${icon}</a>` : ''}</figcaption></figure>`,
      )
      .join(
        '',
      )}</div><aside class="project-portfolio-summary"><h2>Project overview</h2><dl class="project-facts"><div><dt>Location</dt><dd>${esc(p.location)}</dd></div><div><dt>${solar ? 'Capacity' : esc(kind.fact)}</dt><dd>${esc(p.capacity)}</dd></div><div><dt>${solar ? 'Application' : 'Category'}</dt><dd>${esc(p.system || sectorLabel + (solar ? ' solar' : ''))}</dd></div></dl>${solar ? savingsDetail(p) : ''}<h3>About this project</h3><p>${esc(p.description)}</p>${p.sample ? `<p class="project-sample-note">Illustrative example, not completed Techouse work.${solar ? ' Savings are planning estimates, not measured customer results.' : ''}</p>` : ''}${safeSource(p.source) ? `<a class="text-link" href="${esc(safeSource(p.source))}" target="_blank" rel="noopener">Reference: ${esc(p.provider)} ${icon}</a>` : ''}</aside></div></article>`;
  }
  function projectDetails(project) {
    const story = `<h3>Engineering challenges & solutions</h3><p>${esc(project.engineeringChallenges || (project.sample ? 'This is a planning example. No completed engineering work is claimed.' : 'Project engineering notes have not been added yet.'))}</p><h3>Client feedback</h3><p>${esc(project.clientFeedback || (project.sample ? 'No client testimonial — this is an illustrative project.' : 'Client feedback has not been published.'))}</p>`;
    if (divisionOf(project) !== 'solar')
      return `<section class="project-extra-details">${project.projectCost ? `<h3>Investment</h3><dl><div><dt>Project cost</dt><dd>${esc(project.projectCost)}</dd></div></dl>` : ''}${story}</section>`;
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
    dialog.setAttribute('aria-label', 'Project details');
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
    const project = findProject(decoded);
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
    const link = event.target.closest('a[href^="#/divisions/"][href*="/projects/"]');
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
    divisions,
    divisionOf,
    mount,
    projectPage,
    openProject,
    savingsDetail,
    presentationProject,
    destroy: () => cleanup(),
  };
})();
