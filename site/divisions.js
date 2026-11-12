/**
 * Division page templates, illustrative solar budget calculation, and shared page transitions.
 * Production email, database storage, and engineering assessment are not implemented here.
 */
/* Dedicated division experiences and banner-to-page navigation. */
window.TechouseDivisions = (() => {
  let entering = false;
  // BASE SOLAR MARKUP: solar-journey.js rearranges these sections before other enhancements mount.
  const solar = `<section class="partner-band"><span>TECHOUSE SOLAR / OUR PARTNER</span><div><strong>SKYWORTH</strong><p>Your direct Skyworth partner.<br>One conversation, from product selection to your solar project.</p></div></section>
  <section class="division-section" id="products"><div class="section-heading"><span>01 / THE SYSTEM</span><h2>Good energy.<br>Working together.</h2><p>Discover Skyworth panels, inverters and storage systems. Explore each range, compare specifications and view the manufacturer’s datasheets.</p></div><div class="product-grid">
  <article><div class="product-art brochure-art"><img src="assets/solar-catalogue/datasheet-10.jpg" alt="Skyworth 620–640 W solar panel brochure" loading="lazy"></div><small>01 / GENERATE</small><h3>Solar panels</h3><p>Capture sunlight for your home or business. Panel selection follows your available space and energy goals.</p><a href="#/divisions/solar/products/panels">Explore panels ↗</a></article>
  <article><div class="product-art brochure-art"><img src="assets/solar-catalogue/datasheet-5.jpg" alt="Skyworth 3–12 kW hybrid inverter brochure" loading="lazy"></div><small>02 / CONVERT</small><h3>Inverters</h3><p>Connect generation to everyday use. Explore grid-tied or hybrid configurations with the team.</p><a href="#/divisions/solar/products/inverters">Explore inverters ↗</a></article>
  <article><div class="product-art brochure-art"><img src="assets/solar-catalogue/datasheet-2.jpg" alt="Skyworth SWR battery range brochure" loading="lazy"></div><small>03 / STORE</small><h3>Battery storage</h3><p>Discuss backup priorities and storage options for a system designed around your needs.</p><a href="#/divisions/solar/products/batteries">Explore battery storage ↗</a></article></div><p class="catalogue-note">Skyworth product ranges · Select a category to explore models and datasheets.</p></section>
  <section class="project-showcase division-section" id="projects"><div class="section-heading"><span>02 / IN THE FIELD</span><h2>Energy, put to work.</h2><p>A home for our completed solar installations. Project photos, locations and system details will appear here as the portfolio is added.</p></div><div class="project-placeholder"><img src="assets/solar.jpg" alt="Illustrative solar rooftop, not a completed Techouse installation" loading="lazy"><div><span>PAST PROJECTS / PORTFOLIO PREVIEW</span><h3>The next story<br>starts on a rooftop.</h3><p>Approved Techouse project stories coming soon.</p></div></div></section>
  <section class="estimator division-section" id="estimator"><div class="section-heading"><span>03 / PLAN YOUR PROJECT</span><h2>What could solar<br>look like for you?</h2><p>Get a starting budget using editable sample assumptions. A site assessment and equipment selection will determine your final proposal.</p></div><form id="solar-estimator"><div class="estimate-inputs"><label>Monthly electricity bill (₱)<input name="bill" type="number" min="500" max="1000000" step="100" value="6000" required></label><label>Electricity rate (₱ / kWh)<input name="rate" type="number" min="1" max="100" step="0.1" value="12" required></label><label>Target energy offset (%)<input name="offset" type="range" min="20" max="100" step="5" value="80"><output id="offset-value">80%</output></label><label>System type<select name="system"><option value="grid">Grid-tied</option><option value="hybrid">Hybrid + sample 5 kWh battery</option></select></label><details><summary>Edit budget assumptions</summary><label>Installed base price (₱ / kWp)<input name="price" type="number" min="10000" max="200000" step="1000" value="45000" required></label><label>Battery allowance (₱)<input name="battery" type="number" min="0" max="2000000" step="1000" value="120000" required></label><p>Sample inputs only; these are not Techouse prices.</p></details></div><div class="estimate-result" aria-live="polite" aria-atomic="true" id="estimate-result"></div></form><p class="estimate-disclaimer">Planning illustration only, not a quotation or savings guarantee. Assumes 4 peak sun hours/day, 80% system efficiency and 30 days/month; budget range is ±15%. Energy offset assumes generation can be used on site; no export credits are assumed. Roof suitability, shading, permits, electrical upgrades, actual tariffs and battery sizing need assessment.</p></section>`;
  function constructionContent() {
    const icon = window.TechouseIcons.icon('arrow_outward');
    const types = [
      [
        'Residential',
        'A home for what comes next.',
        'Tell us about the home you have in mind, the people it is for and your site.',
        'home_work',
      ],
      [
        'Commercial',
        'A space for your business.',
        'Share how the space needs to work for your customers, your team and your daily operations.',
        'construction',
      ],
      [
        'Industrial',
        'Room for your operations.',
        'Start with the intended use, site requirements and the way your facility needs to function.',
        'factory',
      ],
    ];
    return `<nav class="division-subnav construction-subnav" aria-label="Construction sections"><a href="#construction-start" data-scroll="construction-start">Your project</a><a href="#construction-process" data-scroll="construction-process">The next steps</a><a href="#construction-questions" data-scroll="construction-questions">Common questions</a></nav><div class="division-wrap construction-content"><section id="construction-start" class="division-section"><div class="section-heading"><h2>What are you<br>planning to build?</h2><p>Choose a starting point. Share your requirements so our team can review the scope with you.</p></div><div class="construction-project-types">${types.map(([name, heading, text, symbol]) => `<a class="construction-type" href="#/inquiry?division=construction&project=${name.toLowerCase()}"><div class="construction-type-top">${window.TechouseIcons.icon(symbol)}<span>${name}</span></div><h3>${heading}</h3><p>${text}</p><span class="construction-type-action">Discuss your project ${icon}</span></a>`).join('')}</div><p class="construction-scope-note">Project requirements, service coverage and delivery scope are confirmed with our team.</p></section><section id="construction-process" class="division-section construction-process"><div class="section-heading"><h2>A clear brief.<br>A better starting point.</h2><p>From an early idea to an existing set of plans, start with what you already know.</p></div><ol><li><strong>Share your idea</strong><p>Tell us your location, intended use, approximate floor area and target schedule.</p></li><li><strong>Review the requirements</strong><p>Discuss your plans, site conditions and priorities with our team.</p></li><li><strong>Define the next step</strong><p>Agree on the proposed scope, responsibilities and requirements before proceeding.</p></li></ol></section><section class="construction-brief"><div><h2>Bring what you have.<br>We’ll start there.</h2><p>You don’t need every detail ready to start a conversation.</p></div><ul><li>Site location and approximate area</li><li>Building use and preferred spaces</li><li>Available drawings or reference images</li><li>Target timeline and budget range</li></ul><a class="button" href="#/inquiry?division=construction">Let’s start building ${icon}</a></section><section id="construction-questions" class="division-section construction-questions"><div class="section-heading"><h2>A few useful<br>starting questions.</h2></div><details><summary>Can I inquire without complete plans?</summary><p>Yes. Share your idea, location and any references you have. The information needed for the next stage can be discussed with the team.</p></details><details><summary>Can I get a construction price online?</summary><p>A useful proposal needs a defined scope and project details. Share your area, intended use and available plans so the team can review what is needed.</p></details><details><summary>What if I’m considering a prefabricated building?</summary><p>Explore our Prefabrication division, then discuss the approach that fits your plans.</p><a class="text-link" href="#/divisions/prefabrication">Explore prefabrication ${icon}</a></details></section></div>`;
  }
  function page(d, divisions, art, arrow) {
    return `<article class="division-experience"><section class="division-cover">${window.TechouseContent?.snapshot().images[d.id] ? `<img src="${window.TechouseContent.imageURL(window.TechouseContent.snapshot().images[d.id])}" alt="${d.alt || d.short}" fetchpriority="high">` : d.image ? `<img src="assets/${d.image}" alt="${d.alt}" fetchpriority="high">` : art}<div class="cover-shade"></div><div class="cover-copy"><a href="#/" class="back-divisions">← All divisions</a>${['solar', 'construction'].includes(d.id) ? '' : `<span>TECHOUSE / DIVISION ${d.number}</span>`}${['solar', 'construction'].includes(d.id) ? '' : `<div class="division-category-icon" aria-hidden="true">${window.TechouseIcons.icon({ solar: 'solar_power', construction: 'construction', prefabrication: 'shapes', development: 'real_estate_agent', elevators: 'elevator' }[d.id])}</div>`}<h1>${d.id === 'solar' ? 'Turn sunlight into<br>everyday savings.' : d.id === 'construction' ? 'Build your<br>next chapter.' : d.short + '.'}</h1><p>${d.id === 'solar' ? 'Looking at your electricity bill differently? Explore what solar could mean for your property.' : d.tagline}</p><a class="button" href="${d.id === 'solar' ? '#solar-start' : '#/inquiry?division=' + d.id}" ${d.id === 'solar' ? 'data-scroll="solar-start"' : ''}>${d.id === 'solar' ? window.TechouseIcons.icon('solar_power') : d.id === 'construction' ? window.TechouseIcons.icon('construction') : ''}${d.id === 'solar' ? 'Let’s find your solar savings' : d.id === 'construction' ? 'Let’s start building' : 'Let’s talk'} ${['solar', 'construction'].includes(d.id) ? '' : arrow}</a></div>${['solar', 'construction'].includes(d.id) ? '' : '<span class="cover-foot">YOUR VISION. OUR NEXT CONVERSATION.</span>'}</section>${d.id === 'solar' ? `<nav class="division-subnav" aria-label="Solar sections"><a href="#products" data-scroll="products">Products</a><a href="#projects" data-scroll="projects">Past projects</a><a href="#estimator" data-scroll="estimator">Cost estimator ↗</a></nav><div class="division-wrap">${solar}</div>` : d.id === 'construction' ? constructionContent() : `<div class="division-wrap"><section class="division-section basic-division"><div><span>01 / ${d.short.toUpperCase()}</span><h2>${d.tagline}</h2><p>${d.description}</p><a class="text-link" href="#/inquiry?division=${d.id}">Start a conversation ${arrow}</a></div><div><span>LET’S START WITH THE ESSENTIALS</span><ul>${d.prompts.map((p, i) => `<li><small>0${i + 1}</small>${p}</li>`).join('')}</ul></div></section></div>`}<section class="division-next"><h2>What else are you building?</h2><div>${divisions
      .filter((x) => x.id !== d.id)
      .map((x) => `<a href="#/divisions/${x.id}">${x.short} ${arrow}</a>`)
      .join(
        '',
      )}</div><a class="back-divisions" href="#/">← Back to the banners</a></section></article>`;
  }
  async function enter(panel) {
    if (entering) return;
    entering = true;
    const id = panel.dataset.banner,
      destination = `#/divisions/${id}`;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      location.hash = destination;
      entering = false;
      return;
    }
    const landing = panel.closest('.division-landing');
    landing.classList.add('banner-departing');
    landing.inert = true;
    const exitAnimations = [
      ...document.querySelectorAll(
        '.division-landing .banner-content,.division-landing .landing-intro,.division-landing .landing-bottom,#header .banner-nav',
      ),
    ].map((element) =>
      element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], {
        duration: 150,
        easing: 'ease-out',
        fill: 'forwards',
      }),
    );
    await Promise.all(exitAnimations.map((animation) => animation.finished));
    const rect = panel.getBoundingClientRect(),
      curtain = document.createElement('div');
    curtain.className = 'division-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    const bg = panel.querySelector('.banner-background').cloneNode(true);
    curtain.append(bg);
    const title = document.createElement('h2');
    title.textContent = panel.querySelector('h2').textContent;
    title.style.opacity = '0';
    curtain.append(title);
    Object.assign(curtain.style, {
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
    });
    document.body.append(curtain);
    try {
      await curtain.animate(
        [
          {
            left: rect.left + 'px',
            top: rect.top + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
          },
          { left: '0px', top: '0px', width: innerWidth + 'px', height: innerHeight + 'px' },
        ],
        { duration: 380, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' },
      ).finished;
      document.body.classList.add('division-arriving');
      location.hash = destination;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const cover = document.querySelector('.division-cover');
      if (!cover) return;
      const target = cover.getBoundingClientRect();
      // The expanded banner settles into the hero instead of leaving the screen.
      // Landing copy has already faded away before the image expands.
      const heroVisual = cover.querySelector(':scope > img, :scope > .icon-scene');
      if (heroVisual) {
        const visual = heroVisual.cloneNode(true);
        visual.classList.add('curtain-hero-visual');
        if (visual.tagName === 'IMG') await visual.decode().catch(() => {});
        // Use one decoded photo during docking, rather than two independently
        // fading crops that can expose a seam as the container resizes.
        const style = getComputedStyle(heroVisual);
        visual.style.objectPosition = style.objectPosition;
        visual.style.filter = style.filter;
        curtain.replaceChildren(visual);
      }
      await curtain.animate(
        [
          { left: '0px', top: '0px', width: innerWidth + 'px', height: innerHeight + 'px' },
          {
            left: target.left + 'px',
            top: target.top + 'px',
            width: target.width + 'px',
            height: target.height + 'px',
          },
        ],
        { duration: 420, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' },
      ).finished;
      document.body.classList.remove('division-arriving');
      await curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' })
        .finished;
    } finally {
      exitAnimations.forEach((animation) => animation.cancel());
      landing.inert = false;
      landing.classList.remove('banner-departing');
      document.body.classList.remove('division-arriving');
      curtain.remove();
      entering = false;
    }
  }
  // ORDER MATTERS: build solar content first, then attach navigation and calculator handlers.
  function mount() {
    window.TechouseSolar?.mount();
    document.querySelectorAll('[data-scroll]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.scroll);
        if (!target) return;
        const details = target.matches('details') ? target : target.closest('details');
        if (details) {
          details.getAnimations().forEach((animation) => animation.cancel());
          details.style.height = '';
          details.style.overflow = '';
          details.open = true;
        }
        requestAnimationFrame(() => {
          const destination =
            target.id === 'solar-technical' ? target.querySelector('#products') : target;
          destination?.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start',
          });
        });
      }),
    );
    const form = document.getElementById('solar-estimator');
    if (!form) return;
    let countFrame;
    const out = document.getElementById('estimate-result');
    const currency = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    });
    const peso = (n) => currency.format(n);
    const calculateButton = document.createElement('button');
    calculateButton.className = 'button calculate-cost';
    calculateButton.type = 'submit';
    calculateButton.textContent = 'Calculate cost →';
    form.querySelector('.estimate-inputs').append(calculateButton);
    function reset() {
      const hadEstimate = !!out.querySelector('.animated-price');
      calculateButton.hidden = false;
      cancelAnimationFrame(countFrame);
      document.getElementById('offset-value').textContent = form.elements.offset.value + '%';
      out.innerHTML =
        '<div class="estimate-ready"><h3>Let’s put a number<br>to your plans.</h3><p>Enter your monthly electricity bill, choose your target, then select <strong>Calculate cost</strong>.</p><small>Sample assumptions · indicative budget only</small></div>';
      if (hadEstimate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        out.getAnimations().forEach((animation) => animation.cancel());
        out.animate(
          [
            { opacity: 0.3, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
        calculateButton.animate(
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 280, easing: 'ease-out' },
        );
      }
    }
    // SAMPLE MODEL: bill/rate -> target monthly energy -> rounded kWp -> indicative budget ±15%.
    // Input changes invalidate results; never treat this browser calculation as a production quote.
    function calculate() {
      cancelAnimationFrame(countFrame);
      if (!form.checkValidity()) {
        form.querySelectorAll('input:invalid,select:invalid').forEach((input) => {
          const details = input.closest('details');
          if (details) details.open = true;
        });
        form.reportValidity();
        return;
      }
      const { kw, generation, low, high, savings, maintenance, netMonthly } =
        window.TechouseSolar.calculateEstimate(Object.fromEntries(new FormData(form)));
      // Simple undiscounted payback: sample capex / monthly benefit after allowance.
      const payback =
        netMonthly > 0
          ? `${(low / netMonthly / 12).toFixed(1)}–${(high / netMonthly / 12).toFixed(1)} years`
          : 'Not reached';
      calculateButton.hidden = true;
      out.innerHTML = `<span>YOUR INDICATIVE PROJECT BUDGET</span><h3 class="animated-price" aria-label="${peso(low)} to ${peso(high)}"><span aria-hidden="true" data-price-low>${peso(low)}</span> <span aria-hidden="true" data-price-high>– ${peso(high)}</span></h3><div class="estimate-metrics"><p><strong>${kw.toFixed(1)} kWp</strong>Illustrative solar capacity</p><p><strong>~${Math.ceil(kw * 6)} m²</strong>Indicative panel area</p><p><strong>~${Math.round(generation)} kWh</strong>Generation / month</p></div><a class="button" href="#/inquiry?division=solar&estimate=1" id="solar-estimate-inquiry">Like this starting point? Let’s talk ↗</a>`;
      window.TechouseSolarExtras?.updateEnergy(form, generation);
      // Keep the decision and next action prominent; system sizing is optional reference.
      if (document.querySelector('.solar-streamlined')) {
        const metrics = out.querySelector('.estimate-metrics');
        const details = document.createElement('details');
        details.className = 'estimate-system-details';
        details.innerHTML = '<summary>View estimated system size</summary>';
        metrics.before(details);
        details.append(metrics);
        out
          .querySelector('h3')
          .after(out.querySelector('#solar-estimate-inquiry'), out.querySelector(':scope > small'));
        const highlight = document.createElement('div');
        highlight.className = 'estimate-budget-highlight';
        out.prepend(highlight);
        highlight.append(
          out.querySelector(':scope > span'),
          out.querySelector('h3'),
          out.querySelector('#solar-estimate-inquiry'),
          out.querySelector(':scope > small'),
        );
        const economics = document.createElement('dl');
        economics.className = 'estimate-economics';
        economics.innerHTML = `<div><dt>Potential monthly bill savings</dt><dd>${peso(savings)}</dd></div><div><dt>Simple payback estimate</dt><dd>${payback}</dd></div><div><dt>Annual maintenance allowance</dt><dd>${peso(maintenance)} / year</dd></div>`;
        highlight.querySelector('h3').after(economics);
        // Fit the final range, not the changing count-up digits, to avoid size jitter.
        const priceHeading = highlight.querySelector('h3');
        const context = document.createElement('canvas').getContext('2d');
        const typography = getComputedStyle(priceHeading);
        context.font = `${typography.fontWeight} 100px ${typography.fontFamily}`;
        const measured = context.measureText(`${peso(low)} – ${peso(high)}`).width;
        priceHeading.style.fontSize = `clamp(16px, ${9600 / measured}cqw, 64px)`;

        const references = document.createElement('div');
        references.className = 'estimate-budget-references';
        [...out.querySelectorAll(':scope > details')].forEach((item) => references.append(item));
        out.append(references);
      }
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        out.animate(
          [
            { opacity: 0.35, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
        out.querySelectorAll('.estimate-metrics p').forEach((metric, i) =>
          metric.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 360, delay: 100 + i * 70, fill: 'backwards', easing: 'ease-out' },
          ),
        );
      }
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const start = performance.now(),
          lower = out.querySelector('[data-price-low]'),
          upper = out.querySelector('[data-price-high]');
        function count(now) {
          if (!lower.isConnected) return;
          const t = Math.min(1, (now - start) / 650),
            ease = 1 - Math.pow(1 - t, 3);
          lower.textContent = peso(low * ease);
          upper.textContent = '– ' + peso(high * ease);
          if (t < 1) countFrame = requestAnimationFrame(count);
        }
        countFrame = requestAnimationFrame(count);
      }
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });
    form.addEventListener('input', reset);
    form.addEventListener('change', reset);
    reset();
    window.TechouseSolar?.connectEstimate(form);
  }

  let snapshotTimeout;
  function clearPreviousPage() {
    clearTimeout(snapshotTimeout);
    document.querySelectorAll('.previous-page-snapshot').forEach((layer) => layer.remove());
    document.body.classList.remove('home-returning');
  }
  // Generate the transition layer's CSS from current styles rather than a separate design.
  // IDs become inert data attributes, keeping live-page queries unique during the overlap.
  function snapshotStyles() {
    const root = '.previous-page-snapshot';
    const scope = (selector) =>
      selector
        .replace(/#([a-zA-Z_][\w-]*)/g, (_, id) => `:is(#${id}, [data-snapshot-id="${id}"])`)
        .replace(/\bbody\b/g, root)
        .replace(
          /\.(landing|division-page|division-content-page|office-page|inquiry-page|home-returning|has-saved-inquiry|inquiry-overview|inquiry-details|inquiry-new-request|inquiry-inline-details)\b/g,
          (_, name) => `${root}.${name}`,
        )
        .replaceAll(root + root, root);
    const selectors = (text) => {
      const result = [];
      let start = 0,
        depth = 0,
        quote = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quote) {
          if (char === quote && text[i - 1] !== '\\') quote = '';
          continue;
        }
        if (char === '\"' || char === "'") quote = char;
        else if (char === '(' || char === '[') depth++;
        else if (char === ')' || char === ']') depth--;
        else if (char === ',' && depth === 0) {
          result.push(text.slice(start, i));
          start = i + 1;
        }
      }
      result.push(text.slice(start));
      return result;
    };
    const rules = (list) =>
      [...list]
        .map((rule) => {
          if (rule.selectorText) {
            const scoped = selectors(rule.selectorText)
              .flatMap((text) => {
                const selector = scope(text.trim());
                return [`${root}:is(${selector})`, `:where(${root}) :is(${selector})`];
              })
              .join(',');
            return `${scoped} { ${rule.style.cssText} }`;
          }
          if (rule.cssRules && rule.conditionText) {
            const prefix = rule.cssText.slice(0, rule.cssText.indexOf('{'));
            return `${prefix}{${rules(rule.cssRules)}}`;
          }
          return '';
        })
        .join('\n');
    return [...document.styleSheets]
      .map((sheet) => {
        try {
          return rules(sheet.cssRules);
        } catch {
          return '';
        }
      })
      .join('\n');
  }
  // VISUAL SNAPSHOT ONLY: preserves the outgoing viewport during the return-to-home animation.
  function preservePreviousPage() {
    if (document.querySelector('.previous-page-snapshot')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const previousBackground = getComputedStyle(document.body).backgroundColor;
    const currentStyles = snapshotStyles();
    const snapshot = document.createElement('div');
    snapshot.className = 'previous-page-snapshot ' + document.body.className;
    // Preserve the outgoing page's actual canvas, including its light empty space.
    snapshot.style.backgroundColor = previousBackground;
    snapshot.setAttribute('aria-hidden', 'true');
    snapshot.inert = true;
    const style = document.createElement('style');
    style.textContent = currentStyles;
    snapshot.append(style);
    const content = document.createElement('div');
    content.className = 'previous-page-content';
    for (const source of [document.querySelector('#main'), document.querySelector('#footer')]) {
      if (!source) continue;
      const rect = source.getBoundingClientRect();
      const clone = source.cloneNode(true);
      Object.assign(clone.style, {
        position: 'absolute',
        top: rect.top + 'px',
        left: rect.left + 'px',
        width: rect.width + 'px',
        margin: '0',
      });
      for (const element of [clone, ...clone.querySelectorAll('[id]')]) {
        if (element.id) element.dataset.snapshotId = element.id;
        element.removeAttribute('id');
      }
      content.append(clone);
    }
    snapshot.append(content);
    document.body.append(snapshot);
    document.body.classList.add('home-returning');
    snapshotTimeout = setTimeout(clearPreviousPage, 1800);
    const shade = document.createElement('div');
    shade.className = 'return-backdrop-shade';
    snapshot.append(shade);
    // First soften the outgoing page; then dim the entire frame, including whitespace.
    shade.animate([{ opacity: 0 }, { opacity: 1 }], {
      delay: 260,
      duration: 820,
      easing: 'ease-in-out',
      fill: 'forwards',
    });
  }
  // Freeze the outgoing viewport before fragment navigation can reset its scroll position.
  document.addEventListener(
    'click',
    (event) => {
      const home = event.target.closest('a[href="#/"]');
      if (
        !home ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        location.hash === '#/' ||
        !location.hash
      )
        return;
      preservePreviousPage();
    },
    { capture: true },
  );
  const topButton = document.createElement('button');
  topButton.className = 'back-to-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '<span aria-hidden="true">↑</span><span>Back to top</span>';
  topButton.tabIndex = -1;
  topButton.setAttribute('aria-hidden', 'true');
  document.body.append(topButton);
  function updateTopButton() {
    const visible = scrollY >= 500;
    topButton.classList.toggle('is-visible', visible);
    topButton.tabIndex = visible ? 0 : -1;
    topButton.setAttribute('aria-hidden', String(!visible));
  }
  window.addEventListener('scroll', updateTopButton, { passive: true });
  window.addEventListener('hashchange', () => requestAnimationFrame(updateTopButton));
  topButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    document.querySelector('#main')?.focus({ preventScroll: true });
  });
  let actionTransition = false;
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('a.button,a.banner-global-quote,a.mobile-inquiry');
    if (
      !button ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const destination = button.getAttribute('href');
    if (
      !destination?.startsWith('#/') ||
      destination === location.hash ||
      button.target === '_blank'
    )
      return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    if (actionTransition) return;
    actionTransition = true;
    const layer = document.createElement('div');
    layer.className = 'action-crossfade';
    layer.setAttribute('aria-hidden', 'true');
    const darkSource = document.body.matches('.landing,.division-page');
    const sourceColor = darkSource ? '#182522' : getComputedStyle(document.body).backgroundColor;
    const targetColor = destination.startsWith('#/divisions/') ? '#f3f0e8' : '#f7f7f2';
    layer.style.backgroundColor = sourceColor;
    document.body.append(layer);
    const outgoing = document.querySelector('#main').animate(
      [
        { opacity: 1, transform: 'translateY(0)', filter: 'none' },
        { opacity: 0.45, transform: 'translateY(-12px)', filter: 'none' },
      ],
      { duration: 300, easing: 'ease-in', fill: 'forwards' },
    );
    let reveal;
    try {
      await layer.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 330,
        easing: 'ease-in-out',
        fill: 'forwards',
      }).finished;
      location.hash = destination;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      outgoing.cancel();
      await layer.animate([{ backgroundColor: sourceColor }, { backgroundColor: targetColor }], {
        duration: 380,
        easing: 'ease-in-out',
        fill: 'forwards',
      }).finished;
      reveal = document.querySelector('#main').animate(
        [
          { opacity: 0.5, transform: 'translateY(14px)', filter: 'none' },
          { opacity: 1, transform: 'translateY(0)', filter: 'none' },
        ],
        { duration: 500, easing: 'cubic-bezier(.22,.7,.2,1)' },
      );
      await layer.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 420,
        easing: 'ease-out',
        fill: 'forwards',
      }).finished;
      await reveal.finished;
    } finally {
      outgoing.cancel();
      reveal?.cancel();
      layer.remove();
      actionTransition = false;
    }
  });
  document.addEventListener('click', async (event) => {
    const link = event.target.closest(
      '#site-nav a:not(.button):not(.mobile-inquiry),.admin-tabs a,.banner-office,.office-link,.product-grid a,.division-next>div>a',
    );
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
    const destination = link.getAttribute('href');
    if (
      !destination?.startsWith('#/') ||
      destination === location.hash ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    event.preventDefault();
    if (actionTransition) return;
    actionTransition = true;
    let outgoing;
    try {
      outgoing = document.querySelector('#main').animate(
        [
          { filter: 'none', opacity: 1 },
          { filter: 'none', opacity: 0.45 },
        ],
        { duration: 80, easing: 'ease-in', fill: 'forwards' },
      );
      await outgoing.finished;
      location.hash = destination;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      outgoing.cancel();
      await document.querySelector('#main').animate(
        [
          { filter: 'none', opacity: 0.45 },
          { filter: 'none', opacity: 1 },
        ],
        { duration: 140, easing: 'ease-out' },
      ).finished;
    } finally {
      outgoing?.cancel();
      actionTransition = false;
    }
  });
  document.addEventListener('click', async (event) => {
    const card = event.target.closest(
      'a.post-card,a.division-card,a.additional-division,#footer .footer-col:nth-child(2) a[href^="#/"]',
    );
    if (
      !card ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const destination = card.getAttribute('href');
    if (
      !destination?.startsWith('#/') ||
      destination === location.hash ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    event.preventDefault();
    if (actionTransition) return;
    actionTransition = true;
    let exit, entrance;
    try {
      exit = card.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.035)', opacity: 0 },
        ],
        { duration: 220, easing: 'ease-in', fill: 'forwards' },
      );
      await exit.finished;
      location.hash = destination;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      entrance = (
        document.querySelector('.article,.division-experience') || document.querySelector('#main')
      )?.animate(
        [
          { transform: 'scale(.97)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 430, easing: 'cubic-bezier(.22,.7,.2,1)' },
      );
      if (entrance) await entrance.finished;
    } finally {
      exit?.cancel();
      entrance?.cancel();
      actionTransition = false;
    }
  });
  return { page, enter, mount, preservePreviousPage, clearPreviousPage };
})();
