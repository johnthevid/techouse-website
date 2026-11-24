// Optional inquiry answers that only some divisions ask for, shared by the inquiry form, the
// Elevators page planner (elevator-page.js) and the back office:
// - Solar: the roof type (asked on the inquiry form only; the estimator does not ask for it).
// - Elevators: the service, then the details that service needs (see ASK).
// The server accepts only these values (platform/insights.mjs detailChoices); keep both in step.
window.TechouseInquiryDetails = (() => {
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const icon = (name, cls) => window.TechouseIcons.icon(name, cls);
  const STORE = 'techouse-elevator-plan-v2';

  // [value, label, extra...]. Extras are read by the planner (a line of help or an icon).
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
      ['install', 'New installation', 'A new elevator for a new or existing building.', 'elevator'],
      [
        'maintenance',
        'Maintenance and repair',
        'Regular care, or a fix for one that’s acting up.',
        'build',
      ],
      [
        'modernisation',
        'Modernisation and replacement',
        'Give an older elevator a second life, or replace it.',
        'upgrade',
      ],
      [
        'parts',
        'Parts and components',
        'Hard-to-find parts for any brand, even if we didn’t install it.',
        'memory',
      ],
    ],
    building: [
      ['residential', 'Residential', 'home'],
      ['commercial', 'Commercial', 'storefront'],
      ['industrial', 'Industrial', 'factory'],
    ],
    elevatorType: [
      ['passenger', 'Passenger'],
      ['home', 'Home'],
      ['bed', 'Hospital bed'],
      ['cargo', 'Cargo'],
      ['panoramic', 'Panoramic'],
      ['unsure', 'Not sure'],
    ],
    capacity: [
      ['450', 'Up to 6 people', '450 kg'],
      ['630', '8 people', '630 kg'],
      ['800', '10 people', '800 kg'],
      ['1000', '13 people', '1,000 kg'],
      ['1600', '21 people or a bed', '1,600 kg'],
      ['2000', 'Heavy goods', '2,000 kg or more'],
      ['unsure', 'Not sure', 'We’ll size it'],
    ],
    item: [
      ['none', 'People only'],
      ['wheelchair', 'A wheelchair'],
      ['stretcher', 'A stretcher'],
      ['bed', 'A hospital bed'],
      ['furniture', 'Furniture or appliances'],
      ['goods', 'Goods'],
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
    machineRoom: [
      ['with', 'With a machine room', 'The machine sits in a room above the shaft.'],
      ['without', 'Machine-room-less', 'The machine fits inside the shaft. Saves a rooftop room.'],
      ['unsure', 'Not sure', 'We’ll recommend one after seeing your plans.'],
    ],
    shaft: [
      ['plans', 'Still on plans'],
      ['building', 'Under construction'],
      ['ready', 'Shaft is ready'],
      ['none', 'Existing building, no shaft'],
    ],
    timeline: [
      ['3m', 'Within 3 months'],
      ['6m', 'In 3 to 6 months'],
      ['12m', 'In 6 to 12 months'],
      ['planning', 'Just planning'],
    ],
    condition: [
      ['running', 'Running fine', 'Looking for regular maintenance.'],
      ['issues', 'Running with problems', 'Noises, jerks, door faults, alarms.'],
      ['stopped', 'Stopped', 'Out of service right now.'],
    ],
    age: [
      ['under10', 'Under 10 years'],
      ['10to20', '10 to 20 years'],
      ['over20', 'Over 20 years'],
      ['unsure', 'Not sure'],
    ],
    contract: [
      ['none', 'No maintenance contract'],
      ['other', 'With another company'],
      ['techouse', 'With Techouse'],
    ],
    issues: [
      ['breakdowns', 'Breaks down often'],
      ['parts', 'Parts are hard to find'],
      ['ride', 'Slow or rough ride'],
      ['doors', 'Door problems'],
      ['look', 'Looks dated'],
      ['safety', 'Safety or code concerns'],
    ],
    scope: [
      ['upgrade', 'Upgrade what’s there', 'New motor, controls or car interior.'],
      ['replace', 'Replace the whole elevator', 'A new elevator in the existing shaft.'],
      ['advise', 'Advise me', 'We inspect first and recommend.'],
    ],
    brand: [
      ['hitachi', 'Hitachi'],
      ['mitsubishi', 'Mitsubishi'],
      ['epss', 'EPSS'],
      ['other', 'Another brand'],
      ['unknown', 'Not sure'],
    ],
    stopped: [
      ['yes', 'Yes, it’s stopped'],
      ['no', 'No, it’s for spares'],
    ],
    client: [
      ['yes', 'Yes'],
      ['no', 'No'],
    ],
    // Older inquiries were sent with six services; keep their labels readable.
    legacyService: [
      ['repair', 'Repair'],
      ['replacement', 'Replacement'],
    ],
  };
  const LABELS = {
    roofType: 'Roof type',
    service: 'Service needed',
    building: 'Building type',
    elevatorType: 'Elevator type',
    floors: 'Floors served',
    units: 'Number of elevators',
    capacity: 'Elevator size',
    item: 'Largest thing it carries',
    doors: 'Car entrances',
    machineRoom: 'Machine room',
    shaft: 'Shaft',
    timeline: 'Needed by',
    condition: 'Condition now',
    issues: 'What’s wrong',
    scope: 'Preferred approach',
    brand: 'Elevator brand',
    age: 'Age',
    contract: 'Maintenance now',
    part: 'Part needed',
    partNumber: 'Part or model number',
    model: 'Elevator model',
    quantity: 'Quantity',
    stopped: 'Elevator stopped',
    client: 'Techouse client',
  };
  // The details each service asks for, in the order the planner shows them.
  const ASK = {
    install: [
      'building',
      'elevatorType',
      'floors',
      'capacity',
      'item',
      'doors',
      'machineRoom',
      'shaft',
      'timeline',
    ],
    maintenance: ['condition', 'brand', 'building', 'units', 'floors', 'age', 'contract'],
    modernisation: ['issues', 'scope', 'brand', 'age', 'units', 'floors', 'machineRoom'],
    parts: ['part', 'partNumber', 'quantity', 'brand', 'model', 'stopped', 'client'],
  };
  const NUMBERS = { floors: [2, 120], units: [1, 50], quantity: [1, 999] };
  const TEXTS = { part: 200, partNumber: 80, model: 80 };
  const LISTS = ['issues'];

  const choice = (key, value) =>
    (CHOICES[key] || []).find(([v]) => v === value) ||
    (key === 'service' ? CHOICES.legacyService.find(([v]) => v === value) : null);
  const label = (key, value) => {
    if (key === 'floors') return `${value} floors`;
    if (key in NUMBERS) return String(value);
    if (key in TEXTS) return value;
    if (LISTS.includes(key))
      return (Array.isArray(value) ? value : [])
        .map((v) => choice(key, v)?.[1])
        .filter(Boolean)
        .join(', ');
    const found = choice(key, value);
    if (!found) return '';
    return key === 'capacity' && value !== 'unsure' ? `${found[1]} (${found[2]})` : found[1];
  };
  // Keep only known answers, and only the details the chosen service asks for.
  function normalise(division, input) {
    if (!input || typeof input !== 'object') return null;
    const out = {};
    if (division === 'solar') {
      if (choice('roofType', input.roofType)) out.roofType = input.roofType;
    } else if (division === 'elevators') {
      if (!ASK[input.service]) return null;
      out.service = input.service;
      for (const key of ASK[input.service]) {
        const value = input[key];
        if (key in NUMBERS) {
          const n = Number(value);
          const [min, max] = NUMBERS[key];
          if (value !== '' && value != null && Number.isInteger(n) && n >= min && n <= max)
            out[key] = n;
        } else if (key in TEXTS) {
          const text = String(value || '')
            .trim()
            .slice(0, TEXTS[key]);
          if (text) out[key] = text;
        } else if (LISTS.includes(key)) {
          const list = [...new Set(Array.isArray(value) ? value : [])].filter((v) =>
            choice(key, v),
          );
          if (list.length) out[key] = list;
        } else if (choice(key, value)) out[key] = value;
      }
    } else return null;
    return Object.keys(out).length ? out : null;
  }
  // [label, answer] pairs for summaries (planner, visitor confirmation, back office).
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

  // The planner's answers wait in this tab until the inquiry is sent.
  const readPlan = () => {
    try {
      return normalise('elevators', JSON.parse(sessionStorage.getItem(STORE) || 'null'));
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

  // A starting sentence for the required brief, built from the planner answers.
  function sentence(plan) {
    const service = {
      install: 'a new elevator installation',
      maintenance: 'elevator maintenance or repair',
      modernisation: 'modernising or replacing an elevator',
      parts: plan.part ? `an elevator part (${plan.part})` : 'an elevator part',
    }[plan.service];
    if (!service) return '';
    const building = plan.building ? ` for a ${plan.building} building` : '';
    const floors = plan.floors ? ` with ${plan.floors} floors` : '';
    return `I’d like to ask about ${service}${building}${floors}.\n\n`;
  }

  // ---- Inquiry form --------------------------------------------------------------------------
  const planLink = '#/divisions/elevators?section=elevator-start';
  const roofField = () =>
    `<div class="field full inquiry-detail" data-details="solar" hidden><label for="inquiry-roof">Roof type <small>(optional)</small></label><select id="inquiry-roof" name="detail-roofType"><option value="">Choose if you know it</option>${CHOICES.roofType
      .map(([value, text]) => `<option value="${value}">${esc(text)}</option>`)
      .join('')}</select></div>`;
  const elevatorCard = (plan) =>
    plan
      ? `<div class="inquiry-elevator-head"><h3>Your elevator</h3><a class="text-link" href="${planLink}">Change answers ${icon('arrow_outward')}</a></div><dl>${facts(
          plan,
        )
          .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
          .join('')}</dl>${
          plan.service === 'parts'
            ? '<p class="inquiry-elevator-note">Hard-to-find parts can arrive in as little as 7 days, depending on the part.</p>'
            : ''
        }`
      : `<div class="inquiry-elevator-head"><h3>Your elevator <small>(optional)</small></h3></div><p class="inquiry-elevator-note">Answer a few questions about the service and your elevator, so the right person calls you back ready.</p><a class="text-link" href="${planLink}">Answer the elevator questions ${icon('arrow_outward')}</a>`;
  function mount(form) {
    if (!form || form.querySelector('[data-details]')) return;
    const anchor = form.querySelector('#inquiry-capacity')?.closest('.field');
    if (!anchor) return;
    const plan = readPlan();
    anchor.insertAdjacentHTML(
      'beforebegin',
      `${roofField()}<section class="field full inquiry-detail inquiry-elevator" data-details="elevators" aria-label="Your elevator" hidden>${elevatorCard(plan)}</section>`,
    );
    // The planner's answers cover size; the free-text size field would repeat them.
    const sizeField = anchor;
    let starter = '';
    const sync = () => {
      const division = form.elements.division?.value;
      // Drop the planner's starting sentence if the visitor switches division without editing it.
      const brief = form.elements.requirements;
      if (starter && division !== 'elevators' && brief?.value === starter) brief.value = '';
      form
        .querySelectorAll('[data-details]')
        .forEach((f) => (f.hidden = f.dataset.details !== division));
      sizeField.hidden = division === 'elevators' && Boolean(plan);
    };
    const params = new URLSearchParams(location.hash.split('?')[1]);
    if (plan && params.get('elevator') === '1' && form.elements.division?.value === 'elevators') {
      const brief = form.elements.requirements;
      if (brief && !brief.value) brief.value = starter = sentence(plan);
    }
    form.elements.division?.addEventListener('change', sync);
    sync();
  }
  // The answers to send with the inquiry, or null.
  function value(form) {
    const division = form?.elements.division?.value;
    if (division === 'solar')
      return normalise('solar', { roofType: form.elements['detail-roofType']?.value });
    if (division === 'elevators') return readPlan();
    return null;
  }
  // Forget the planner answers once an inquiry has been saved or sent.
  const clear = () => savePlan(null);

  return {
    CHOICES,
    LABELS,
    ASK,
    NUMBERS,
    TEXTS,
    LISTS,
    label,
    normalise,
    facts,
    text,
    readPlan,
    savePlan,
    mount,
    value,
    clear,
  };
})();
