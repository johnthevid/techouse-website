// Optional inquiry answers that only some divisions ask for:
// - Solar: the roof type (inquiry form only; the estimator does not ask for it).
// - Elevators: service, building, floors, size, largest item, entrances, brand and part.
//   The Elevators page asks these first (planner) and hands the answers to the inquiry form,
//   where they can be changed. The server accepts only these values (platform/insights.mjs
//   detailChoices), so keep both lists in step.
window.TechouseInquiryDetails = (() => {
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const icon = (name, cls) => window.TechouseIcons.icon(name, cls);
  const STORE = 'techouse-elevator-plan-v1';

  const CHOICES = {
    roofType: [
      ['concrete', 'Concrete deck (flat roof)'],
      ['metal', 'Metal sheets (corrugated or rib-type)'],
      ['tile', 'Clay or concrete tiles'],
      ['asphalt', 'Asphalt shingles'],
      ['other', 'Something else'],
      ['unsure', 'Not sure'],
    ],
    service: [
      ['install', 'New installation', 'A new lift for a new or existing building.', 'elevator'],
      ['maintenance', 'Maintenance', 'Regular visits that keep a lift running.', 'event_repeat'],
      ['repair', 'Repair', 'A lift that has stopped or is acting up.', 'build'],
      ['replacement', 'Replacement', 'Take out an old lift and put in a new one.', 'autorenew'],
      [
        'modernisation',
        'Refurbishment or modernisation',
        'New motor, controls or car interior for an older lift.',
        'upgrade',
      ],
      ['parts', 'Parts and components', 'Hard-to-find boards and parts, for any lift.', 'memory'],
    ],
    building: [
      ['residential', 'Residential', 'home'],
      ['commercial', 'Commercial', 'storefront'],
      ['industrial', 'Industrial', 'factory'],
    ],
    capacity: [
      ['450', 'Up to 6 people', '450 kg'],
      ['630', '8 people', '630 kg'],
      ['800', '10 people', '800 kg'],
      ['1000', '13 people', '1,000 kg'],
      ['1600', '21 people or a hospital bed', '1,600 kg'],
      ['2000', 'Heavy goods', '2,000 kg or more'],
      ['unsure', 'Not sure', 'We’ll help you size it'],
    ],
    item: [
      ['none', 'People only'],
      ['wheelchair', 'A wheelchair'],
      ['stretcher', 'A stretcher'],
      ['bed', 'A hospital bed'],
      ['furniture', 'Furniture or appliances'],
      ['pallet', 'Pallets or trolleys'],
      ['vehicle', 'A car'],
      ['other', 'Something else'],
    ],
    doors: [
      ['1', 'One entrance'],
      ['2-opposite', 'Two, front and back'],
      ['2-adjacent', 'Two, front and side'],
      ['unsure', 'Not sure'],
    ],
    brand: [
      ['hitachi', 'Hitachi'],
      ['mitsubishi', 'Mitsubishi'],
      ['epss', 'EPSS'],
      ['other', 'Another brand'],
      ['unknown', 'Not sure'],
    ],
  };
  const LABELS = {
    roofType: 'Roof type',
    service: 'Service needed',
    building: 'Building type',
    floors: 'Floors served',
    capacity: 'Lift size',
    item: 'Largest thing it carries',
    doors: 'Car entrances',
    brand: 'Lift brand',
    part: 'Part needed',
  };
  // Questions shown in the planner, in order.
  const QUESTIONS = {
    building: 'What kind of building is it?',
    floors: 'How many floors will it serve?',
    capacity: 'How big should the lift be?',
    item: 'What’s the biggest thing it needs to carry?',
    doors: 'How many entrances does the car need?',
    brand: 'Which brand is the lift?',
    part: 'Which part do you need?',
  };
  // Which questions apply to each service. A new lift needs sizing; an existing one needs its brand.
  const ASK = {
    install: ['building', 'floors', 'capacity', 'item', 'doors'],
    replacement: ['building', 'floors', 'capacity', 'item', 'doors'],
    maintenance: ['building', 'floors', 'brand'],
    repair: ['building', 'floors', 'brand'],
    modernisation: ['building', 'floors', 'brand'],
    parts: ['brand', 'part'],
  };
  const FIELDS = {
    solar: ['roofType'],
    elevators: ['service', 'building', 'floors', 'capacity', 'item', 'doors', 'brand', 'part'],
  };

  const label = (key, value) => {
    if (key === 'floors') return `${value} floors`;
    if (key === 'part') return value;
    const choice = CHOICES[key]?.find(([v]) => v === value);
    if (!choice) return '';
    return key === 'capacity' && value !== 'unsure' ? `${choice[1]} (${choice[2]})` : choice[1];
  };
  // Keep only known answers, and only the elevator questions that apply to the chosen service.
  function normalise(division, input) {
    if (!FIELDS[division] || !input || typeof input !== 'object') return null;
    const out = {};
    const asked =
      division === 'elevators' && input.service
        ? new Set(['service', ...(ASK[input.service] || [])])
        : null;
    for (const key of FIELDS[division]) {
      if (asked && !asked.has(key)) continue;
      const value = input[key];
      if (key === 'floors') {
        const n = Number(value);
        if (value !== '' && value != null && Number.isInteger(n) && n >= 2 && n <= 120)
          out.floors = n;
      } else if (key === 'part') {
        const text = String(value || '')
          .trim()
          .slice(0, 200);
        if (text) out.part = text;
      } else if (CHOICES[key].some(([v]) => v === value)) out[key] = value;
    }
    return Object.keys(out).length ? out : null;
  }
  // [label, answer] pairs for summaries (visitor confirmation, back office).
  const facts = (details) =>
    details && typeof details === 'object'
      ? Object.keys(LABELS)
          .filter((key) => details[key] !== undefined && label(key, details[key]))
          .map((key) => [LABELS[key], label(key, details[key])])
      : [];
  const text = (details) =>
    facts(details)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');

  // ---- Elevators page planner ---------------------------------------------------------------
  const readPlan = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE) || 'null');
    } catch {
      return null;
    }
  };
  const savePlan = (plan) => {
    try {
      if (plan) sessionStorage.setItem(STORE, JSON.stringify(plan));
      else sessionStorage.removeItem(STORE);
    } catch {}
  };
  const tiles = (name, items, extra = '') =>
    `<div class="lift-choices${extra}">${items
      .map(
        ([value, title, ...rest]) =>
          `<label><input type="radio" name="${name}" value="${value}"><span>${
            name === 'service' ? icon(rest[1], 'lift-choice-icon') : ''
          }${name === 'building' ? icon(rest[0], 'lift-choice-icon') : ''}<strong>${title}</strong>${
            name === 'service' || name === 'capacity' ? `<small>${rest[0]}</small>` : ''
          }</span></label>`,
      )
      .join('')}</div>`;
  const question = (key) => {
    if (key === 'floors')
      return `<div class="lift-q" data-q="floors" hidden><label class="lift-q-title" for="lift-floors">${QUESTIONS.floors}</label><p class="lift-q-hint">Count the ground floor and any basements.</p><div class="lift-stepper"><button type="button" data-step="-1" aria-label="One floor fewer">${icon('remove')}</button><input id="lift-floors" name="floors" type="number" inputmode="numeric" min="2" max="120" placeholder="—"><button type="button" data-step="1" aria-label="One floor more">${icon('add')}</button></div></div>`;
    if (key === 'part')
      return `<div class="lift-q" data-q="part" hidden><label class="lift-q-title" for="lift-part">${QUESTIONS.part}</label><p class="lift-q-hint">A name, model or part number helps. A photo can follow once we talk.</p><input id="lift-part" name="part" maxlength="200" placeholder="e.g. main control board, door operator, push buttons"></div>`;
    return `<fieldset class="lift-q" data-q="${key}" hidden><legend class="lift-q-title">${QUESTIONS[key]}</legend>${tiles(key, CHOICES[key], key === 'item' || key === 'capacity' ? ' lift-choices-wide' : '')}</fieldset>`;
  };
  const planner = () =>
    `<section id="elevator-start" class="division-section lift-planner"><div class="section-heading"><h2>Tell us about<br>your lift.</h2><p>A few quick questions, so the right person calls you back ready. Skip any you’re unsure of.</p></div><form class="lift-plan" data-lift-plan novalidate><fieldset class="lift-q" data-q="service"><legend class="lift-q-title">What can we help with?</legend>${tiles('service', CHOICES.service, ' lift-choices-services')}</fieldset><aside class="lift-parts-offer" data-parts-offer hidden><strong>Hard-to-find parts, in as little as 7 days.</strong><p>Control boards, electrical components and small parts that are difficult to find in the Philippines. For any lift, not only ones we installed. Timing depends on the part.</p></aside>${Object.keys(QUESTIONS).map(question).join('')}<div class="lift-plan-actions" hidden><button class="button" type="submit">Continue to your inquiry ${icon('arrow_forward')}</button><p>Nothing is sent yet. You’ll add your details and review everything on the next page.</p></div></form></section>`;

  function readForm(form) {
    const data = Object.fromEntries(new FormData(form));
    return normalise('elevators', data) || {};
  }
  function syncPlanner(form) {
    const service = form.elements.service.value;
    const asked = new Set(ASK[service] || []);
    form.querySelectorAll('.lift-q[data-q]').forEach((q) => {
      if (q.dataset.q !== 'service') q.hidden = !asked.has(q.dataset.q);
    });
    form.querySelector('[data-parts-offer]').hidden = service !== 'parts';
    form.querySelector('.lift-plan-actions').hidden = !service;
  }
  function mountPlanner(form) {
    if (!form || form.dataset.mounted) return;
    form.dataset.mounted = '1';
    // Coming back from the inquiry page keeps the earlier answers.
    const saved = readPlan();
    if (saved)
      for (const [key, value] of Object.entries(saved)) {
        const field = form.elements[key];
        if (!field) continue;
        if (field instanceof RadioNodeList || field.type === 'radio')
          form.querySelector(`input[name="${key}"][value="${CSS.escape(String(value))}"]`)?.click();
        else field.value = value;
      }
    syncPlanner(form);
    form.addEventListener('change', (event) => {
      syncPlanner(form);
      // After the first answer, bring the next question into view on small screens.
      if (event.target.name === 'service' && matchMedia('(max-width: 700px)').matches) {
        const next = form.querySelector('.lift-q[data-q]:not([data-q="service"]):not([hidden])');
        next?.scrollIntoView({
          block: 'start',
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }
    });
    form.addEventListener('click', (event) => {
      const step = event.target.closest('[data-step]');
      if (!step) return;
      const input = form.elements.floors;
      const current = Number(input.value) || 1;
      input.value = Math.min(120, Math.max(2, current + Number(step.dataset.step)));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const plan = readForm(form);
      if (!plan.service) return;
      savePlan(plan);
      location.hash = '#/inquiry?division=elevators&lift=1';
    });
  }

  // ---- Inquiry form fields -------------------------------------------------------------------
  const select = (key, id, placeholder) =>
    `<select id="${id}" name="detail-${key}"><option value="">${placeholder}</option>${CHOICES[key]
      .map(([value]) => `<option value="${value}">${esc(label(key, value))}</option>`)
      .join('')}</select>`;
  const formFields = () =>
    `<div class="field full inquiry-detail" data-details="solar" hidden><label for="inquiry-roof">Roof type <small>(optional)</small></label>${select('roofType', 'inquiry-roof', 'Choose if you know it')}</div><fieldset class="field full inquiry-detail inquiry-lift" data-details="elevators" hidden><legend>About the lift <small>(optional)</small></legend><p class="inquiry-lift-note" data-lift-note hidden>Answers from the Elevators page. Change anything here.</p><div class="field-grid"><div class="field full"><label for="inquiry-lift-service">Service needed</label>${select('service', 'inquiry-lift-service', 'Choose a service')}</div><div class="field" data-lift="building"><label for="inquiry-lift-building">Building type</label>${select('building', 'inquiry-lift-building', 'Choose')}</div><div class="field" data-lift="floors"><label for="inquiry-lift-floors">Floors served</label><input id="inquiry-lift-floors" name="detail-floors" type="number" inputmode="numeric" min="2" max="120" placeholder="Including ground"></div><div class="field" data-lift="capacity"><label for="inquiry-lift-capacity">Lift size</label>${select('capacity', 'inquiry-lift-capacity', 'Choose')}</div><div class="field" data-lift="item"><label for="inquiry-lift-item">Largest thing it carries</label>${select('item', 'inquiry-lift-item', 'Choose')}</div><div class="field" data-lift="doors"><label for="inquiry-lift-doors">Car entrances</label>${select('doors', 'inquiry-lift-doors', 'Choose')}</div><div class="field" data-lift="brand"><label for="inquiry-lift-brand">Lift brand</label>${select('brand', 'inquiry-lift-brand', 'Choose')}</div><div class="field full" data-lift="part"><label for="inquiry-lift-part">Part needed</label><input id="inquiry-lift-part" name="detail-part" maxlength="200" placeholder="Name, model or part number"></div></div><p class="inquiry-lift-parts" data-lift-parts hidden>Hard-to-find parts can arrive in as little as 7 days, depending on the part.</p></fieldset>`;
  // A starting sentence for the required brief, built from the planner answers.
  function sentence(plan) {
    const service = {
      install: 'a new lift installation',
      maintenance: 'lift maintenance',
      repair: 'a lift repair',
      replacement: 'a lift replacement',
      modernisation: 'refurbishing or modernising a lift',
      parts: 'a lift part',
    }[plan.service];
    if (!service) return '';
    const building = plan.building ? ` for a ${plan.building} building` : '';
    const floors = plan.floors ? ` with ${plan.floors} floors` : '';
    return `I’d like to ask about ${service}${building}${floors}.\n\n`;
  }
  function mount(form) {
    if (!form || form.querySelector('[data-details]')) return;
    const anchor = form.querySelector('#inquiry-capacity')?.closest('.field');
    if (!anchor) return;
    anchor.insertAdjacentHTML('beforebegin', formFields());
    const lift = form.querySelector('[data-details="elevators"]');
    const syncLift = () => {
      const service = form.elements['detail-service'].value;
      const asked = new Set(ASK[service] || []);
      lift.querySelectorAll('[data-lift]').forEach((f) => (f.hidden = !asked.has(f.dataset.lift)));
      lift.querySelector('[data-lift-parts]').hidden = service !== 'parts';
    };
    let starter = '';
    const sync = () => {
      const division = form.elements.division?.value;
      // Drop the planner's starting sentence if the visitor switches division without editing it.
      const brief = form.elements.requirements;
      if (starter && division !== 'elevators' && brief?.value === starter) brief.value = '';
      form
        .querySelectorAll('[data-details]')
        .forEach((f) => (f.hidden = f.dataset.details !== division));
      syncLift();
    };
    // Answers from the Elevators page planner.
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const plan = params.get('lift') === '1' ? readPlan() : null;
    if (plan && form.elements.division?.value === 'elevators') {
      for (const [key, value] of Object.entries(plan)) {
        const field = form.elements['detail-' + key];
        if (field) field.value = value;
      }
      lift.querySelector('[data-lift-note]').hidden = false;
      const brief = form.elements.requirements;
      if (brief && !brief.value) brief.value = starter = sentence(plan);
    }
    form.elements.division?.addEventListener('change', sync);
    form.elements['detail-service'].addEventListener('change', syncLift);
    sync();
  }
  // The answers to send with the inquiry, or null.
  function value(form) {
    const division = form?.elements.division?.value;
    if (!FIELDS[division]) return null;
    const input = {};
    for (const key of FIELDS[division]) input[key] = form.elements['detail-' + key]?.value ?? '';
    return normalise(division, input);
  }
  // Forget the planner answers once an inquiry has been saved or sent.
  const clear = () => savePlan(null);

  return { planner, mountPlanner, mount, value, facts, text, clear, CHOICES };
})();
