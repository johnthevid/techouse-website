/**
 * Solar catalogue data and category templates.
 * Add product records to products; keep manufacturer specifications and PDF asset paths verified.
 */
window.TechouseCatalogue = (() => {
  // EDITABLE PRODUCT RECORDS: category, display copy, specifications, image, and datasheet paths.
  const products = [
    {
      category: 'panels',
      title: 'QM210RTHCD Series',
      capacity: '620–640 W',
      subtitle: 'N-type bifacial modules',
      specs: [
        'Up to 23.7% module efficiency',
        '2382 × 1134 × 30 mm',
        '32.5 kg',
        '80% ± 5% bifaciality',
      ],
      image: 'assets/skyworth-products/module-g12r.png',
      websiteModel: 'G12R SERIES',
      imageSource: 'https://www.skyworth-pv.com/product/pv-module/modules/g12r-series',
      pdf: 'assets/Solar Documents/Skyworth Materials/Solar Panels/QM210RTHCD-620-640W-66-High Efficiency Series.pdf',
    },
    {
      category: 'panels',
      title: 'QM210NTHCD Series',
      capacity: '710–730 W',
      subtitle: 'High Efficiency Series-66',
      specs: [
        'Up to 23.6% module efficiency',
        '2384 × 1303 × 33 mm',
        '37.9 kg',
        '80% ± 5% bifaciality',
      ],
      image: 'assets/skyworth-products/module-g12.png',
      websiteModel: 'G12 SERIES',
      imageSource: 'https://www.skyworth-pv.com/product/pv-module/modules/g12-series',
      pdf: 'assets/Solar Documents/Skyworth Materials/Solar Panels/QM210NTHCD-710-730W-66-High Efficiency Series.pdf',
    },
    {
      category: 'panels',
      title: 'QM192AFCD BC Series',
      capacity: '650–685 W',
      subtitle: 'Back-contact modules',
      specs: [
        '24.1–25.4% module efficiency',
        '2382 × 1134 × 30 mm',
        '32.2 kg',
        '144 cells (72 × 2)',
      ],
      image: 'assets/skyworth-products/module-m10.png',
      websiteModel: 'M10 SERIES',
      imageSource: 'https://www.skyworth-pv.com/product/pv-module/modules/m10-series',
      pdf: 'assets/Solar Documents/Skyworth Materials/Solar Panels/QM192AFCD-650-685-72-BC Module.pdf',
    },
    {
      category: 'inverters',
      title: 'SWH Single Phase Hybrid G2',
      capacity: '3–12 kW',
      subtitle: 'Low-voltage hybrid inverter',
      specs: [
        '3 / 3.6 / 5 / 6 / 8 / 10 / 12 kW models',
        'IP66 ingress protection',
        'Up to 6 units in parallel operation',
        '20 A maximum DC input per string',
      ],
      image: 'assets/skyworth-products/hybrid-lv.png',
      websiteModel: 'SWH 3–6KL-S1',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/residential-ess/svh-3-6kl-s1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Inverters/SWH3-12KW--T1-G2 Single Phase Hybrid Inverter (LV).pdf',
    },
    {
      category: 'inverters',
      title: 'SWH Single Phase Hybrid SR',
      capacity: '3.6–6 kW',
      subtitle: 'Low-voltage hybrid inverter',
      specs: [
        'SWH3600L-S1-SR to SWH6000L-S1-SR',
        '48 V rated battery voltage',
        'IP65 ingress protection',
        '97.5% maximum efficiency',
      ],
      image: 'assets/skyworth-products/hybrid-lv.png',
      websiteModel: 'SWH 3–6KL-S1',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/residential-ess/svh-3-6kl-s1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Inverters/SWH3.6-6 kW  SR Single-phase Hybrid Inverter (Low Voltage).pdf',
    },
    {
      category: 'inverters',
      title: 'SW Three Phase On-grid',
      capacity: '30 / 40 / 50 kW',
      subtitle: 'Commercial on-grid inverter',
      specs: [
        'SW030KTL-T1-G2 / SW040KTL-T1-G2 / SW050KTL-T1-G2',
        '2 / 3 / 4 MPPTs respectively',
        'Up to 98.7% maximum efficiency',
        'IP66 ingress protection',
      ],
      image: 'assets/skyworth-products/ongrid-30-50.png',
      websiteModel: 'SW030–050 KTL-T1-G2',
      imageSource: 'https://www.skyworth-pv.com/product/pv-inverter/business/sw030-050-ktl-t1-g2',
      pdf: 'assets/Solar Documents/Skyworth Materials/Inverters/SW30-50  kW Three-Phase On-grid Inverter.pdf',
    },
    {
      category: 'inverters',
      title: 'SW Three Phase On-grid',
      capacity: '75–125 kW',
      subtitle: 'Large commercial on-grid inverter',
      specs: [
        '75 / 100 / 110 / 125 kW models',
        '8 or 10 MPPTs, depending on model',
        'Up to 99.0% maximum efficiency',
        'IP66 ingress protection',
      ],
      image: 'assets/skyworth-products/ongrid-40-60.png',
      websiteModel: 'SW40–60KTL-T1',
      imageSource: 'https://www.skyworth-pv.com/product/pv-inverter/business/sw40-60ktl-t1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Inverters/SW75-125kW-Three Phase On-grid Inverter.pdf',
    },
    {
      category: 'inverters',
      title: 'SWH Three Phase Hybrid G2',
      capacity: '50–100 kW',
      subtitle: 'High-voltage hybrid inverter',
      specs: [
        '50 / 75 / 80 / 99.99 / 100 kW nominal models',
        'Dual independent battery inputs',
        'IP66 ingress protection',
        'Backup switching requires the specified STS equipment',
      ],
      image: 'assets/skyworth-products/hybrid-hv.png',
      websiteModel: 'SVH 29–50KH-T1',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/c-i-ess/swh-29-50kh-t1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Inverters/SWH50-100KH-T1-G2（HV).pdf',
    },
    {
      category: 'batteries',
      title: 'SWR Low Voltage Battery',
      capacity: '5.12 / 10.49 / 16.07 kWh',
      subtitle: 'Lithium battery energy storage',
      specs: [
        'SWR5.12-L2-SW-SA / SWR10.49-L2-SW-SA / SWR16.07-L2-SW-SA',
        '51.2 V rated voltage · LFP chemistry',
        'IP30 protection',
        'Wall or floor mounting',
      ],
      image: 'assets/skyworth-products/battery-hv.png',
      websiteModel: 'SWR5.12–20.48-H1',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/residential-ess/svr-5-20k-h1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Batteries/SWR 5.1210.4916.07 kWh.pdf',
    },
    {
      category: 'batteries',
      title: 'SWR Residential Storage',
      capacity: '5 kWh usable',
      subtitle: 'Residential PV & battery solutions',
      specs: [
        'SWR5.12-H1-GS / SWR5.12-L1-GW / SWR5.12-L2-GR',
        'LFP chemistry',
        'High- and low-voltage options',
        'Protection and mounting vary by model; see brochure',
      ],
      image: 'assets/skyworth-products/battery-hv.png',
      websiteModel: 'SWR5.12–20.48-H1',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/residential-ess/svr-5-20k-h1',
      pdf: 'assets/Solar Documents/Skyworth Materials/Batteries/EN_Residential PV & Battery-202604.pdf',
    },
    {
      category: 'batteries',
      title: 'Commercial & Industrial Storage',
      capacity: '61.4–261.25 kWh',
      subtitle: 'PV & battery solution range',
      specs: [
        'SWC61.4-H1-GC / SWC102.4-H1-GC / SWC112.6-H1-GC',
        'SWS-P125E261-HC-G2: 261.25 kWh nominal energy',
        'LFP chemistry',
        'System design and cooling depend on the selected model',
      ],
      image: 'assets/skyworth-products/storage-cabinet.png',
      websiteModel: 'SWS-P100E215-HC',
      imageSource:
        'https://www.skyworth-pv.com/product/battery-storage-system/c-i-ess/sws-p100e215-hc',
      pdf: 'assets/Solar Documents/Skyworth Materials/Batteries/EN_C&I PV & Battery-202604.pdf',
    },
  ];
  const labels = { panels: 'Solar panels', inverters: 'Inverters', batteries: 'Battery storage' };
  function page(category) {
    if (!labels[category])
      return '<section class="container page-hero"><h1>Product category unavailable.</h1><a href="#/divisions/solar">Return to Solar</a></section>';
    const selected = products.filter((p) => p.category === category);
    const introductions = {
      panels:
        'Start with the surface that captures the sun. Explore module ranges and compare the details that matter for your roof.',
      inverters:
        'Connect solar generation to everyday use. Explore on-grid and hybrid ranges for your property.',
      batteries:
        'Make room for energy beyond daylight. Explore storage ranges for homes, businesses and larger facilities.',
    };
    const icon = window.TechouseIcons.icon('arrow_outward');
    return `<article class="catalogue-page catalogue-refined" data-category="${category}"><div class="container">
      <div class="breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/divisions/solar">Solar</a><span>/</span><span>${labels[category]}</span></div>
      <section class="catalogue-intro catalogue-banner" aria-labelledby="catalogue-title"><img class="catalogue-banner-image" src="assets/skyworth-products/${category}.jpg" alt="Skyworth ${labels[category]} product-family scene" fetchpriority="high"><div class="catalogue-banner-shade"></div>
        <div><h1 id="catalogue-title">${labels[category]}.</h1></div>
        <div class="catalogue-intro-copy"><p>${introductions[category]}</p></div>
      </section>
      <nav class="catalogue-tabs" aria-label="Product categories">${Object.entries(labels)
        .map(
          ([id, label]) =>
            `<a href="#/divisions/solar/products/${id}" ${id === category ? 'aria-current="page"' : ''}>${label}<span class="catalogue-tab-count" aria-label="${products.filter((product) => product.category === id).length} items">${products.filter((product) => product.category === id).length}</span></a>`,
        )
        .join('')}</nav>
      <div class="catalogue-products">${selected
        .map(
          (p, index) => `<article class="catalogue-product">
        <figure class="catalogue-product-figure"><div class="catalogue-image"><img src="${p.image}" alt="Skyworth ${p.websiteModel} product-family illustration" loading="lazy"></div></figure>
        <div class="catalogue-copy"><span class="catalogue-product-kicker">${String(index + 1).padStart(2, '0')} / ${p.subtitle}</span><h2>${p.title}</h2><strong class="catalogue-capacity">${p.capacity}</strong>
        <details class="model-specifications"><summary>Technical details</summary><p class="catalogue-image-reference">Website image: ${p.websiteModel} · related product family</p><ul>${p.specs.map((spec) => `<li>${spec}</li>`).join('')}</ul></details>
        <div class="catalogue-actions"><a class="button small" href="${encodeURI(p.pdf)}" target="_blank" rel="noopener">View datasheet ${icon}</a><a class="text-link" href="#/inquiry?division=solar">Enquire ${icon}</a></div></div>
      </article>`,
        )
        .join('')}</div>
      <div class="catalogue-footnote"><p>Specifications follow the linked manufacturer datasheets. Website images illustrate related Skyworth product families; the image model is named in Technical details and may differ from the listed range.</p><p>Our team can confirm exact equipment, compatibility and availability for your project.</p></div>
      <section class="catalogue-partnership" aria-label="Techouse and Skyworth partnership"><div class="catalogue-partner-identity"><span>TECHOUSE × SKYWORTH</span><strong>SKYWORTH</strong><small>Direct solar partner</small></div><div class="catalogue-partner-message"><h2>Skyworth equipment.<br>Your project, with Techouse.</h2><p>Talk to our solar team about panels, inverters and battery storage suited to your property.</p><a class="text-link" href="#/inquiry?division=solar">Talk to our solar team ${icon}</a></div></section>
      <a class="back-divisions" href="#/divisions/solar">← Back to Solar energy</a>
    </div></article>`;
  }
  function showcase() {
    const groups = [
      ['panels', '01 / GENERATE', 'Solar panels', 'panels.jpg', 'M10-series illustration'],
      ['inverters', '02 / CONVERT', 'Inverters', 'inverters.jpg', 'SWH 3–6KL-S1 illustration'],
      [
        'batteries',
        '03 / STORE',
        'Battery storage',
        'batteries.jpg',
        'SWR high-voltage range illustration',
      ],
    ];
    return `<div class="skyworth-showcase">${groups
      .map(([category, , title, image, caption]) => {
        return `<article class="skyworth-range-card"><div class="skyworth-range-visual"><img src="assets/skyworth-products/${image}" alt="Skyworth ${caption}" loading="lazy"></div><div class="skyworth-range-copy"><h3>${title}</h3><a class="text-link" href="#/divisions/solar/products/${category}" aria-label="View all ${title.toLowerCase()} models">View all models ${window.TechouseIcons.icon('arrow_outward')}</a></div></article>`;
      })
      .join(
        '',
      )}</div><p class="catalogue-note">Images illustrate Skyworth product families; exact model appearance and availability require confirmation.</p>`;
  }
  const categoryOrder = ['panels', 'inverters', 'batteries'];
  const slideMotion = { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' };
  const preloadedBanners = new Set();
  let finishSlide = () => {};
  let resizeFrame = 0;

  function categoryDocument(category) {
    const template = document.createElement('template');
    template.innerHTML = page(category);
    return template.content;
  }

  // Keep the banner stable; let the product area fit each category’s natural height.
  function revealBanner() {
    finishSlide();
    const catalogue = document.querySelector('.catalogue-page');
    if (!catalogue) return;
    const container = catalogue.querySelector('.container');
    const measure = document.createElement('div');
    measure.className = 'catalogue-page catalogue-refined';
    Object.assign(measure.style, {
      position: 'absolute',
      visibility: 'hidden',
      pointerEvents: 'none',
      width: container.clientWidth + 'px',
      left: '0',
      top: '0',
    });
    measure.inert = true;
    document.body.append(measure);
    let bannerHeight = 0;
    for (const category of categoryOrder) {
      const content = categoryDocument(category);
      measure.replaceChildren(content.querySelector('.catalogue-banner'));
      bannerHeight = Math.max(
        bannerHeight,
        measure.querySelector('.catalogue-banner').getBoundingClientRect().height,
      );
      if (!preloadedBanners.has(category)) {
        const image = new Image();
        image.src = 'assets/skyworth-products/' + category + '.jpg';
        preloadedBanners.add(category);
      }
    }
    measure.remove();
    catalogue.style.setProperty('--catalogue-banner-height', Math.ceil(bannerHeight) + 'px');
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('.catalogue-tabs a');
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
    if (link.hasAttribute('aria-current')) return;
    finishSlide();
    const catalogue = document.querySelector('.catalogue-page');
    const current = catalogue.dataset.category;
    const next = link.getAttribute('href').split('/').pop();
    const direction = categoryOrder.indexOf(next) > categoryOrder.indexOf(current) ? 1 : -1;
    const content = categoryDocument(next);
    const animations = [],
      cleanups = [];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const selector of ['.catalogue-banner', '.catalogue-products']) {
      const outgoing = catalogue.querySelector(selector);
      const incoming = content.querySelector(selector);
      const frame = document.createElement('div');
      frame.className = 'catalogue-slide-viewport';
      const track = document.createElement('div');
      track.className = 'catalogue-slide-track';
      const startHeight = outgoing.getBoundingClientRect().height;
      frame.style.height = startHeight + 'px';
      if (selector === '.catalogue-banner') frame.classList.add('catalogue-slide-banner');
      outgoing.before(frame);
      frame.append(track);
      track.append(...(direction > 0 ? [outgoing, incoming] : [incoming, outgoing]));
      outgoing.inert = true;
      outgoing.setAttribute('aria-hidden', 'true');
      outgoing.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      incoming.querySelectorAll('img').forEach((image) => {
        image.loading = 'eager';
      });
      const endHeight = incoming.getBoundingClientRect().height;
      frame.style.height = endHeight + 'px';
      if (!reducedMotion && Math.abs(startHeight - endHeight) > 1)
        animations.push(
          frame.animate(
            [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
            slideMotion,
          ),
        );
      const from = direction > 0 ? 'translateX(0)' : 'translateX(-50%)';
      const to = direction > 0 ? 'translateX(-50%)' : 'translateX(0)';
      track.style.transform = to;
      if (!reducedMotion)
        animations.push(track.animate([{ transform: from }, { transform: to }], slideMotion));
      cleanups.push(() => frame.replaceWith(incoming));
    }
    catalogue.dataset.category = next;
    catalogue.querySelector('.breadcrumb > span:last-child').textContent = labels[next];
    catalogue.querySelectorAll('.catalogue-tabs a').forEach((tab) => {
      if (tab === link) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    document.title = 'Skyworth ' + labels[next] + ' — Techouse';
    history.pushState(null, '', link.getAttribute('href'));
    let finished = false;
    finishSlide = () => {
      if (finished) return;
      finished = true;
      animations.forEach((animation) => animation.cancel());
      cleanups.forEach((cleanup) => cleanup());
      if (finishSlide === finish) finishSlide = () => {};
    };
    const finish = finishSlide;
    Promise.all(animations.map((animation) => animation.finished.catch(() => {}))).then(finish);
  });
  window.addEventListener('resize', () => {
    if (resizeFrame || !document.querySelector('.catalogue-page')) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      revealBanner();
    });
  });
  return { page, showcase, revealBanner };
})();
