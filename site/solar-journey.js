/**
 * Solar content and customer selection state.
 * mount() builds the guided sections; connectEstimate() captures a reviewed estimate; prefill() fills the inquiry.
 */
/* Customer-first solar draft. Selection state stays in memory; no personal data is collected here. */
window.TechouseSolar = (() => {
  // In-memory selections survive client-side routes, but reset on a full refresh. No personal details are persisted here.
  let choices = {
    sector: 'Residential',
    location: '',
  };
  let estimate = null;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });
  const money = (n) => currency.format(n);

  // USAGE -> NIGHT SHARE: three plain-language choices stand in for a day/night percentage.
  const USAGE = { 'Mostly daytime': 25, 'Day and night': 50, 'Mostly at night': 75 };
  // Suggested answer per property: homes use most power in the evening, businesses in the day.
  // It is marked on the tile, never pre-selected, so the visitor still answers it themselves.
  const usageSuggestion = (sector) =>
    sector === 'Residential'
      ? ['Day and night', 'Suggested for homes']
      : ['Mostly daytime', 'Suggested for businesses'];
  const PROPERTY_ICONS = { Residential: 'home', Commercial: 'storefront', Industrial: 'factory' };
  // COVERAGE -> OFFSET: the estimator's three coverage choices, as words for the inquiry.
  const COVERAGE = { 50: 'Just the essentials', 80: 'Essentials and more', 95: 'Most of my bill' };
  // RECOMMENDED SETUP follows when electricity is used: mostly daytime needs no battery, a day and
  // night split stores part of the evening use, and mostly-at-night stores all of it.
  function recommendedScenario(segment, nightShare = 0) {
    if (segment === 'commercial') return nightShare >= 40 ? 'storage' : 'day';
    if (nightShare >= 70) return 'full';
    return nightShare >= 40 ? 'partial' : 'day';
  }
  // Use one planning model (solar-calculator.js) for the displayed budget and the inquiry handoff.
  function calculateEstimate(values) {
    const result = window.TechouseSolarCalculator.calculate(values);
    const chosen =
      result.scenarios.find((s) => s.id === values.scenario) ||
      result.scenarios.find(
        (s) => s.id === recommendedScenario(result.segment, result.nightShare),
      ) ||
      result.scenarios[0];
    return { ...result, chosen };
  }
  const options = (name, values) =>
    `<div class="solar-choices">${values.map((v) => `<label><input type="radio" name="${name}" value="${v}" ${choices[name] === v ? 'checked' : ''}><span>${PROPERTY_ICONS[v] ? window.TechouseIcons.icon(PROPERTY_ICONS[v], 'solar-choice-icon') : ''}${v}</span></label>`).join('')}</div>`;
  // CONTENT EDITING: section titles, questions, and educational explanations live in this template builder.
  function mount() {
    const host = document.querySelector('.division-page #solar-estimator');
    if (!host) return;
    const wrap = host.closest('.division-wrap');
    const intro = document.createElement('section');
    intro.id = 'solar-start';
    intro.className = 'division-section solar-start';
    intro.innerHTML = `<div class="section-heading"><h2>Your first step to<br>lower electricity bills.</h2><p>Tell us where it’s going and your monthly bill. We’ll handle the sizing and pricing.</p></div><form id="solar-discovery"><fieldset><legend>What type of property is this for?</legend>${options('sector', ['Residential', 'Commercial', 'Industrial'])}</fieldset><label class="solar-location">Where is your property? <small>Optional · city or province</small><input name="location" maxlength="120" placeholder="e.g. Quezon City" value="${escape(choices.location)}"></label><a class="button" href="#estimator" data-solar-next>Next: estimate my solar cost →</a></form>`;
    wrap.prepend(intro);
    const learn = document.createElement('section');
    learn.id = 'solar-options';
    learn.className = 'division-section solar-learning';
    learn.innerHTML = `<div class="section-heading"><h2>Your energy habits.<br>Your solar options.</h2><p>A useful starting point is understanding when you need power and what you want it to do.</p></div><div class="solar-story-grid"><article><h3>Working while the sun does.</h3><p>A grid-tied system can supply daytime loads while remaining connected to the grid. Standard grid-tied systems shut down during outages.</p></article><article><h3>Keep some sunshine for later.</h3><p>A compatible battery system can store energy for later use. Usable capacity, supported loads, and backup operation need a tailored design.</p></article><article><h3>Small shadows. Useful questions.</h3><p>Shade can affect output. Panel layout, electrical design, and the specific module all matter.</p><details class="panel-choice-guide"><summary><span>How do we choose panels for your home?</span>${window.TechouseIcons.icon('expand_more')}</summary><div class="panel-choice-content"><dl><div><dt>Your roof space</dt><dd>We check how many panels can fit, with room for safe access.</dd></div><div><dt>Sun and shade</dt><dd>Trees and nearby buildings can block sunlight. We look for the best places to put your panels.</dd></div><div><dt>Your daily needs</dt><dd>We compare your electricity use with what the panels could produce, then recommend a suitable setup.</dd></div></dl><p class="panel-choice-takeaway">We’ll walk through the options with you and help you choose a setup that fits your property and goals.</p><a class="text-link" href="#/divisions/solar/products/panels">Explore panel options ${window.TechouseIcons.icon('arrow_outward')}</a></div></details></article></div></section>`;
    const estimator = host.closest('section');
    intro.after(estimator);
    wrap.closest('.division-experience').classList.add('solar-streamlined');
    estimator.querySelector('.section-heading h2').textContent =
      'Next, let’s see what your solar project could cost.';
    estimator.querySelector('.section-heading > span')?.remove();
    estimator.querySelector('.section-heading p').textContent =
      'Enter your monthly bill, then answer two quick questions. We’ll handle the sizing and pricing.';
    // Staff set the monthly Meralco rate in the back office (Website customizer → Solar calculator).
    // Visitors see it as a quiet summary and only open "Fine-tune" if their rate differs.
    const settings = window.TechouseContent?.snapshot().settings || {};
    if (Number.isFinite(settings.electricityRate) && settings.electricityRate > 0) {
      host.elements.rate.value = String(settings.electricityRate);
      host.elements.rate.defaultValue = String(settings.electricityRate);
    }
    if (settings.electricityRateNote)
      host.querySelector('[data-rate-note]').textContent =
        `${settings.electricityRateNote}. Edit to match your bill.`;
    const rateSummary = host.querySelector('[data-rate-summary]');
    const showRate = () => {
      const rate = Number(host.elements.rate.value);
      rateSummary.textContent = rate > 0 ? `₱${+rate.toFixed(2)}/kWh` : 'your rate';
    };
    host.elements.rate.addEventListener('input', showRate);
    showRate();
    const products = wrap.querySelector('#products');
    products.querySelector('.section-heading h2').innerHTML =
      'Meet the technology<br>behind your next step.';
    products.querySelector('.product-grid').outerHTML = window.TechouseCatalogue.showcase();
    products.querySelectorAll(':scope > .catalogue-note').forEach((note, index) => {
      if (index > 0) note.remove();
    });
    wrap.querySelector('#projects .section-heading > span')?.remove();
    const partner = wrap.querySelector('.partner-band');
    if (partner) {
      partner.querySelector('span').textContent = 'TECHOUSE × SKYWORTH';
      partner.querySelector('p').textContent =
        'Techouse is a direct Skyworth partner. Talk to our team about panels, inverters and battery storage for your property.';
    }
    const nav = document.querySelector('.division-subnav');
    nav.innerHTML =
      '<a href="#solar-start" data-scroll="solar-start">Savings calculator</a><a href="#projects" data-scroll="projects">Project examples</a><a href="#solar-technical" data-scroll="solar-technical">Technical reference</a>';
    const learningDetails = document.createElement('details');
    learningDetails.className = 'solar-optional-guide';
    learningDetails.innerHTML = `<summary><span class="guide-icon">${window.TechouseIcons.icon('routine')}</span><span class="guide-text"><span>Want to understand your solar options?</span><small>Daytime use, batteries and roof shade</small></span>${window.TechouseIcons.icon('expand_more', 'guide-chevron')}</summary>`;
    learn.querySelector('.section-heading > span')?.remove();
    learn.querySelector('.section-heading h2').textContent = 'How solar fits everyday life';
    learn.querySelector('.section-heading p').textContent =
      'Explore these points whenever you want more detail.';
    learningDetails.append(learn);
    wrap.querySelector('#projects').after(learningDetails);
    const technical = document.createElement('details');
    technical.className = 'solar-optional-guide solar-technical-guide';
    technical.id = 'solar-technical';
    technical.innerHTML = `<summary><span class="guide-icon">${window.TechouseIcons.icon('solar_power')}</span><span class="guide-text"><span>For engineers and those who want the specifications</span><small>Panels, inverters, batteries and datasheets</small></span>${window.TechouseIcons.icon('expand_more', 'guide-chevron')}</summary>`;
    learningDetails.after(technical);
    technical.append(products);
    // Panel technology and equipment ranges, from the company presentation.
    const panelTech = document.createElement('section');
    panelTech.className = 'division-section solar-panel-tech';
    panelTech.innerHTML = `<div class="section-heading"><h2>Two panel<br>technologies.</h2><p>Both from Skyworth. The difference shows when part of a panel is shaded or damaged.</p></div><div class="construction-project-types two-up"><article class="construction-type"><div class="construction-type-top">${window.TechouseIcons.icon('solar_power')}<span>BC · back contact</span></div><h3>Up to 660 W</h3><p>Cells are connected in parallel, so a fallen leaf, a crack or a shaded cell affects only that cell. The rest of the panel keeps producing.</p></article><article class="construction-type"><div class="construction-type-top">${window.TechouseIcons.icon('solar_power')}<span>TOPCon</span></div><h3>Up to 620 W</h3><p>High-efficiency cells connected in series strings. If one string is shaded or damaged, the panel loses about a sixth of its output while the other strings keep working.</p></article></div><dl class="division-specs"><div><dt>Single-phase inverters</dt><dd>Hybrid, up to 12 kW</dd></div><div><dt>Three-phase inverters</dt><dd>Low and high voltage, up to 125 kW</dd></div><div><dt>220 V three-phase</dt><dd>75 kW model</dd></div><div><dt>Battery packs</dt><dd>5–16 kWh low voltage; larger cabinets to order</dd></div><div><dt>Monitoring</dt><dd>Owner app, plus remote monitoring by our team</dd></div><div><dt>Panel weight</dt><dd>About 35 kg each, before rails and cabling</dd></div></dl><p class="division-note">Most three-phase supply in the Philippines is still 220 V, while most equipment is now made for 380 V and above, which is why 220 V three-phase models are limited. Custom-coloured panels, for example to match terracotta roofs, are available by container order.</p>`;
    technical.append(panelTech);
    if (partner) {
      partner.innerHTML = `<div class="partner-identity"><span>TECHOUSE × SKYWORTH</span><strong>Skyworth</strong><small>Direct solar partner</small></div><div class="partner-message"><h3>Your direct connection<br>to Skyworth solar.</h3><p>Explore panels, inverters and battery storage with your direct Skyworth partner.</p><a class="text-link" href="#/inquiry?division=solar">Talk to our solar team ${window.TechouseIcons.icon('arrow_outward')}</a></div>`;
      technical.append(partner);
    }
    products.querySelector('.section-heading > span')?.remove();
    products.querySelector('.section-heading h2').textContent = 'Equipment and specifications';
    products.querySelector('.section-heading p').textContent =
      'Explore product ranges and manufacturer datasheets.';
    const discovery = intro.querySelector('form');
    // Step 1 answers feed the estimator: the property type decides the pricing model and which
    // usage answer is marked as suggested.
    const suggest = () => {
      const [value, text] = usageSuggestion(choices.sector);
      host.querySelectorAll('[name="nightShare"]').forEach((radio) => {
        const tag = radio.closest('label').querySelector('.solar-suggest');
        tag.hidden = USAGE[value] !== +radio.value;
        tag.textContent = text;
      });
    };
    function update() {
      choices = Object.fromEntries(new FormData(discovery));
      host.elements.sector.value = choices.sector;
      suggest();
      host.dispatchEvent(new Event('change'));
    }
    discovery.addEventListener('change', update);
    discovery.addEventListener('input', () => {
      choices = Object.fromEntries(new FormData(discovery));
    });
    discovery.addEventListener('submit', (e) => e.preventDefault());
    intro.querySelector('[data-solar-next]').addEventListener('click', (e) => {
      e.preventDefault();
      estimator.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    update();
  }
  // Carry only the current valid estimate into the inquiry after the visitor chooses to proceed.
  function connectEstimate(form) {
    form.addEventListener('click', (e) => {
      if (!e.target.closest('#solar-estimate-inquiry')) return;
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }
      const f = Object.fromEntries(new FormData(form));
      const { chosen } = calculateEstimate(f);
      if (!chosen) return;
      estimate = {
        ...choices,
        ...f,
        kw: chosen.kwp,
        setup: chosen.title,
        equipment: chosen.lines.map((l) => `${l.qty} × ${l.label}`).join('\n- '),
        savings: Math.round(chosen.savings),
        budget: `${money(Math.floor(chosen.priceLow / 1000) * 1000)}–${money(Math.ceil(chosen.priceHigh / 1000) * 1000)}`,
      };
    });
  }
  // The visitor can review/edit every copied value before saving the browser-only demo inquiry.
  function prefill() {
    const form = document.querySelector('#inquiry-form');
    if (!form || !location.hash.includes('estimate=1') || !estimate) return;
    const e = estimate;
    // Carry a numeric estimate separately from editable prose; never parse customer text for money.
    const savings = e.savings;
    form.dataset.solarSector = e.sector.toLowerCase();
    if (Number.isFinite(savings) && savings > 0) form.dataset.solarSavings = String(savings);
    form.elements.division.value = 'solar';
    form.elements.location.value = e.location;
    form.elements.capacity.value = `${e.kw.toFixed(2)} kWp · illustrative`;
    const d = window.TechouseSolarCalculator.DEFAULTS;
    form.elements.requirements.value = `I would like to discuss this solar planning illustration.\n\nProperty: ${e.sector}\nElectricity use: ${Object.keys(USAGE).find((k) => USAGE[k] === +e.nightShare) || e.nightShare + '% at night'}\nMonthly bill: ${money(+e.bill)}\nElectricity rate: ₱${e.rate}/kWh\nSolar should cover: ${COVERAGE[e.offset] || e.offset + '%'} (${e.offset}% target, not guaranteed savings)\nSetup: ${e.setup}\nEquipment:\n- ${e.equipment}\nIllustrative budget: ${e.budget}\n\nCalculator assumptions: ${d.psh} peak sun hours/day, ${d.heatLoss * 100}% system losses, 30 days/month, Techouse equipment pricing. No export credits assumed. Actual usage, shading, roof suitability, permits, upgrades, and battery sizing require assessment.\n\nPlease help me review what is suitable for my property.`;
    const note = document.createElement('div');
    note.className = 'solar-prefill-note';
    note.textContent =
      'Your starting point is here. We carried over your choices and estimate. Review or edit them, then add your contact details. Demo only: saving this form does not send an email.';
    form.prepend(note);
    document.querySelector('.page-hero h1').innerHTML =
      'Like the possibilities?<br>Let’s take a closer look.';
  }
  return { mount, connectEstimate, prefill, calculateEstimate, recommendedScenario };
})();
