// Elevators division page (#/divisions/elevators): a two-step planner (service, then the
// elevator's details, laid out for that service), slideshows of elevator types, services and
// brands, then projects. Questions, labels and storage live in inquiry-details.js.
// Drawings are authored line art: a shaft section (machine room or machine-room-less) whose
// parts light up for each service, and floor plans that show what fits in each car.
window.TechouseElevators = (() => {
  const D = () => window.TechouseInquiryDetails;
  const icon = (name, cls) => window.TechouseIcons.icon(name, cls);
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHONE = '+63 985 562 6888';
  const TEL = 'tel:+639855626888';

  // ---- Drawings ------------------------------------------------------------------------------
  // Shaft section, 300 × 460. room: 'with' | 'without'. on: parts to highlight. labels: show names.
  const PARTS = {
    machine: 'Machine',
    controller: 'Control cabinet',
    ropes: 'Ropes',
    car: 'Car',
    counterweight: 'Counterweight',
    rails: 'Guide rails',
    doors: 'Landing doors',
    buffers: 'Buffers',
  };
  function shaft({ room = 'with', on = [], labels = false, title = '' } = {}) {
    const lit = (part) => (on.includes(part) ? ' is-on' : '');
    const top = room === 'with' ? 95 : 138; // sheave centre
    const floors = [200, 280, 360, 440];
    const machine =
      room === 'with'
        ? `<rect class="ev-d-room" x="92" y="58" width="116" height="62"/><g class="ev-part${lit('machine')}"><circle cx="150" cy="95" r="14"/><circle cx="150" cy="95" r="4"/><rect x="166" y="84" width="26" height="22"/></g><g class="ev-part${lit('controller')}"><rect x="100" y="70" width="20" height="42"/><path d="M104 80h12M104 88h12M104 96h8"/></g>`
        : `<g class="ev-part${lit('machine')}"><circle cx="150" cy="138" r="10"/><circle cx="150" cy="138" r="3"/><rect x="162" y="130" width="20" height="16"/></g><g class="ev-part${lit('controller')}"><rect x="196" y="160" width="16" height="36"/><path d="M199 168h10M199 175h10M199 182h6"/></g>`;
    // Labels sit level with their part: most on the right, parts on the left wall on the left.
    // Leaders run horizontally out of the drawing, jogging only when two labels would collide.
    const labelAt = {
      machine: room === 'with' ? [192, 95, 'right'] : [182, 138, 'right'],
      controller: room === 'with' ? [100, 80, 'left'] : [212, 178, 'right'],
      ropes: [181, 160, 'right'],
      counterweight: [184, 214, 'right'],
      car: [160, 322, 'right'],
      rails: [186, 400, 'right'],
      doors: [104, 262, 'left'],
      buffers: [177, 455, 'right'],
    };
    const place = (side) => {
      let last = -Infinity;
      return on
        .filter((part) => labelAt[part][2] === side)
        .sort((a, b) => labelAt[a][1] - labelAt[b][1])
        .map((part) => {
          const [x, y] = labelAt[part];
          const ty = Math.max(y, last + 26);
          last = ty;
          const elbow = side === 'right' ? 272 : 28;
          const tx = side === 'right' ? 284 : 16;
          return `<g class="ev-d-tag"><path d="M${x} ${y}H${elbow}V${ty}H${side === 'right' ? tx - 6 : tx + 6}"/><circle cx="${x}" cy="${y}" r="2.5"/><text x="${tx}" y="${ty + 5}"${side === 'left' ? ' text-anchor="end"' : ''}>${PARTS[part]}</text></g>`;
        })
        .join('');
    };
    const tags = labels ? place('right') + place('left') : '';
    return `<svg class="ev-drawing ev-shaft" viewBox="${labels ? '-170 40 610 430' : '0 0 300 470'}" role="img" aria-label="${esc(title || (room === 'with' ? 'Elevator with a machine room above the shaft' : 'Machine-room-less elevator with the machine inside the shaft'))}"><g class="ev-d-base"><path d="M20 440H280"/><path d="M40 120V440M260 120V440M40 120H260"/>${floors
      .slice(0, 3)
      .map((y) => `<path d="M40 ${y}H110M190 ${y}H260"/>`)
      .join(
        '',
      )}<path class="ev-d-wall" d="M110 120V460H190V120"/><path class="ev-d-pit" d="M110 460H190"/></g>${machine}<g class="ev-part${lit('rails')}"><path class="ev-d-thin" d="M116 124V440M164 124V440M186 124V440"/></g><g class="ev-part${lit('doors')}">${floors
      .map((y) => `<rect x="104" y="${y - 38}" width="6" height="38"/>`)
      .join(
        '',
      )}</g><g class="ev-part${lit('ropes')}"><path d="M141 ${top}V290M145 ${top}V290M159 ${top + 2}L178 180M163 ${top}L181 180"/></g><g class="ev-part${lit('counterweight')}"><rect x="172" y="180" width="12" height="62"/><path d="M172 196h12M172 212h12M172 228h12"/></g><g class="ev-part${lit('car')}"><rect x="120" y="290" width="40" height="64"/><path d="M120 300h40M140 354V300"/></g><g class="ev-part${lit('buffers')}"><path d="M136 460v-4l8-3-8-3 8-3-8-3M174 460v-3l6-2-6-2 6-2"/></g>${tags}</svg>`;
  }
  // Floor plans of each car, seen from above, 300 × 230; 1 m = 96 px (deep cars scale to fit).
  const M = 96;
  const person = (x, y, r = 13) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.68}"/>`;
  function plan(type) {
    const cars = {
      passenger: [1.35, 1.4],
      home: [1.0, 1.25],
      bed: [1.4, 2.4],
      cargo: [1.5, 2.7],
      panoramic: [1.1, 1.4],
    };
    if (type === 'escalator')
      return `<svg class="ev-drawing ev-floorplan" viewBox="0 0 300 230" role="img" aria-label="Escalator seen from the side, rising between two floors"><g class="ev-d-base"><path d="M16 190H70L230 70H286"/><path class="ev-d-thin" d="M16 196H286"/></g><g class="ev-part is-on"><path d="M60 160L84 160L220 58H252"/>${Array.from(
        { length: 9 },
        (_, i) => {
          const x = 78 + i * 17,
            y = 184 - i * 12.8;
          return `<path d="M${x} ${y}h12v-12.8"/>`;
        },
      ).join(
        '',
      )}</g><text class="ev-d-dim" x="150" y="222" text-anchor="middle">Typical rise 30°, one floor</text></svg>`;
    if (type === 'walkway')
      return `<svg class="ev-drawing ev-floorplan" viewBox="0 0 300 230" role="img" aria-label="Moving walkway seen from the side, nearly level"><g class="ev-d-base"><path d="M10 170H290"/></g><g class="ev-part is-on"><path d="M30 150H270"/><path d="M30 150a10 10 0 0 0 0 20H270a10 10 0 0 0 0-20"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${46 + i * 19} 156v8"/>`).join('')}<path d="M26 120H274"/><path class="ev-d-thin" d="M30 150V120M270 150V120"/></g><text class="ev-d-dim" x="150" y="210" text-anchor="middle">Level or gently sloped, up to 12°</text></svg>`;
    const [w, d] = cars[type];
    const pw = w * M,
      pd = d * M;
    const scale = Math.min(1, 160 / pd, 200 / pw);
    const W = pw * scale,
      H = pd * scale;
    const x0 = 150 - W / 2,
      y0 = 20;
    const door = Math.min(W - 12, (type === 'bed' || type === 'cargo' ? 1.2 : 0.9) * M * scale);
    const dx = x0 + (W - door) / 2;
    const inside = {
      passenger: () => {
        // Ten people: three rows of three and one more, spaced across the car.
        let out = '';
        for (let i = 0; i < 10; i++) {
          const r = Math.floor(i / 3),
            c = i % 3;
          out += person(x0 + W * (0.2 + c * 0.3), y0 + H * (0.14 + r * 0.24), W * 0.12);
        }
        return out;
      },
      home: () =>
        `<rect x="${x0 + W / 2 - 24}" y="${y0 + 18}" width="48" height="60"/><path d="M${x0 + W / 2 - 30} ${y0 + 22}v50M${x0 + W / 2 + 30} ${y0 + 22}v50M${x0 + W / 2 - 16} ${y0 + 78}v14h32v-14"/>`,
      bed: () =>
        `<rect x="${x0 + 10}" y="${y0 + 10}" width="${W - 40}" height="${H - 28}"/><path d="M${x0 + 16} ${y0 + 30}h${W - 52}"/>${person(x0 + W - 15, y0 + H / 2, 11)}`,
      cargo: () =>
        `<rect x="${x0 + 12}" y="${y0 + 12}" width="${W - 24}" height="${H * 0.5}"/>${[
          0.15, 0.3, 0.45,
        ]
          .map((f) => `<path d="M${x0 + 12} ${y0 + 12 + H * f}h${W - 24}"/>`)
          .join(
            '',
          )}<rect x="${x0 + 16}" y="${y0 + H * 0.62}" width="${W * 0.38}" height="${H * 0.26}"/>`,
      panoramic: () =>
        [
          [0.25, 0.2],
          [0.75, 0.2],
          [0.5, 0.48],
          [0.25, 0.76],
          [0.75, 0.76],
        ]
          .map(([fx, fy]) => person(x0 + W * fx, y0 + H * fy, W * 0.13))
          .join(''),
    }[type]();
    const glass =
      type === 'panoramic'
        ? `<path class="ev-d-glass" d="M${x0} ${y0 - 5}H${x0 + W}M${x0 - 5} ${y0}V${y0 + H * 0.7}M${x0 + W + 5} ${y0}V${y0 + H * 0.7}"/>`
        : '';
    const fmt = (n) => n.toFixed(2).replace(/0$/, '');
    return `<svg class="ev-drawing ev-floorplan" viewBox="0 0 300 230" role="img" aria-label="Floor plan of a typical ${type === 'bed' ? 'hospital bed' : type} elevator car, ${fmt(w)} by ${fmt(d)} metres"><g class="ev-d-base"><path d="M${x0} ${y0 + H}V${y0}H${x0 + W}V${y0 + H}"/><path d="M${x0} ${y0 + H}H${dx}M${dx + door} ${y0 + H}H${x0 + W}"/><path class="ev-d-thin" d="M${dx} ${y0 + H + 4}h${door}"/></g>${glass}<g class="ev-part is-on">${inside}</g><g class="ev-d-dims"><path d="M${x0} ${y0 + H + 16}h${W}M${x0} ${y0 + H + 12}v8M${x0 + W} ${y0 + H + 12}v8"/><path d="M${x0 + W + 16} ${y0}v${H}M${x0 + W + 12} ${y0}h8M${x0 + W + 12} ${y0 + H}h8"/></g><text class="ev-d-dim" x="150" y="${y0 + H + 32}" text-anchor="middle">${fmt(w)} m</text><text class="ev-d-dim" x="${x0 + W + 24}" y="${y0 + H / 2 + 4}">${fmt(d)} m</text></svg>`;
  }

  // ---- Planner ---------------------------------------------------------------------------------
  const QUESTIONS = {
    building: ['What kind of building is it?'],
    elevatorType: ['What will it mostly carry?'],
    floors: ['How many floors will it serve?', 'Count the ground floor and any basements.'],
    capacity: ['How big should it be?'],
    item: ['What’s the biggest thing it has to fit?'],
    doors: ['How many entrances does the car need?'],
    machineRoom: ['Machine room or machine-room-less?'],
    shaft: ['Where is the shaft at?'],
    timeline: ['When do you need it?'],
    condition: ['How is it running right now?'],
    brand: ['Which brand is it?'],
    units: ['How many elevators?'],
    age: ['How old is it?'],
    contract: ['Who maintains it now?'],
    issues: ['What’s wrong with it?', 'Choose all that apply.'],
    scope: ['What would you like to do?'],
    part: ['Which part do you need?', 'Its name, for example main control board or door operator.'],
    partNumber: ['Part or model number', 'From the part’s label, if you can read it.'],
    quantity: ['How many?'],
    model: ['Elevator model', 'Often on a plate inside the car or the control cabinet.'],
    stopped: ['Is the elevator stopped because of this part?'],
    client: ['Did Techouse install or maintain it?'],
  };
  // How each service's step 2 is laid out: groups of questions, in reading order.
  const LAYOUTS = {
    install: {
      intro: 'A spec sheet for your new elevator.',
      groups: [
        ['The building', ['building', 'elevatorType', 'floors']],
        ['The car', ['capacity', 'item', 'doors']],
        ['Shaft and machine', ['machineRoom', 'shaft', 'timeline']],
      ],
    },
    maintenance: {
      intro: 'Tell us how it’s doing and who looks after it.',
      groups: [
        [null, ['condition']],
        ['The elevator', ['brand', 'building', 'units', 'floors', 'age', 'contract']],
      ],
    },
    modernisation: {
      intro: 'Start with what’s bothering you.',
      groups: [
        [null, ['issues', 'scope']],
        ['The elevator', ['brand', 'age', 'units', 'floors', 'machineRoom']],
      ],
    },
    parts: {
      intro: 'Describe the part. A photo can follow once we talk.',
      groups: [
        [null, ['part', 'partNumber', 'quantity']],
        ['The elevator', ['brand', 'model', 'stopped', 'client']],
      ],
    },
  };
  // Simple mode: two or three plain questions per service. Detailed adds the rest in the same
  // ledger; answers carry over both ways because both modes share one form.
  const SIMPLE = {
    install: ['building', 'floors', 'item'],
    maintenance: ['condition', 'brand'],
    modernisation: ['issues', 'age'],
    parts: ['part', 'stopped'],
  };
  const SIMPLE_TITLES = {
    floors: 'How many floors?',
    item: 'What will it carry?',
    condition: 'Is it working right now?',
    issues: 'What’s bothering you?',
    stopped: 'Is the elevator stopped because of it?',
  };
  // The carry question in Simple mode offers only the everyday answers.
  const SIMPLE_ITEMS = ['none', 'wheelchair', 'bed', 'goods'];
  const INTRO = {
    simple: 'Just the basics, in plain words. Switch to Detailed if you know the specifications.',
  };
  const compact = new Set([
    'brand',
    'age',
    'contract',
    'doors',
    'shaft',
    'timeline',
    'stopped',
    'client',
    'item',
    'elevatorType',
  ]);
  function choices(key, service) {
    const C = D().CHOICES;
    const multi = D().LISTS.includes(key);
    const kind =
      key === 'building' ? 'icons' : compact.has(key) || key === 'machineRoom' ? 'chips' : 'tiles';
    return `<div class="ev-choices ev-${kind}${key === 'condition' ? ' ev-condition' : ''}">${C[key]
      .map(([value, title, extra]) => {
        const help =
          kind === 'tiles' && extra && key !== 'building' ? `<small>${esc(extra)}</small>` : '';
        const lead = key === 'building' ? icon(extra, 'ev-choice-icon') : '';
        const detailedOnly =
          key === 'item' && service === 'install' && !SIMPLE_ITEMS.includes(value)
            ? ' data-detailed'
            : '';
        return `<label data-value="${value}"${detailedOnly}><input type="${multi ? 'checkbox' : 'radio'}" name="${key}" value="${value}"><span>${lead}<strong>${esc(title)}</strong>${help}</span></label>`;
      })
      .join('')}</div>`;
  }
  // An existing elevator (maintenance, modernisation) is asked about in the present tense.
  const EXISTING = {
    floors: ['How many floors does it serve?', 'Count the ground floor and any basements.'],
    machineRoom: ['Does it have a machine room?'],
  };
  // One ledger row per question: the question on the left, the answer on the right.
  function field(key, service, scope) {
    const [title, hint] = service !== 'install' && EXISTING[key] ? EXISTING[key] : QUESTIONS[key];
    const simple = SIMPLE[service].includes(key);
    const simpleTitle =
      simple && SIMPLE_TITLES[key] && SIMPLE_TITLES[key] !== title ? SIMPLE_TITLES[key] : '';
    const words = simpleTitle
      ? `<span class="ev-t-simple">${simpleTitle}</span><span class="ev-t-detailed">${title}</span>`
      : title;
    const id = `ev-${scope}-${key}`;
    // "What is a machine room?" opens on hover, focus or tap.
    const tip =
      key === 'machineRoom'
        ? `<span class="ev-tip"><button type="button" class="ev-tip-button" aria-describedby="${id}-tip" aria-expanded="false" aria-label="What is a machine room?">${icon('info')}</button><span class="ev-tip-text" role="tooltip" id="${id}-tip">A machine room is a small room, usually on the roof above the elevator shaft, that holds the motor and the control cabinet. A machine-room-less elevator fits a compact motor inside the shaft, so no rooftop room is needed.</span></span>`
        : '';
    const hintHtml = hint ? `<p class="ev-q-hint" id="${id}-hint">${hint}</p>` : '';
    const described = hint ? ` aria-describedby="${id}-hint"` : '';
    const row = (kind, question, answer, group = false) =>
      `<div class="ev-row ev-row-${kind}" data-q="${key}"${simple ? '' : ' data-detailed'}${group ? ` role="group" aria-labelledby="${id}-q"` : ''}><div class="ev-row-q">${question}${hintHtml}</div><div class="ev-row-a">${answer}</div></div>`;
    if (key in D().NUMBERS) {
      const [min, max] = D().NUMBERS[key];
      return row(
        'number',
        `<label class="ev-q-title" for="${id}">${words}</label>`,
        `<div class="ev-stepper"><button type="button" data-step="-1" aria-label="Fewer">${icon('remove')}</button><input id="${id}" name="${key}" type="number" inputmode="numeric" min="${min}" max="${max}" placeholder="—"${described}><button type="button" data-step="1" aria-label="More">${icon('add')}</button></div>`,
      );
    }
    if (key in D().TEXTS)
      return row(
        'text',
        `<label class="ev-q-title" for="${id}">${words}</label>`,
        `<input id="${id}" name="${key}" maxlength="${D().TEXTS[key]}" autocomplete="off"${described}>`,
      );
    return row(
      'choice',
      `<p class="ev-q-title" id="${id}-q">${words}${tip}</p>`,
      choices(key, service),
      true,
    );
  }
  function serviceForm(service) {
    const layout = LAYOUTS[service];
    const groupList = layout.groups.map(
      ([heading, keys]) =>
        `<div class="ev-group" data-group="${heading || 'lead'}"><div class="ev-group-fields">${keys.map((k) => field(k, service, service)).join('')}</div></div>`,
    );
    const urgent =
      service === 'maintenance'
        ? `<p class="ev-urgent" data-urgent hidden>${icon('call')}<span>Stopped with someone inside, or a safety risk? <a href="${TEL}">Call ${PHONE}</a> now rather than waiting for a reply.</span></p>`
        : '';
    const promise =
      service === 'parts'
        ? `<div class="ev-promise"><strong>Hard-to-find parts, in as little as 7 days.</strong><p>Control boards, door operators, buttons and small electrical parts for any brand, including elevators we didn’t install. Timing depends on the part.</p></div>`
        : '';
    return `<form class="ev-form ev-form-${service}" data-ev-form="${service}" novalidate hidden><p class="ev-form-intro"><span class="ev-t-simple">${INTRO.simple}</span><span class="ev-t-detailed">${layout.intro}</span></p>${promise}${groupList[0]}${urgent}${groupList.slice(1).join('')}</form>`;
  }
  const serviceTiles = () =>
    `<div class="ev-services">${D()
      .CHOICES.service.map(
        ([value, title, text, ic]) =>
          `<button type="button" class="ev-service" aria-pressed="false" data-service="${value}">${icon(ic, 'ev-service-icon')}<strong>${title}</strong><span>${text}</span><span class="ev-service-go" aria-hidden="true">${icon('arrow_forward')}</span></button>`,
      )
      .join('')}</div>`;
  const planner = () =>
    `<section id="elevator-start" class="division-section ev-planner"><div class="section-heading"><h2>Tell us about<br>your elevator.</h2><p>Two steps: choose a service, then describe your elevator. Skip anything you’re unsure of.</p></div><div class="ev-plan" data-ev-plan data-step="1" data-mode="simple"><div class="ev-progress" role="group" aria-label="Elevator planner steps">${[
      'Service',
      'Your elevator',
    ]
      .map(
        (label, i) =>
          `<button type="button" data-go-step="${i + 1}"${i ? ' disabled' : ' aria-current="step"'}><span class="ev-step-marker" aria-hidden="true">${i + 1}</span><span class="ev-step-label">${label}</span></button>`,
      )
      .join(
        '',
      )}</div><div class="ev-step" data-step-panel="1"><h3 class="ev-step-title">What can we help with?</h3>${serviceTiles()}</div><div class="ev-step ev-step-2" data-step-panel="2" hidden><div class="ev-step-main"><div class="ev-step-head"><div class="ev-step-name"><h3 class="ev-step-title" data-service-title tabindex="-1"></h3><button type="button" class="text-link" data-go-step="1">${icon('arrow_back')} Change service</button></div><div class="ev-mode" role="group" aria-label="How much detail"><button type="button" data-mode="simple" aria-pressed="true">Simple</button><button type="button" data-mode="detailed" aria-pressed="false">Detailed</button></div></div>${Object.keys(
      LAYOUTS,
    )
      .map(serviceForm)
      .join(
        '',
      )}</div><aside class="ev-summary" aria-label="Your request"><h4>Your request</h4><dl data-summary></dl><button type="button" class="button" data-send>Send us your inquiry ${icon('arrow_forward')}</button><p>Nothing is sent yet. You’ll add your name and contact details on the next page.</p></aside></div></div></section>`;

  function readForm(form) {
    const service = form.dataset.evForm;
    const data = { service };
    for (const key of D().ASK[service]) {
      if (D().LISTS.includes(key))
        data[key] = [...form.querySelectorAll(`[name="${key}"]:checked`)].map((i) => i.value);
      // namedItem: form.elements.item would be the collection's own item() method.
      else data[key] = form.elements.namedItem(key)?.value ?? '';
    }
    return D().normalise('elevators', data) || { service };
  }
  function fillForm(form, plan) {
    for (const [key, value] of Object.entries(plan)) {
      if (key === 'service') continue;
      if (Array.isArray(value))
        value.forEach((v) => {
          const box = form.querySelector(`[name="${key}"][value="${CSS.escape(v)}"]`);
          if (box) box.checked = true;
        });
      else {
        const radio = form.querySelector(`[name="${key}"][value="${CSS.escape(String(value))}"]`);
        if (radio) radio.checked = true;
        else if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value;
      }
    }
  }
  function mountPlanner(root) {
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = '1';
    const forms = Object.fromEntries(
      [...root.querySelectorAll('[data-ev-form]')].map((f) => [f.dataset.evForm, f]),
    );
    const panels = [...root.querySelectorAll('[data-step-panel]')];
    const steps = [...root.querySelectorAll('.ev-progress [data-go-step]')];
    const summary = root.querySelector('[data-summary]');
    const title = root.querySelector('[data-service-title]');
    let service = '';
    const current = () => (service ? readForm(forms[service]) : null);
    // Simple or Detailed, remembered for this visit. Answers stay put when switching.
    const MODE_KEY = 'techouse-elevator-mode';
    const setMode = (mode) => {
      root.dataset.mode = mode;
      root
        .querySelectorAll('[data-mode]')
        .forEach(
          (b) => b !== root && b.setAttribute('aria-pressed', String(b.dataset.mode === mode)),
        );
      try {
        sessionStorage.setItem(MODE_KEY, mode);
      } catch {}
    };
    try {
      if (sessionStorage.getItem(MODE_KEY) === 'detailed') setMode('detailed');
    } catch {}
    const update = () => {
      const plan = current();
      if (!plan) return;
      D().savePlan(plan);
      summary.innerHTML = D()
        .facts(plan)
        .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join('');
      const urgent = forms.maintenance.querySelector('[data-urgent]');
      urgent.hidden = !(service === 'maintenance' && plan.condition === 'stopped');
    };
    const go = (step, focus = true) => {
      root.dataset.step = String(step);
      panels.forEach((p) => (p.hidden = p.dataset.stepPanel !== String(step)));
      steps.forEach((b, i) => {
        const n = i + 1;
        b.classList.toggle('is-complete', n < step);
        if (n === step) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
        b.disabled = n === 2 && !service;
        b.querySelector('.ev-step-marker').innerHTML = n < step ? icon('check') : String(n);
      });
      const panel = panels[step - 1];
      if (!still())
        panel.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
      if (focus) {
        const target =
          step === 2
            ? title
            : panel.querySelector('.ev-service[aria-pressed="true"]') ||
              panel.querySelector('.ev-service');
        target?.focus({ preventScroll: true });
        const top = root.getBoundingClientRect().top;
        if (top < 0 || top > innerHeight * 0.6)
          root.scrollIntoView({ block: 'start', behavior: still() ? 'instant' : 'smooth' });
      }
    };
    const choose = (value, focus = true) => {
      service = value;
      root
        .querySelectorAll('.ev-service')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.service === value)));
      Object.entries(forms).forEach(([k, f]) => (f.hidden = k !== value));
      title.textContent = D().CHOICES.service.find(([v]) => v === value)[1];
      update();
      go(2, focus);
    };
    root.addEventListener('click', (event) => {
      const tipButton = event.target.closest('.ev-tip-button');
      if (tipButton) {
        const open = tipButton.getAttribute('aria-expanded') !== 'true';
        tipButton.setAttribute('aria-expanded', String(open));
        return tipButton.parentElement.classList.toggle('is-open', open);
      }
      const modeButton = event.target.closest('.ev-mode [data-mode]');
      if (modeButton) return setMode(modeButton.dataset.mode);
      const tile = event.target.closest('.ev-service');
      if (tile) return choose(tile.dataset.service);
      const stepButton = event.target.closest('[data-go-step]');
      if (stepButton && !stepButton.disabled) return go(Number(stepButton.dataset.goStep));
      const stepper = event.target.closest('.ev-stepper [data-step]');
      if (stepper) {
        const input = stepper.parentElement.querySelector('input');
        const min = Number(input.min),
          max = Number(input.max);
        const n = Number(input.value) || (Number(stepper.dataset.step) > 0 ? min - 1 : min + 1);
        input.value = Math.min(max, Math.max(min, n + Number(stepper.dataset.step)));
        return update();
      }
      if (event.target.closest('[data-send]')) {
        const plan = current();
        if (!plan) return;
        D().savePlan(plan);
        location.hash = '#/inquiry?division=elevators&elevator=1';
      }
    });
    root.addEventListener('change', update);
    // Escape closes the tooltip, including one shown by hover or focus.
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      root.querySelectorAll('.ev-tip').forEach((tip) => {
        tip.classList.remove('is-open');
        tip.classList.add('is-dismissed');
        tip.querySelector('.ev-tip-button').setAttribute('aria-expanded', 'false');
      });
    });
    root.addEventListener('pointerover', (event) => {
      event.target.closest('.ev-tip')?.classList.remove('is-dismissed');
    });
    root.addEventListener('input', (event) => {
      if (event.target.matches('input[type="number"], input:not([type])')) update();
    });
    // Returning from the inquiry ("Change answers") or a service slide keeps the answers.
    const saved = D().readPlan();
    if (saved && forms[saved.service]) {
      fillForm(forms[saved.service], saved);
      choose(saved.service, false);
    } else go(1, false);
    root.choose = choose;
  }

  // ---- Slideshows ------------------------------------------------------------------------------
  // The partner journey's slideshow: one slide at a time, counter, progress, arrows, swipe.
  function slideshow({ id, label, items, flip = false, visualClass = '' }) {
    const n = items.length;
    return `<div class="ev-slides${flip ? ' ev-slides-flip' : ''}" role="region" aria-roledescription="carousel" aria-label="${label}" data-ev-slides="${id}"><div class="ev-slide-visual ${visualClass}">${items
      .map(
        (item, i) =>
          `<div class="ev-slide-art" data-slide-art="${i}"${i ? ' hidden' : ''}>${item.visual}</div>`,
      )
      .join(
        '',
      )}</div><div class="ev-slide-copy"><p class="ev-count"><strong data-slide-number>1</strong><span>/ ${n}</span></p><div class="ev-dots" role="group" aria-label="Choose a slide">${items
      .map(
        (item, i) =>
          `<button type="button" data-slide-go="${i}" aria-label="${i + 1}: ${esc(item.name || item.title)}"${i ? '' : ' aria-current="true"'}><span></span></button>`,
      )
      .join('')}</div><ol class="ev-slide-list" aria-live="polite">${items
      .map(
        (item, i) =>
          `<li data-slide="${i}"${i ? ' hidden' : ''}><h3>${item.title}</h3><p>${item.text}</p>${item.meta ? `<p class="ev-slide-meta">${item.meta}</p>` : ''}${item.action || ''}</li>`,
      )
      .join(
        '',
      )}</ol><div class="ev-slide-nav"><button type="button" class="ev-prev" data-slide-prev aria-label="Previous">${icon('arrow_back')}</button><button type="button" class="ev-next" data-slide-next aria-label="Next">${icon('arrow_forward')}</button></div></div></div>`;
  }
  function mountSlides(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = '1';
    const arts = [...root.querySelectorAll('[data-slide-art]')],
      items = [...root.querySelectorAll('[data-slide]')],
      dots = [...root.querySelectorAll('[data-slide-go]')],
      number = root.querySelector('[data-slide-number]');
    let index = 0;
    const show = (to) => {
      const next = (to + items.length) % items.length;
      if (next === index) return;
      arts[index].hidden = true;
      items[index].hidden = true;
      arts[next].hidden = false;
      items[next].hidden = false;
      if (!still()) {
        arts[next].animate(
          [
            { opacity: 0, filter: 'blur(6px)' },
            { opacity: 1, filter: 'blur(0)' },
          ],
          { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
        items[next].animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
        // Highlighted parts draw themselves in: the one authored motion on this page.
        arts[next].querySelectorAll('.ev-part.is-on > *').forEach((shape, i) => {
          const length = shape.getTotalLength?.() || 0;
          if (!length) return;
          shape.animate(
            [
              { strokeDasharray: length, strokeDashoffset: length },
              { strokeDasharray: length, strokeDashoffset: 0 },
            ],
            {
              duration: 700,
              delay: 120 + i * 25,
              easing: 'cubic-bezier(.22,.7,.2,1)',
              fill: 'backwards',
            },
          );
        });
      }
      index = next;
      number.textContent = String(index + 1);
      dots.forEach((dot, i) => {
        dot.classList.toggle('done', i < index);
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };
    root.querySelector('[data-slide-next]').addEventListener('click', () => show(index + 1));
    root.querySelector('[data-slide-prev]').addEventListener('click', () => show(index - 1));
    dots.forEach((dot) => dot.addEventListener('click', () => show(+dot.dataset.slideGo)));
    root.addEventListener('keydown', (event) => {
      if (event.target.closest('input,textarea')) return;
      if (event.key === 'ArrowRight') show(index + 1);
      else if (event.key === 'ArrowLeft') show(index - 1);
    });
    const visual = root.querySelector('.ev-slide-visual');
    let startX = null;
    visual.addEventListener('pointerdown', (event) => (startX = event.clientX));
    const reset = () => (startX = null);
    visual.addEventListener('pointercancel', reset);
    visual.addEventListener('pointerleave', reset);
    visual.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) > 40) show(index + (delta < 0 ? 1 : -1));
    });
  }

  // ---- Content ---------------------------------------------------------------------------------
  const TYPES = [
    {
      title: 'Passenger',
      text: 'Offices, condominiums and malls. Sized for the number of people riding at the busiest hour.',
      meta: 'Typical car 1.35 × 1.4 m · 800 kg · 10 people',
      visual: plan('passenger'),
    },
    {
      title: 'Home',
      text: 'A compact elevator for a house, quiet enough for every day, with room for a wheelchair.',
      meta: 'Typical car 1.0 × 1.25 m',
      visual: plan('home'),
    },
    {
      title: 'Hospital bed',
      text: 'A deep car that fits a bed, the patient and the staff beside them.',
      meta: 'Typical car 1.4 × 2.4 m · 1,600 kg',
      visual: plan('bed'),
    },
    {
      title: 'Cargo',
      text: 'Built for weight: pallets, trolleys and stock, with tougher floors and wider doors.',
      meta: 'Typical car 1.5 × 2.7 m · 2,000 kg or more',
      visual: plan('cargo'),
    },
    {
      title: 'Panoramic',
      text: 'Glass walls that turn the ride into a view, for lobbies, atriums and building facades.',
      meta: 'Typical car 1.1 × 1.4 m · 630 kg',
      visual: plan('panoramic'),
    },
    {
      title: 'Escalators',
      text: 'Keep crowds moving between floors in malls, stations and airports.',
      visual: plan('escalator'),
    },
    {
      title: 'Moving walkways',
      text: 'Flat or gently sloped, for long walks and trolleys in terminals and supermarkets.',
      visual: plan('walkway'),
    },
  ];
  const start = (service, label) =>
    `<button type="button" class="text-link ev-slide-action" data-start-service="${service}">${label} ${icon('arrow_forward')}</button>`;
  const SERVICES = [
    {
      title: 'New installation',
      text: 'We size the elevator, check the shaft, install, test and hand it over. Every car has layered safety: a speed governor, safety gear that grips the rails, and buffers in the pit.',
      visual: shaft({
        room: 'with',
        on: ['machine', 'controller', 'ropes', 'car', 'rails', 'doors', 'buffers'],
        labels: true,
        title: 'Elevator shaft: a new installation covers every part',
      }),
      action: start('install', 'Plan a new elevator'),
    },
    {
      title: 'Maintenance and repair',
      text: 'Visits every month or two replace worn parts before they fail. Already stopped? We repair any major brand. Elevators built from unbranded parts we inspect first.',
      visual: shaft({
        room: 'with',
        on: ['ropes', 'machine', 'doors', 'buffers'],
        labels: true,
        title: 'Elevator shaft: maintenance checks the ropes, machine, doors and buffers',
      }),
      action: start('maintenance', 'Book maintenance or a repair'),
    },
    {
      title: 'Modernisation and replacement',
      text: 'With care an elevator lasts about 25 years. Then a new motor, controls and car interior give it a second life, or we replace it in the same shaft.',
      visual: shaft({
        room: 'with',
        on: ['controller', 'machine', 'car'],
        labels: true,
        title: 'Elevator shaft: modernisation renews the controls, machine and car',
      }),
      action: start('modernisation', 'Plan a modernisation'),
    },
    {
      title: 'Parts and components',
      text: 'Control boards, door operators, buttons and small electrical parts that are hard to find in the Philippines, for any brand, even if we didn’t install it. Many arrive in as little as 7 days.',
      visual: shaft({
        room: 'with',
        on: ['controller', 'doors'],
        labels: true,
        title: 'Elevator shaft: parts such as control boards and door operators',
      }),
      action: start('parts', 'Request a part'),
    },
  ];
  const brand = (name) =>
    `<div class="ev-brand-art" role="img" aria-label="${esc(name)}"><span class="ev-brand-name">${name}</span></div>`;
  const BRANDS = [
    {
      title: 'A trusted Japanese name.',
      text: 'Hitachi elevators, built in Hitachi’s plants in China.',
      name: 'Hitachi',
      visual: brand('Hitachi'),
    },
    {
      title: 'Elevators and escalators.',
      text: 'EPSS, from Yida Express Elevator in Huzhou, China.',
      name: 'EPSS',
      visual: brand('EPSS'),
    },
    {
      title: 'Widely installed across China.',
      text: 'Shanghai Mitsubishi elevators, built in Shanghai.',
      name: 'Shanghai Mitsubishi',
      visual: brand('Shanghai Mitsubishi'),
    },
  ];

  // The page body below the cover. subnav and projectsSection come from divisions.js.
  function content({ subnav, projectsSection }) {
    return `${subnav('Elevator sections', [
      ['elevator-start', 'Get started'],
      ['elevator-types', 'Elevator types'],
      ['elevator-service', 'Services'],
      ['elevator-brands', 'Brands'],
      ['projects', 'Projects'],
    ])}<div class="division-wrap ev-page">${planner()}<section id="elevator-types" class="division-section ev-section"><div class="section-heading"><h2>Elevators for<br>every building.</h2><p>From a family home to a hospital, across all three brands, for new buildings and renovations.</p></div>${slideshow(
      {
        id: 'types',
        label: `Elevator types, ${TYPES.length} slides`,
        items: TYPES,
        visualClass: 'ev-visual-plan',
      },
    )}<p class="ev-note">We don’t supply external construction hoists. On a building site they collect debris and are easily overloaded, which puts riders at risk.</p></section><section id="elevator-service" class="division-section ev-section"><div class="section-heading"><h2>Installed, maintained,<br>renewed.</h2><p>An elevator is a long-term system. We look after it for its whole life, whoever installed it.</p></div>${slideshow(
      {
        id: 'services',
        label: `Elevator services, ${SERVICES.length} slides`,
        items: SERVICES,
        flip: true,
        visualClass: 'ev-visual-shaft',
      },
    )}</section><section id="elevator-brands" class="division-section ev-section"><div class="section-heading"><h2>Three brands.<br>Sourced direct.</h2><p>Straight from the manufacturers, with no resellers in between. We service any major brand.</p></div>${slideshow(
      {
        id: 'brands',
        label: `Elevator brands, ${BRANDS.length} slides`,
        items: BRANDS,
        visualClass: 'ev-visual-brand',
      },
    )}</section>${projectsSection()}</div>`;
  }

  function mount() {
    const root = document.querySelector('[data-ev-plan]');
    if (!root) return;
    mountPlanner(root);
    document.querySelectorAll('[data-ev-slides]').forEach(mountSlides);
    // "Plan a new elevator" and the other service slides open the planner on that service.
    document.querySelector('.ev-page')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-start-service]');
      if (button) root.choose(button.dataset.startService);
    });
    const params = new URLSearchParams(location.hash.split('?')[1]);
    if (params.get('section') === 'elevator-start')
      requestAnimationFrame(() =>
        document.querySelector('#elevator-start')?.scrollIntoView({ behavior: 'instant' }),
      );
  }

  return { content, mount, shaft, plan };
})();
