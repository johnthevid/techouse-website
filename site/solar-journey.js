/**
 * Solar content and customer selection state.
 * mount() builds the guided sections; connectEstimate() captures a reviewed estimate; prefill() fills the inquiry.
 */
/* Customer-first solar draft. Selection state stays in memory; no personal data is collected here. */
window.TechouseSolar = (() => {
  // In-memory selections survive client-side routes, but reset on a full refresh. No personal details are persisted here.
  let choices = {
    sector: 'Residential',
    goal: 'Lower electricity costs',
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

  // Use one planning model for the displayed budget and the inquiry handoff.
  function calculateEstimate(values) {
    const bill = Number(values.bill);
    const rate = Number(values.rate);
    const offset = Number(values.offset);
    const kw = Math.ceil((((bill / rate) * offset) / 100 / (4 * 0.8 * 30)) * 2) / 2;
    const generation = kw * 4 * 0.8 * 30;
    const base =
      kw * Number(values.price) + (values.system === 'hybrid' ? Number(values.battery) : 0);
    const savings = Math.min((bill * offset) / 100, generation * rate);
    const maintenance = (base * Number(values.maintenance ?? 1)) / 100;
    return {
      kw,
      generation,
      base,
      low: base * 0.85,
      high: base * 1.15,
      savings,
      maintenance,
      netMonthly: savings - maintenance / 12,
    };
  }
  const options = (name, values) =>
    `<div class="solar-choices">${values.map((v) => `<label><input type="radio" name="${name}" value="${v}" ${choices[name] === v ? 'checked' : ''}><span>${{ 'Lower electricity costs': 'Lower my electricity bill', 'Energy after sunset': 'Use solar energy after sunset', 'Backup for essentials': 'Back up essential appliances' }[v] || v}</span></label>`).join('')}</div>`;
  // CONTENT EDITING: section titles, questions, and educational explanations live in this template builder.
  function mount() {
    const host = document.querySelector('.division-page #solar-estimator');
    if (!host) return;
    const wrap = host.closest('.division-wrap');
    const intro = document.createElement('section');
    intro.id = 'solar-start';
    intro.className = 'division-section solar-start';
    intro.innerHTML = `<div class="section-heading"><span>01 / YOUR PROPERTY</span><h2>Your first step to<br>lower electricity bills.</h2><p>Tell us about your property and what matters most to you. Then explore your estimated solar cost.</p></div><form id="solar-discovery"><fieldset><legend>What type of property is this for?</legend>${options('sector', ['Residential', 'Commercial', 'Industrial'])}</fieldset><fieldset><legend>What would you like solar to help with?</legend>${options('goal', ['Lower electricity costs', 'Energy after sunset', 'Backup for essentials'])}</fieldset><label class="solar-location">Where is your property? <small>Optional · city or province</small><input name="location" maxlength="120" placeholder="e.g. Quezon City" value="${escape(choices.location)}"></label><p id="solar-guidance" aria-live="polite"></p><a class="button" href="#estimator" data-solar-next>Next: estimate my solar cost →</a></form>`;
    wrap.prepend(intro);
    const learn = document.createElement('section');
    learn.id = 'solar-options';
    learn.className = 'division-section solar-learning';
    learn.innerHTML = `<div class="section-heading"><span>02 / MAKE IT MAKE SENSE</span><h2>Your energy habits.<br>Your solar options.</h2><p>A useful starting point is understanding when you need power and what you want it to do.</p></div><div class="solar-story-grid"><article><span>USE THE DAY</span><h3>Working while the sun does.</h3><p>A grid-tied system can supply daytime loads while remaining connected to the grid. Standard grid-tied systems shut down during outages.</p></article><article><span>THINK BEYOND SUNSET</span><h3>Keep some sunshine for later.</h3><p>A compatible battery system can store energy for later use. Usable capacity, supported loads, and backup operation need a tailored design.</p></article><article><span>LOOK AT YOUR ROOF</span><h3>Small shadows. Useful questions.</h3><p>Shade can affect output. Panel layout, electrical design, and the specific module all matter.</p><details class="panel-choice-guide"><summary><span>How do we choose panels for your home?</span>${window.TechouseIcons.icon('expand_more')}</summary><div class="panel-choice-content"><dl><div><dt>Your roof space</dt><dd>We check how many panels can fit, with room for safe access.</dd></div><div><dt>Sun and shade</dt><dd>Trees and nearby buildings can block sunlight. We look for the best places to put your panels.</dd></div><div><dt>Your daily needs</dt><dd>We compare your electricity use with what the panels could produce, then recommend a suitable setup.</dd></div></dl><p class="panel-choice-takeaway">We’ll walk through the options with you and help you choose a setup that fits your property and goals.</p><a class="text-link" href="#/divisions/solar/products/panels">Explore panel options ${window.TechouseIcons.icon('arrow_outward')}</a></div></details></article></div></section>`;
    const estimator = host.closest('section');
    intro.after(estimator);
    wrap.closest('.division-experience').classList.add('solar-streamlined');
    estimator.querySelector('.section-heading h2').textContent =
      'Next, let’s see what your solar project could cost.';
    estimator.querySelector('.section-heading span').textContent = '02 / YOUR STARTING BUDGET';
    estimator.querySelector('.section-heading p').textContent =
      'Enter your monthly bill to explore an indicative budget. You can adjust the estimate details if needed.';
    host.elements.system.options[0].textContent = 'Daytime solar · grid-tied';
    host.elements.system.options[1].textContent = 'Solar + storage · sample 5 kWh battery';
    const billLabel = host.elements.bill.closest('label');
    billLabel.classList.add('solar-bill-control');
    billLabel.firstChild.textContent = '01 / Your monthly electricity bill (₱)';
    const offsetLabel = host.elements.offset.closest('label');
    offsetLabel.firstChild.textContent = '02 / How much would you like solar to cover? ';
    const targetNote = document.createElement('small');
    targetNote.className = 'solar-target-note';
    targetNote.textContent = 'A target, not guaranteed bill savings.';
    offsetLabel.classList.add('solar-offset-control');
    const endpoints = document.createElement('div');
    endpoints.className = 'solar-offset-endpoints';
    endpoints.setAttribute('aria-hidden', 'true');
    endpoints.innerHTML = '<span>20% coverage</span><span>100% coverage</span>';
    offsetLabel.insertBefore(endpoints, targetNote.parentElement ? targetNote : null);
    offsetLabel.append(targetNote);
    const tier = document.createElement('div');
    tier.className = 'solar-coverage-tier';
    tier.innerHTML = `<svg class="coverage-sun" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="13" fill="#e8bd65" stroke="#8d6329" stroke-width="2"/>${Array.from({ length: 8 }, (_, i) => `<path class="coverage-ray" d="M32 5v8" transform="rotate(${i * 45} 32 32)" fill="none" stroke="#b98029" stroke-width="3" stroke-linecap="round"/>`).join('')}</svg><div class="coverage-tier-copy"><strong></strong><span></span></div>`;
    offsetLabel.insertBefore(tier, targetNote);
    const tiers = [
      [35, 'A sunny start', 'A little sunshine. A step toward lower bills.'],
      [55, 'Sharing the load', 'Let solar take on more of your everyday energy use.'],
      [75, 'Sun-powered ambitions', 'You’re aiming to put most of your energy use on sunshine.'],
      [95, 'Going big on solar', 'You’re making sunshine a major part of the plan.'],
      [100, 'All-in on sunshine', 'An ambitious target. Let’s see what your property can support.'],
    ];
    let previousTier = '';
    const updateTrack = () => {
      const value = Number(host.elements.offset.value);
      offsetLabel.style.setProperty('--coverage', ((value - 20) / 80) * 100 + '%');
      const [, title, message] = tiers.find(([maximum]) => value <= maximum) || tiers[4];
      const level = tiers.findIndex((item) => item[1] === title);
      tier
        .querySelectorAll('.coverage-ray')
        .forEach((ray, index) => ray.classList.toggle('is-lit', index < (level + 1) * 2));
      if (title !== previousTier) {
        tier.querySelector('strong').textContent = title;
        tier.querySelector('span').textContent = message;
        if (previousTier && !matchMedia('(prefers-reduced-motion: reduce)').matches)
          tier.animate(
            [
              { opacity: 0.4, transform: 'translateY(4px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 180, easing: 'ease-out' },
          );
        previousTier = title;
      }
      host.elements.offset.setAttribute('aria-valuetext', value + '% target · ' + title);
    };
    host.elements.offset.addEventListener('input', updateTrack);
    updateTrack();
    const advanced = host.querySelector('.estimate-inputs details');
    const maintenance = document.createElement('label');
    maintenance.innerHTML =
      'Annual maintenance allowance (% of sample base cost)<input name="maintenance" type="number" min="0" max="20" step="0.1" value="1" required><small>Sample planning allowance only; not a Techouse service price. Excludes equipment replacement.</small>';
    advanced.append(maintenance);
    advanced.querySelector('summary').textContent = 'Adjust estimate details (optional)';
    for (const name of ['rate', 'system'])
      advanced.insertBefore(host.elements[name].closest('label'), advanced.querySelector('label'));
    host.elements.system.options[0].textContent = 'Daytime solar';
    host.elements.system.options[1].textContent = 'Solar with a battery · sample allowance';
    const products = wrap.querySelector('#products');
    products.querySelector('.section-heading h2').innerHTML =
      'Meet the technology<br>behind your next step.';
    products.querySelector('.section-heading span').textContent = '04 / LOOK A LITTLE CLOSER';
    products.querySelector('.product-grid').outerHTML = window.TechouseCatalogue.showcase();
    products.querySelectorAll(':scope > .catalogue-note').forEach((note, index) => {
      if (index > 0) note.remove();
    });
    wrap.querySelector('#projects .section-heading span').textContent = '03 / PROJECT EXAMPLES';
    const partner = wrap.querySelector('.partner-band');
    if (partner) {
      partner.querySelector('span').textContent = 'TECHOUSE × SKYWORTH';
      partner.querySelector('p').textContent =
        'Techouse is a direct Skyworth partner. Talk to our team about panels, inverters and battery storage for your property.';
    }
    const nav = document.querySelector('.division-subnav');
    nav.innerHTML =
      '<a href="#solar-start" data-scroll="solar-start">1 · Your property</a><a href="#estimator" data-scroll="estimator">2 · Your estimate</a><a href="#projects" data-scroll="projects">Project examples</a><a href="#solar-technical" data-scroll="solar-technical">Technical reference</a>';
    const learningDetails = document.createElement('details');
    learningDetails.className = 'solar-optional-guide';
    learningDetails.innerHTML =
      '<summary><span>Want to understand your solar options?</span><small>Optional · daytime use, batteries and roof shade</small></summary>';
    learn.querySelector('.section-heading span').textContent = 'A LITTLE MORE CONTEXT';
    learn.querySelector('.section-heading h2').textContent = 'How solar fits everyday life';
    learn.querySelector('.section-heading p').textContent =
      'Explore these points whenever you want more detail.';
    learningDetails.append(learn);
    wrap.querySelector('#projects').after(learningDetails);
    const technical = document.createElement('details');
    technical.className = 'solar-optional-guide solar-technical-guide';
    technical.id = 'solar-technical';
    technical.innerHTML =
      '<summary><span>For engineers and those who want the specifications</span><small>Optional · panels, inverters, batteries and datasheets</small></summary>';
    learningDetails.after(technical);
    technical.append(products);
    if (partner) {
      partner.innerHTML = `<div class="partner-identity"><span>TECHOUSE × SKYWORTH</span><strong>SKYWORTH</strong><small>Direct solar partner</small></div><div class="partner-message"><h3>Your direct connection<br>to Skyworth solar.</h3><p>Explore panels, inverters and battery storage with your direct Skyworth partner.</p><a class="text-link" href="#/inquiry?division=solar">Talk to our solar team ${window.TechouseIcons.icon('arrow_outward')}</a></div>`;
      technical.append(partner);
    }
    products.querySelector('.section-heading span').textContent = 'TECHNICAL REFERENCE';
    products.querySelector('.section-heading h2').textContent = 'Equipment and specifications';
    products.querySelector('.section-heading p').textContent =
      'Explore product ranges and manufacturer datasheets.';
    const discovery = intro.querySelector('form');
    function update() {
      choices = Object.fromEntries(new FormData(discovery));
      const system = host.elements.system;
      system.value = choices.goal === 'Lower electricity costs' ? 'grid' : 'hybrid';
      intro.querySelector('#solar-guidance').textContent =
        choices.goal === 'Lower electricity costs'
          ? 'We’ll start with a daytime solar illustration.'
          : 'We’ll include a sample battery allowance. Backup capacity needs a site assessment.';
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
      const result = calculateEstimate(f);
      estimate = {
        ...choices,
        ...f,
        kw: result.kw,
        savings: result.savings,
        budget: `${money(result.low)}–${money(result.high)}`,
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
    form.elements.capacity.value = `${e.kw.toFixed(1)} kWp · illustrative`;
    form.elements.requirements.value = `I would like to discuss this solar planning illustration.\n\nProperty: ${e.sector}\nPriority: ${e.goal}\nMonthly bill: ${money(+e.bill)}\nElectricity rate: ₱${e.rate}/kWh\nDesired energy offset: ${e.offset}% (goal, not guaranteed savings)\nSystem: ${e.system === 'hybrid' ? 'Hybrid + sample 5 kWh battery' : 'Grid-tied'}\nIllustrative budget: ${e.budget}\n\nSample assumptions: 4 peak sun hours/day, 80% efficiency, 30 days/month, ₱${e.price}/kWp, battery allowance ₱${e.battery} if hybrid, budget ±15%. No export credits assumed. Actual usage, shading, roof suitability, permits, upgrades, and battery sizing require assessment.\n\nPlease help me review what is suitable for my property.`;
    const note = document.createElement('div');
    note.className = 'solar-prefill-note';
    note.textContent =
      'Your starting point is here. We carried over your choices and estimate. Review or edit them, then add your contact details. Demo only: saving this form does not send an email.';
    form.prepend(note);
    document.querySelector('.page-hero h1').innerHTML =
      'Like the possibilities?<br>Let’s take a closer look.';
  }
  return { mount, connectEstimate, prefill, calculateEstimate };
})();
