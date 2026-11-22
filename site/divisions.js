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
  <section class="estimator division-section" id="estimator"><div class="section-heading"><span>03 / PLAN YOUR PROJECT</span><h2>What could solar<br>look like for you?</h2><p>Get a starting budget using editable sample assumptions. A site assessment and equipment selection will determine your final proposal.</p></div><form id="solar-estimator"><div class="estimate-inputs"><label class="solar-bill-field">Your monthly electricity bill<span class="solar-bill-input"><span aria-hidden="true">₱</span><input name="bill" type="number" inputmode="numeric" min="500" max="5000000" step="100" value="6000" required aria-describedby="solar-bill-note"></span><small id="solar-bill-note">Any recent bill is fine. Round numbers work.</small></label><div class="solar-questions"><p class="solar-question-count"><i aria-hidden="true"></i><i aria-hidden="true"></i><span aria-live="polite">Question 1 of 2</span></p><div class="solar-answer" data-answer="nightShare" hidden>${window.TechouseIcons.icon('check')}<span>Most use</span><b></b><button type="button" data-change="nightShare">Change<span class="visually-hidden"> when you use the most electricity</span></button></div><fieldset class="solar-tile-choices solar-usage-choices" data-question="nightShare"><legend>When do you use the most electricity?</legend><div><label><input type="radio" name="nightShare" value="25" required><span>${window.TechouseIcons.icon('light_mode')}<strong>Mostly daytime</strong><small>Shop hours, home office</small><em class="solar-suggest" hidden></em></span></label><label><input type="radio" name="nightShare" value="50" required><span>${window.TechouseIcons.icon('routine')}<strong>Day and night</strong><small>Spread through the day</small><em class="solar-suggest" hidden></em></span></label><label><input type="radio" name="nightShare" value="75" required><span>${window.TechouseIcons.icon('dark_mode')}<strong>Mostly at night</strong><small>Aircon and lights after dark</small><em class="solar-suggest" hidden></em></span></label></div></fieldset><div class="solar-answer" data-answer="offset" hidden>${window.TechouseIcons.icon('check')}<span>Solar covers</span><b></b><button type="button" data-change="offset">Change<span class="visually-hidden"> how much solar should cover</span></button></div><fieldset class="solar-tile-choices solar-coverage-choices" data-question="offset" hidden><legend>How much of your bill should solar take on?</legend><div><label><input type="radio" name="offset" value="50" required><span>${window.TechouseIcons.icon('power')}<strong>Just the essentials</strong><small>Lights, fans, fridge, Wi‑Fi</small><em class="solar-suggest" hidden></em></span></label><label><input type="radio" name="offset" value="80" required><span>${window.TechouseIcons.icon('electric_bolt')}<strong>Essentials and more</strong><small>Plus aircon and appliances</small><em class="solar-suggest">Suggested</em></span></label><label><input type="radio" name="offset" value="95" required><span>${window.TechouseIcons.icon('home')}<strong>Most of my bill</strong><small>Solar as your main power</small><em class="solar-suggest" hidden></em></span></label></div></fieldset></div><input type="hidden" name="sector" value="Residential"><details class="solar-fine-tune"><summary>Using <b data-rate-summary>₱16/kWh</b> · Fine-tune (optional)</summary><label>Electricity rate (₱ / kWh)<input name="rate" type="number" min="1" max="100" step="0.0001" value="16" required><small data-rate-note>Typical Meralco rate. Edit to match your bill.</small></label><label>Panel technology<select name="panel"><option value="topcon">620 W TOPCon</option><option value="bc">660 W back-contact (BC)</option></select></label></details></div><div class="estimate-result" aria-live="polite" aria-atomic="true" id="estimate-result"></div></form><p class="estimate-disclaimer">Planning illustration only, not a quotation or savings guarantee. Uses Techouse equipment pricing, 4.5 peak sun hours/day, 20% system losses and 30 days/month. Energy offset assumes generation is used on site; no export credits are assumed. Roof suitability, shading, permits, electrical upgrades, actual tariffs and battery sizing need assessment.</p></section>`;
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
    return `<nav class="division-subnav construction-subnav" aria-label="Construction sections"><a href="#construction-start" data-scroll="construction-start">Your project</a><a href="#construction-methods" data-scroll="construction-methods">How we build</a><a href="#construction-process" data-scroll="construction-process">The next steps</a><a href="#construction-questions" data-scroll="construction-questions">Common questions</a></nav><div class="division-wrap construction-content"><section id="construction-start" class="division-section"><div class="section-heading"><h2>What are you<br>planning to build?</h2><p>Choose a starting point. Share your requirements so our team can review the scope with you.</p></div><div class="construction-project-types">${types.map(([name, heading, text, symbol]) => `<a class="construction-type" href="#/inquiry?division=construction&project=${name.toLowerCase()}"><div class="construction-type-top">${window.TechouseIcons.icon(symbol)}<span>${name}</span></div><h3>${heading}</h3><p>${text}</p><span class="construction-type-action">Discuss your project ${icon}</span></a>`).join('')}</div><p class="construction-scope-note">Project requirements, service coverage and delivery scope are confirmed with our team.</p></section><section id="construction-methods" class="division-section"><div class="section-heading"><h2>Two ways<br>we build.</h2><p>Both use steel moulds for consistent, solid concrete. The right one depends on your building.</p></div><div class="construction-project-types two-up"><a class="construction-type" href="#/divisions/prefabrication"><div class="construction-type-top">${window.TechouseIcons.icon('home_work')}<span>Precast modules</span></div><h3>Built in the factory.</h3><p>Room-sized concrete modules are cast in steel moulds, cured, then lifted into place. Fast and consistent for repeatable homes, classrooms and rentals up to three storeys.</p><span class="construction-type-action">Explore prefabrication ${icon}</span></a><a class="construction-type" href="#/inquiry?division=construction"><div class="construction-type-top">${window.TechouseIcons.icon('construction')}<span>Cast-in-place</span></div><h3>Poured on site.</h3><p>Steel moulds are set up on site and walls, partitions and floors are poured together, floor by floor. The same system works from a two-storey house up to about ten storeys.</p><span class="construction-type-action">Discuss your project ${icon}</span></a></div></section><section id="construction-process" class="division-section construction-process"><div class="section-heading"><h2>A clear brief.<br>A better starting point.</h2><p>From an early idea to an existing set of plans, start with what you already know.</p></div><ol><li><strong>Share your idea</strong><p>Tell us your location, intended use, approximate floor area and target schedule.</p></li><li><strong>Review the requirements</strong><p>Discuss your plans, site conditions and priorities with our team.</p></li><li><strong>Define the next step</strong><p>Agree on the proposed scope, responsibilities and requirements before proceeding.</p></li></ol></section><section class="construction-brief"><div><h2>Bring what you have.<br>We’ll start there.</h2><p>You don’t need every detail ready to start a conversation.</p></div><ul><li>Site location and approximate area</li><li>Building use and preferred spaces</li><li>Available drawings or reference images</li><li>Target timeline and budget range</li></ul><a class="button" href="#/inquiry?division=construction">Let’s start building ${icon}</a></section><section id="construction-questions" class="division-section construction-questions"><div class="section-heading"><h2>A few useful<br>starting questions.</h2></div><details><summary>Can I inquire without complete plans?</summary><p>Yes. Share your idea, location and any references you have. The information needed for the next stage can be discussed with the team.</p></details><details><summary>Can I get a construction price online?</summary><p>A useful proposal needs a defined scope and project details. Share your area, intended use and available plans so the team can review what is needed.</p></details><details><summary>What if I’m considering a prefabricated building?</summary><p>Explore our Prefabrication division, then discuss the approach that fits your plans.</p><a class="text-link" href="#/divisions/prefabrication">Explore prefabrication ${icon}</a></details></section></div>`;
  }
  // Shared pieces for the content-led division pages (Prefabrication, Elevators).
  const arrowIcon = () => window.TechouseIcons.icon('arrow_outward');
  const brief = (d, label) =>
    `<section class="construction-brief"><div><h2>Bring what you have.<br>We’ll start there.</h2><p>You don’t need every detail ready to start a conversation.</p></div><ul>${d.prompts.map((p) => `<li>${p}</li>`).join('')}</ul><a class="button" href="#/inquiry?division=${d.id}">${label} ${arrowIcon()}</a></section>`;
  const faq = (id, heading, items) =>
    `<section id="${id}" class="division-section construction-questions"><div class="section-heading"><h2>${heading}</h2></div>${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`;
  const steps = (id, heading, intro, items) =>
    `<section id="${id}" class="division-section construction-process"><div class="section-heading"><h2>${heading}</h2><p>${intro}</p></div><ol>${items.map(([t, p]) => `<li><strong>${t}</strong><p>${p}</p></li>`).join('')}</ol></section>`;
  const subnav = (label, links) =>
    `<nav class="division-subnav construction-subnav" aria-label="${label}">${links.map(([id, text]) => `<a href="#${id}" data-scroll="${id}">${text}</a>`).join('')}</nav>`;

  function prefabricationContent(d) {
    const uses = [
      [
        'home_work',
        'Homes',
        'Multi-storey homes.',
        'Stack modules into two- or three-storey houses, with an open balcony on the upper level and sliding doors where you need them.',
      ],
      [
        'home',
        'Schools & dormitories',
        'Classrooms and shared rooms.',
        'A standard module gives about 23 m² of clear space for a classroom or dorm room, ready to repeat floor after floor.',
      ],
      [
        'storefront',
        'Rentals & social housing',
        'Apartments and rentals.',
        'One module is roughly one socialised-housing unit. Stack three storeys with stairs at the side and an open corridor along the canopies.',
      ],
    ];
    const specs = [
      ['Module size', '7.2 × 3.6 × 3 m'],
      ['Floor area', 'About 23 m²'],
      ['Walls', '15 cm'],
      ['Roof slab', '12 cm'],
      ['Concrete strength', '3,000–5,000 PSI'],
      ['Stacking', 'Up to 3 storeys'],
      ['Canopy', 'About 1 m per module'],
      ['Shared corridor', 'About 2.5 m between facing modules'],
    ];
    return `${subnav('Prefabrication sections', [
      ['prefab-made', 'How it’s made'],
      ['prefab-specs', 'Specifications'],
      ['prefab-uses', 'Where it works'],
      ['prefab-delivery', 'Delivery'],
    ])}<div class="division-wrap construction-content">${steps(
      'prefab-made',
      'Cast in steel.<br>Finished smooth.',
      'Each module is a complete room, formed in one piece in a precision steel mould.',
      [
        [
          'Moulded in one piece',
          'Walls, posts and the roof beam are formed together in a closed steel mould, so every module comes out the same.',
        ],
        [
          'Steam before the pour',
          'The mould is steam-heated before the concrete goes in, driving out the air bubbles that leave pits and gaps. Modules come out smooth, with no plastering needed.',
        ],
        [
          'Cured for strength',
          'Modules are lifted out after 12 hours and cured for another 15 days, reaching 3,000 PSI in under ten days and 3,000 to 5,000 PSI depending on the mix.',
        ],
      ],
    )}<section id="prefab-specs" class="division-section"><div class="section-heading"><h2>The standard module.</h2><p>Sizes can be adjusted to suit your lot and layout.</p></div><dl class="division-specs">${specs.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="division-note">Walls can be thinner for single-storey buildings; three-storey buildings keep the full 15 cm. Lengths can be shortened, for example to 6 m, to work with lot setbacks.</p></section><section id="prefab-uses" class="division-section"><div class="section-heading"><h2>Where modules<br>work best.</h2><p>Repeatable rooms, built quickly and consistently.</p></div><div class="construction-project-types">${uses.map(([icon, name, heading, text]) => `<a class="construction-type" href="#/inquiry?division=prefabrication"><div class="construction-type-top">${window.TechouseIcons.icon(icon)}<span>${name}</span></div><h3>${heading}</h3><p>${text}</p><span class="construction-type-action">Discuss your project ${arrowIcon()}</span></a>`).join('')}</div></section>${faq(
      'prefab-delivery',
      'Getting modules<br>to your site.',
      [
        [
          'How are modules delivered?',
          'Each module weighs about 25 tonnes, similar to a fully loaded 20-foot container. It travels by truck and is set in place by a large crane, so the site needs room for both.',
        ],
        [
          'Why are modules 3.6 m wide?',
          'That is the widest a module can travel safely on public roads. When modules are cast on site, wider units, such as 4 m, become possible.',
        ],
        [
          'Can the plant come to our site?',
          'For larger developments, generally around 100 units or more, the moulding plant can be set up on site. Modules are then cast where they are installed, without long-distance trucking.',
        ],
        [
          'Is prefab right for a small project far away?',
          'Trucking and crane costs grow quickly with distance, especially between islands. For a few units far from the plant, conventional construction may cost less. We’ll tell you honestly which suits your project.',
        ],
      ],
    )}${brief(d, 'Let’s talk about your project')}</div>`;
  }

  function elevatorContent(d) {
    const brands = [
      [
        'Hitachi',
        'Built in Hitachi’s China plants.',
        'A long-trusted Japanese name. The Hitachi lifts we supply are made in China.',
      ],
      [
        'EPSS',
        'Elevators and escalators.',
        'By Yida Express Elevator Co., Ltd., a manufacturer based in Huzhou, Zhejiang, China.',
      ],
      [
        'Shanghai Mitsubishi',
        'Mitsubishi, built in Shanghai.',
        'The China-made Mitsubishi elevator line, widely installed across China.',
      ],
    ];
    const types = [
      'Passenger lifts',
      'Panoramic lifts',
      'Cargo lifts',
      'Home lifts',
      'Hospital bed lifts',
      'Escalators',
      'Moving walkways',
    ];
    return `${subnav('Elevator sections', [
      ['elevator-brands', 'Our brands'],
      ['elevator-types', 'What we install'],
      ['elevator-service', 'Service'],
      ['elevator-questions', 'Good to know'],
    ])}<div class="division-wrap construction-content"><section id="elevator-brands" class="division-section"><div class="section-heading"><h2>Three brands.<br>Sourced direct.</h2><p>We buy direct from the manufacturers through our partners in China, without layers of resellers in between.</p></div><div class="construction-project-types">${brands.map(([name, heading, text]) => `<article class="construction-type"><div class="construction-type-top">${window.TechouseIcons.icon('elevator')}<span>${name}</span></div><h3>${heading}</h3><p>${text}</p></article>`).join('')}</div></section><section id="elevator-types" class="division-section"><div class="section-heading"><h2>Lifts for<br>every building.</h2><p>Available across our three brands, for new buildings and renovations.</p></div><ul class="division-type-list">${types.map((t) => `<li>${window.TechouseIcons.icon('check')}<span>${t}</span></li>`).join('')}</ul><p class="division-note">We don’t supply external construction hoists. On a building site they collect debris and are easily overloaded, which puts riders at risk.</p></section>${steps(
      'elevator-service',
      'Installed, maintained,<br>renewed.',
      'A lift is a long-term system. We look after it for its whole life.',
      [
        [
          'Installation',
          'Supply and installation of new lifts and escalators for new buildings and renovations.',
        ],
        [
          'Regular maintenance',
          'Visits every month or every other month: lubrication, tightening cables as they stretch, and replacing wear parts such as sheaves and door rollers before they fail.',
        ],
        [
          'Modernisation',
          'After about 25 years, a lift is due for review. We replace what’s needed, such as the motor, cables and controller, and can refresh the car interior so it looks and feels new.',
        ],
      ],
    )}<p class="division-note division-note-wide">We service any major brand, not only the three we sell. Lifts built from unbranded parts can be difficult to repair, so we inspect first.</p>${faq(
      'elevator-questions',
      'Good to know.',
      [
        [
          'How long does an elevator last?',
          'About 25 years with regular maintenance. Along the way, wear parts are replaced every year or two depending on traffic. At around 25 years, the whole system is reviewed for replacement or modernisation.',
        ],
        [
          'What keeps passengers safe?',
          'Lifts have layered safety systems: a speed governor that monitors the car, safety gear that clamps the car to its rails if it overspeeds, and buffers in the pit below.',
        ],
        [
          'Can you maintain an elevator we bought elsewhere?',
          'Yes, for any major brand. Lifts built from unbranded parts can be difficult or impossible to repair, so we’ll inspect it first.',
        ],
      ],
    )}${brief(d, 'Let’s talk about your building')}</div>`;
  }
  function page(d, divisions, art, arrow) {
    return `<article class="division-experience"><section class="division-cover">${window.TechouseContent?.snapshot().images[d.id] ? `<img src="${window.TechouseContent.imageURL(window.TechouseContent.snapshot().images[d.id])}" alt="${d.alt || d.short}" fetchpriority="high">` : d.image ? `<img src="assets/${d.image}" alt="${d.alt}" fetchpriority="high">` : art}<div class="cover-shade"></div><div class="cover-copy"><a href="#/" class="back-divisions">← All divisions</a><h1>${d.id === 'solar' ? 'Turn sunlight into<br>everyday savings.' : d.id === 'construction' ? 'Build your<br>next chapter.' : d.short + '.'}</h1><p>${d.id === 'solar' ? 'Looking at your electricity bill differently? Explore what solar could mean for your property.' : d.tagline}</p><a class="button" href="${d.id === 'solar' ? '#solar-start' : '#/inquiry?division=' + d.id}" ${d.id === 'solar' ? 'data-scroll="solar-start"' : ''}>${d.id === 'solar' ? window.TechouseIcons.icon('solar_power') : d.id === 'construction' ? window.TechouseIcons.icon('construction') : ''}${d.id === 'solar' ? 'Let’s find your solar savings' : d.id === 'construction' ? 'Let’s start building' : 'Let’s talk'} ${['solar', 'construction'].includes(d.id) ? '' : arrow}</a></div></section>${d.id === 'solar' ? `<nav class="division-subnav" aria-label="Solar sections"><a href="#products" data-scroll="products">Products</a><a href="#projects" data-scroll="projects">Past projects</a><a href="#estimator" data-scroll="estimator">Cost estimator ↗</a></nav><div class="division-wrap">${solar}</div>` : d.id === 'construction' ? constructionContent() : d.id === 'prefabrication' ? prefabricationContent(d) : d.id === 'elevators' ? elevatorContent(d) : `<div class="division-wrap"><section class="division-section basic-division"><div><span>01 / ${d.short.toUpperCase()}</span><h2>${d.tagline}</h2><p>${d.description}</p><a class="text-link" href="#/inquiry?division=${d.id}">Start a conversation ${arrow}</a></div><div><span>LET’S START WITH THE ESSENTIALS</span><ul>${d.prompts.map((p, i) => `<li><small>0${i + 1}</small>${p}</li>`).join('')}</ul></div></section></div>`}${d.id === 'solar' ? '' : '<div class="division-wrap"><section class="project-showcase division-section" id="projects"></section></div>'}<section class="division-next"><h2>What else are you building?</h2><div>${divisions
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
    // ONE QUESTION AT A TIME: when electricity is used, then how much solar should cover. An answered
    // question folds into a one-line summary; the estimate appears once both are answered.
    const QUESTIONS = ['nightShare', 'offset'];
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const answer = (name) => form.querySelector(`[name="${name}"]:checked`);
    const answered = () => QUESTIONS.every(answer);
    const count = form.querySelector('.solar-question-count');
    function ask(name) {
      QUESTIONS.forEach((q, index) => {
        const open = q === name;
        form.querySelector(`[data-question="${q}"]`).hidden = !open;
        form.querySelector(`[data-answer="${q}"]`).hidden = open || !answer(q);
        if (open) count.querySelector('span').textContent = `Question ${index + 1} of 2`;
        count.querySelectorAll('i')[index].classList.toggle('is-on', !!answer(q) || open);
      });
      const question = form.querySelector(`[data-question="${name}"]`);
      question.classList.remove('is-entering');
      if (!reduced()) {
        void question.offsetWidth;
        question.classList.add('is-entering');
      }
    }
    function fold() {
      QUESTIONS.forEach((q, index) => {
        form.querySelector(`[data-question="${q}"]`).hidden = true;
        const summary = form.querySelector(`[data-answer="${q}"]`);
        summary.hidden = false;
        count.querySelectorAll('i')[index].classList.add('is-on');
      });
      count.querySelector('span').textContent = 'Both questions answered';
    }
    function record(name) {
      const choice = answer(name);
      form.querySelector(`[data-answer="${name}"] b`).textContent = choice
        .closest('label')
        .querySelector('strong').textContent;
      const next = QUESTIONS.find((q) => !answer(q));
      if (next) ask(next);
      else {
        fold();
        calculate();
      }
    }
    let pointerAt = 0;
    form.addEventListener('pointerdown', () => (pointerAt = Date.now()));
    form.addEventListener('keydown', (e) => {
      const radio = e.target.closest('input[type="radio"]');
      if (!radio || !QUESTIONS.includes(radio.name) || ![' ', 'Enter'].includes(e.key)) return;
      e.preventDefault();
      radio.checked = true;
      record(radio.name);
      (
        form.querySelector('[data-question]:not([hidden]) input') ||
        [...form.querySelectorAll('[data-answer]:not([hidden]) button')].pop()
      )?.focus();
    });
    form.addEventListener('click', (e) => {
      // Choosing the answer already selected fires no change event; still close the question.
      const radio = e.target.closest('input[type="radio"]');
      if (radio && QUESTIONS.includes(radio.name))
        setTimeout(() => {
          if (!form.querySelector(`[data-question="${radio.name}"]`).hidden && radio.checked)
            record(radio.name);
        });
      const change = e.target.closest('[data-change]');
      if (!change) return;
      ask(change.dataset.change);
      form.querySelector(`[data-question="${change.dataset.change}"] input:checked`)?.focus();
    });
    function reset(message = '') {
      const hadEstimate = !!out.querySelector('.animated-price');
      cancelAnimationFrame(countFrame);
      form.querySelector('.solar-scenarios')?.remove();
      const steps = QUESTIONS.map(
        (q, index) =>
          `<li class="${answer(q) ? 'is-done' : ''}"><span>${answer(q) ? window.TechouseIcons.icon('check') : index + 1}</span>${['When you use electricity', 'How much solar should cover'][index]}</li>`,
      ).join('');
      out.innerHTML = `<div class="estimate-ready"><h3>Your estimate appears here</h3><p>${message || 'Answer two quick questions. We size the system and price it from the Techouse price list.'}</p><ol>${steps}</ol></div>`;
      if (hadEstimate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        out.getAnimations().forEach((animation) => animation.cancel());
        out.animate(
          [
            { opacity: 0.3, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
    }
    // WORKBOOK MODEL: solar-calculator.js sizes each setup from the bill and prices it from the price list.
    // Input changes invalidate results; never treat this browser calculation as a production quote.
    const calculator = window.TechouseSolarCalculator;
    let result = null;
    let recommendedId = null;
    const range = (s) =>
      `${peso(Math.floor(s.priceLow / 1000) * 1000)} – ${peso(Math.ceil(s.priceHigh / 1000) * 1000)}`;
    const payback = (s) =>
      Number.isFinite(s.paybackLow)
        ? `${calculator.formatPayback(s.paybackLow)} – ${calculator.formatPayback(s.paybackHigh)}`
        : 'Not reached';
    // Each setup leads with its name, price and monthly savings; what it includes is optional.
    const scenarioCard = (s, recommended) =>
      `<div class="solar-scenario"><label class="solar-scenario-pick"><input type="radio" name="scenario" value="${s.id}"${s.id === recommended ? ' checked' : ''}><span class="solar-scenario-head"><strong>${s.title}</strong>${s.id === recommended ? '<em>Recommended</em>' : ''}</span><span class="solar-scenario-price">${range(s)}</span><span class="solar-scenario-save">Saves about ${peso(s.savings)} a month</span></label><details class="solar-scenario-more"><summary>What’s included</summary><p class="solar-scenario-summary">${s.summary}</p><p class="solar-scenario-payback"><small>Payback</small>${payback(s)}</p><ul>${s.lines.map((l) => `<li><span>${l.qty} ×</span>${l.label}</li>`).join('')}</ul></details></div>`;
    // Selecting a setup refreshes the headline without recalculating or clearing the comparison.
    function select(id, animate = false) {
      const s = result?.scenarios.find((item) => item.id === id) || result?.scenarios[0];
      const highlight = out.querySelector('.estimate-budget-highlight');
      if (!s || !highlight) return;
      cancelAnimationFrame(countFrame);
      const low = Math.floor(s.priceLow / 1000) * 1000,
        high = Math.ceil(s.priceHigh / 1000) * 1000;
      highlight.querySelector('[data-scenario-title]').textContent = s.title;
      highlight.querySelector('[data-scenario-reason]').textContent =
        (s.id === recommendedId ? 'Matches how you use electricity. ' : '') + s.summary;
      const heading = highlight.querySelector('h3');
      heading.setAttribute('aria-label', `${peso(low)} to ${peso(high)}`);
      heading.innerHTML = `<span aria-hidden="true" data-price-low>${peso(low)}</span> <span aria-hidden="true" data-price-high>– ${peso(high)}</span>`;
      const values = highlight.querySelectorAll('.estimate-economics dd');
      values[0].textContent = peso(s.savings);
      // Each bound stays on one line so a wrap falls at the dash.
      values[1].innerHTML = payback(s)
        .split(' – ')
        .map((part) => `<span class="nowrap">${part}</span>`)
        .join(' – ');
      values[2].innerHTML = `${s.kwp.toFixed(2)} kWp${s.batteryKwh ? `<small> + ${+s.batteryKwh.toFixed(2)} kWh storage</small>` : ''}`;
      const metrics = out.querySelectorAll('.estimate-metrics strong');
      metrics[0].textContent = `${s.kwp.toFixed(2)} kWp`;
      metrics[1].textContent = `~${Math.ceil(s.panels * 2.7)} m²`;
      metrics[2].textContent = `~${Math.round(s.generation)} kWh`;
      // Fit the final range, not the changing count-up digits, to avoid size jitter.
      const context = document.createElement('canvas').getContext('2d');
      const typography = getComputedStyle(heading);
      context.font = `${typography.fontWeight} 100px ${typography.fontFamily}`;
      const measured = context.measureText(`${peso(low)} – ${peso(high)}`).width;
      if (measured) heading.style.fontSize = `clamp(16px, ${9600 / measured}cqw, 46px)`;
      out.querySelector('.energy-equivalents')?.remove();
      window.TechouseSolarExtras?.updateEnergy(form, s.generation);
      if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const start = performance.now(),
        lower = heading.querySelector('[data-price-low]'),
        upper = heading.querySelector('[data-price-high]');
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
    function calculate() {
      cancelAnimationFrame(countFrame);
      if (!answered()) return reset();
      const bill = form.elements.bill;
      bill.toggleAttribute('aria-invalid', !bill.validity.valid);
      if (!bill.validity.valid)
        return reset('Enter a monthly bill from ₱500 to ₱5,000,000 to see your estimate.');
      if (!form.elements.rate.validity.valid) {
        form.querySelector('.solar-fine-tune').open = true;
        return reset('Enter an electricity rate from ₱1 to ₱100 per kWh to see your estimate.');
      }
      // The first estimate counts up and enters; later updates from a changed answer swap in place.
      const first = !out.querySelector('.animated-price');
      form.querySelector('.solar-scenarios')?.remove();
      result = calculator.calculate(Object.fromEntries(new FormData(form)));
      if (!result.scenarios.length) return;
      const recommended =
        window.TechouseSolar?.recommendedScenario(result.segment, result.nightShare) || 'day';
      recommendedId = recommended;
      const tierNote =
        result.segment === 'commercial'
          ? 'Commercial and industrial pricing with 380 V grid-tied inverters.'
          : 'Techouse equipment pricing.';
      // PRICE FIRST: the budget and the next step lead; everything that explains them is optional.
      out.innerHTML = `<div class="estimate-budget-highlight"><p class="estimate-setup"><span>Indicative budget</span><b data-scenario-title></b></p><h3 class="animated-price"></h3><a class="button" href="#/inquiry?division=solar&estimate=1" id="solar-estimate-inquiry">Like this starting point? Let’s talk ↗</a><details class="estimate-more"><summary>See savings, payback and system size</summary><p class="estimate-reason" data-scenario-reason></p><dl class="estimate-economics estimate-stats"><div><dt>Monthly savings</dt><dd></dd></div><div><dt>Payback</dt><dd></dd></div><div><dt>System size</dt><dd></dd></div></dl><div class="estimate-metrics"><p><strong></strong>Solar capacity</p><p><strong></strong>Indicative panel area</p><p><strong></strong>Generation / month</p></div><p class="estimate-economics-note">${tierNote} Includes panels, inverter, batteries where shown, mounting and installation. Final pricing follows a site review.</p></details></div>`;
      // Full-width comparison row below inputs and headline; outside the live region to keep announcements short.
      const scenarios = document.createElement('fieldset');
      scenarios.className = 'solar-scenarios';
      scenarios.dataset.count = result.scenarios.length;
      scenarios.innerHTML = `<legend><span>Compare setups</span>Select one to update your budget and discuss it with our team<small class="solar-swipe-hint">Swipe to see all ${result.scenarios.length} setups.</small></legend><div>${result.scenarios.map((s) => scenarioCard(s, recommended)).join('')}</div>`;
      out.after(scenarios);
      select(recommended, first);
      // Phone swipe row: start on the recommended card rather than the first one.
      const row = scenarios.querySelector(':scope > div');
      const pick = row.querySelector('input:checked')?.closest('.solar-scenario');
      if (pick && row.scrollWidth > row.clientWidth)
        row.scrollLeft += pick.getBoundingClientRect().left - row.getBoundingClientRect().left - 16;
      if (first && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        out.animate(
          [
            { opacity: 0.35, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
        scenarios.querySelectorAll('.solar-scenario').forEach((card, i) =>
          card.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 360, delay: 100 + i * 70, fill: 'backwards', easing: 'ease-out' },
          ),
        );
      }
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });
    // Typed values (bill, rate) recalculate after a short pause; answers and the panel type at once.
    // A change event on the form itself comes from step 1 (property type).
    let typing;
    form.addEventListener('input', (e) => {
      if (!['bill', 'rate'].includes(e.target.name) || !answered()) return;
      clearTimeout(typing);
      typing = setTimeout(calculate, 450);
    });
    form.addEventListener('change', (e) => {
      const name = e.target.name;
      if (name === 'scenario') select(e.target.value);
      else if (QUESTIONS.includes(name)) {
        // Arrow keys move the selection; Enter or Space confirms it.
        if (Date.now() - pointerAt < 1000) record(name);
      } else if (answered()) {
        clearTimeout(typing);
        calculate();
      }
    });
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
