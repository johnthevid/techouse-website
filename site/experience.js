/**
 * Presentation enhancement layer: intro, About reveals, guided questions, SVG scenes, and lesson navigation.
 * mount() runs after every route render. Clean up earlier timers/observers before mounting again.
 */
/* Presentation interactions: native controls, original SVG artwork, reduced-motion support. */
window.TechouseExperience = (() => {
  let observer,
    companyObserver,
    cleanupIntro = () => {};
  const timers = new Set();
  // Keep this across route renders; a full website reload starts a new visit.
  let companySeen = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function type(el) {
    if (!el || reduced()) return;
    const text = el.textContent;
    el.classList.add('typed-copy');
    el.setAttribute('aria-label', text);
    const reserve = document.createElement('span');
    reserve.className = 'typing-reserve';
    reserve.setAttribute('aria-hidden', 'true');
    reserve.textContent = text;
    const ink = document.createElement('span');
    ink.className = 'typing-ink';
    ink.setAttribute('aria-hidden', 'true');
    el.replaceChildren(reserve, ink);
    observer.observe(el);
    el._startTyping = () =>
      new Promise((resolve) => {
        let i = 0;
        function tick() {
          if (!el.isConnected) {
            resolve();
            return;
          }
          ink.textContent = text.slice(0, ++i);
          if (i < text.length) {
            const t = setTimeout(() => {
              timers.delete(t);
              tick();
            }, 24);
            timers.add(t);
          } else {
            el.classList.add('typing-done');
            resolve();
          }
        }
        tick();
      });
  }
  function scene(kind, value) {
    // Original line-art illustrations keep the solar guide light and familiar.
    const sun =
      '<g class="scene-sun"><circle cx="260" cy="64" r="25" fill="#e2b565"/><g stroke="#e2b565" stroke-width="2"><path d="M260 26v-9m0 94v-9m38-38h10m-96 0h10m65-27 8-8m-61 62-8 8m61-8 8 8m-61-62-8-8"/></g></g>';
    const moon =
      '<g class="scene-moon"><path d="M270 36a30 30 0 1 0 27 43 27 27 0 0 1-27-43" fill="#a9bfd4"/></g>';
    let art = '';
    if (kind === 'sector')
      art =
        value === 'Residential'
          ? '<path d="m65 140 95-75 95 75M84 125v100h153V125M148 225v-61h36v61"/><path class="solar-panel-lines" d="m110 110 43-30 45 30-43 30Z m22-15 45 30m-1-30-43 30"/>'
          : value === 'Commercial'
            ? '<rect x="94" y="62" width="140" height="163" rx="3"/><path d="M113 90h25m24 0h25m-74 30h25m24 0h25m-74 30h25m24 0h25m-74 30h25m24 0h25m-34 45v-25h30v25"/>'
            : '<path d="M50 225V119l68-38v38l68-38v38h80v106ZM220 119V55h24v64M72 160h28m25 0h28m25 0h28m25 0h15M72 192h28m25 0h28m25 0h28m25 0h15"/>';
    else if (kind === 'usage')
      art =
        (value === 'Mostly daytime'
          ? sun
          : value === 'Mostly evenings'
            ? moon
            : sun + '<g transform="translate(-140 0)">' + moon + '</g>') +
        '<path d="M45 218h230M65 218v-65l60-45 60 45v65m-90 0v-48h36v48"/><path class="energy-path" d="M260 115v45h-58"/>';
    else
      art =
        value === 'Lower electricity costs'
          ? '<rect x="91" y="48" width="140" height="182" rx="8"/><path d="M118 82h84m-84 25h65M116 164l28 20 25-12 35 31m-20 0h20v-20"/><text x="120" y="153" stroke="none" fill="currentColor" font-size="30">₱</text>'
          : value === 'Energy after sunset'
            ? moon +
              '<rect x="80" y="132" width="152" height="80" rx="10"/><path d="M232 157h12v28h-12"/><g class="battery-charge" fill="#d5b577" stroke="none"><rect x="95" y="148" width="30" height="48"/><rect x="135" y="148" width="30" height="48"/><rect x="175" y="148" width="30" height="48"/></g>'
            : '<path d="m62 110 93-61 93 61M79 100v111h153V100"/><rect x="46" y="140" width="48" height="78" rx="7" fill="#edf1e6"/><path d="M62 134h16v6M58 158h23m-23 13h23"/><path class="energy-path" d="M94 180h35v-49h26m0 0v49h46" stroke="#bd9452"/><g class="essential-light"><path d="M142 113a14 14 0 1 1 25 0l-5 8h-14Z" fill="#e4c174"/><path d="M149 127h13m-12 5h11"/></g><rect x="181" y="158" width="29" height="47" rx="3"/><path d="M181 179h29m-6-13v6m0 16v6M113 207h35m-17 0v-8m-12-7a12 12 0 0 1 24 0m-19-1a7 7 0 0 1 14 0"/><circle cx="131" cy="194" r="1"/>';
    return `<svg viewBox="0 0 320 270" role="img" aria-label="${value}" class="motion-scene"><path d="M30 240h260" stroke="#b9c8ba" fill="none"/><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
  }
  // ABOUT: a brief, centered reveal with no sequential reading delays or alignment morphs.
  function companyEntrance() {
    const company = document.querySelector('#company');
    if (!company || companySeen || reduced()) return;
    const items = [...company.querySelectorAll('h2,p,a.button')];
    items.forEach((element) => {
      element.style.opacity = '0';
    });
    companyObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        companyObserver.disconnect();
        companySeen = true;
        items.forEach((element, index) => {
          element.style.opacity = '';
          element.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 420,
              delay: index * 60,
              easing: 'cubic-bezier(.22,.7,.2,1)',
              fill: 'backwards',
            },
          );
        });
      },
      { threshold: 0.15 },
    );
    companyObserver.observe(company);
  }
  // INTRO: once per page load; cleanupIntro must always release scroll locks and inert controls.
  function landingEntrance() {
    const kicker = document.querySelector('.landing-kicker');
    if (!kicker) return;
    const footerLogo = document.querySelector('#footer .brand-logo')?.closest('a');
    if (footerLogo) {
      footerLogo.href = '#company';
      footerLogo.setAttribute('aria-label', 'Center About Techouse');
      footerLogo.onclick = (event) => {
        event.preventDefault();
        const company = document.querySelector('#company');
        company.scrollIntoView({
          behavior: reduced() ? 'instant' : 'smooth',
          block: company.offsetHeight > innerHeight ? 'start' : 'center',
        });
        const title = company.querySelector('h2');
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      };
    }
    const landing = document.querySelector('.division-landing');
    const intro = document.querySelector('.landing-intro');
    intro.dataset.emphasis = 'question';
    if (window.techouseIntroStarted || reduced()) return;
    window.techouseIntroStarted = true;
    const overlay = document.createElement('div');
    overlay.className = 'brand-intro';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Welcome to Techouse');
    overlay.dataset.phase = 'mark';
    overlay.innerHTML = `<div class="brand-intro-center"><div class="brand-intro-lockup" aria-hidden="true"><img class="brand-intro-symbol" src="assets/techouse-logo-horizontal.png" alt=""><img class="brand-intro-wordmark" src="assets/techouse-logo-horizontal.png" alt=""></div><p class="brand-intro-message"></p></div><button class="skip-intro" type="button">Skip intro ↗</button>`;
    overlay.querySelector('.brand-intro-message').textContent = kicker.textContent;
    document.body.append(overlay);
    const symbol = overlay.querySelector('.brand-intro-symbol');
    const wordmark = overlay.querySelector('.brand-intro-wordmark');
    const message = overlay.querySelector('.brand-intro-message');
    const skip = overlay.querySelector('button');
    const blocked = ['#header', '#main', '#footer']
      .map((sel) => document.querySelector(sel))
      .filter(Boolean);
    const pageCopy = [intro, ...landing.querySelectorAll('.banner-content')];
    const actionGroup = document.querySelector('#header .banner-nav-right');
    const originalActionOpacity = actionGroup?.style.opacity;
    if (actionGroup) actionGroup.style.opacity = '0';
    const originalOpacity = pageCopy.map((el) => el.style.opacity);
    pageCopy.forEach((el) => {
      el.style.opacity = '0';
    });
    const originalInert = blocked.map((el) => el.inert);
    blocked.forEach((el) => {
      el.inert = true;
    });
    landing.classList.add('intro-playing');
    document.documentElement.classList.add('intro-scroll-locked');
    document.body.classList.add('intro-scroll-locked');
    const animations = new Set();
    let done = false;
    let exiting = false;
    let safety;
    const animate = async (element, frames, duration, delay = 0) => {
      const animation = element.animate(frames, {
        duration,
        delay,
        easing: 'cubic-bezier(.22,.7,.2,1)',
        fill: 'forwards',
      });
      animations.add(animation);
      await animation.finished.catch(() => {});
    };
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(safety);
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      overlay.remove();
      if (actionGroup) {
        actionGroup.classList.remove('intro-actions-revealing');
        actionGroup.style.opacity = originalActionOpacity;
      }
      landing.classList.remove('intro-playing');
      landing.dataset.revealPhase = 'complete';
      pageCopy.forEach((el, index) => {
        el.style.opacity = originalOpacity[index];
      });
      document.documentElement.classList.remove('intro-scroll-locked');
      document.body.classList.remove('intro-scroll-locked');
      blocked.forEach((el, index) => {
        el.inert = originalInert[index];
      });
      landing.dispatchEvent(new Event('intro-ready'));
    };
    const exit = async (skipRequested = false) => {
      if (done || exiting) return;
      exiting = true;
      overlay.dataset.phase = 'reveal';
      skip.disabled = true;
      if (skipRequested) {
        await animate(overlay, [{ opacity: 1 }, { opacity: 0 }], 180);
        if (!done) finish();
      } else {
        await animate(
          overlay.querySelector('.brand-intro-center'),
          [{ opacity: 1 }, { opacity: 0 }],
          180,
        );
        if (done) return;
        await animate(
          overlay,
          [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
          950,
        );
        if (done) return;
        landing.classList.remove('intro-playing');
        landing.dataset.revealPhase = 'headline';
        if (actionGroup) {
          actionGroup.classList.add('intro-actions-revealing');
          animate(actionGroup, [{ opacity: 0 }, { opacity: 1 }], 650);
        }
        await animate(
          intro,
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          600,
        );
        if (done) return;
        landing.dataset.revealPhase = 'divisions';
        await Promise.all(
          pageCopy.slice(1).map((element, index) =>
            animate(
              element,
              [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              550,
              index * 85,
            ),
          ),
        );
        if (!done) finish();
      }
      document.querySelector('#main')?.focus({ preventScroll: true });
    };
    skip.addEventListener('click', () => exit(true));
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') exit(true);
      if (event.key === 'Tab') {
        event.preventDefault();
        skip.focus();
      }
    });
    skip.focus({ preventScroll: true });
    safety = setTimeout(finish, 10000);
    cleanupIntro = finish;
    async function play() {
      // Decoding is bounded: a failed or slow logo must never trap the visitor.
      await Promise.race([
        Promise.all([symbol.decode(), wordmark.decode()]).catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      if (done || exiting) return;
      await animate(
        symbol,
        [
          { transform: 'translateX(33%) scale(1.8)', opacity: 0 },
          { transform: 'translateX(33%) scale(1)', opacity: 1 },
        ],
        700,
      );
      if (done || exiting) return;
      overlay.dataset.phase = 'wordmark';
      await Promise.all([
        animate(
          symbol,
          [{ transform: 'translateX(33%) scale(1)' }, { transform: 'translateX(0) scale(1)' }],
          650,
        ),
        animate(
          wordmark,
          [
            { opacity: 0, transform: 'translateX(18px)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          550,
          150,
        ),
      ]);
      if (done || exiting) return;
      overlay.dataset.phase = 'message';
      await animate(
        message,
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        450,
      );
      if (done || exiting) return;
      await animate(message, [{ opacity: 1 }, { opacity: 1 }], 1750);
      if (!done && !exiting) await exit();
    }
    play().catch(finish);
  }

  // Called after route markup exists. Add new page enhancements after cleaning up the previous route.
  function mount() {
    cleanupIntro();
    cleanupIntro = () => {};
    observer?.disconnect();
    companyObserver?.disconnect();
    timers.forEach(clearTimeout);
    timers.clear();
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            observer.unobserve(e.target);
            e.target._startTyping?.();
            e.target.classList.add('has-entered');
          }
        }),
      { threshold: 0.55 },
    );
    landingEntrance();
    const estimateHeading = document.querySelector('#estimator .section-heading');
    if (estimateHeading && !reduced()) {
      estimateHeading.classList.add('reveal-once');
      observer.observe(estimateHeading);
    }
    if (!document.querySelector('.solar-streamlined'))
      type(document.querySelector('#solar-start .section-heading p'));
    companyEntrance();
    const form = document.querySelector('#solar-discovery');
    if (!form) return;
    const input = form.elements.location;
    input.setAttribute('list', 'ph-location-options');
    input.setAttribute('autocomplete', 'address-level2');
    input.setAttribute('aria-describedby', 'location-suggestions-note');
    const list = document.createElement('datalist');
    list.id = 'ph-location-options';
    // [suggestion, latitude, longitude]: approximate city centres, the "Use my location" fallback.
    const cities = [
      ['Manila · Metro Manila', 14.5995, 120.9842],
      ['Quezon City · Metro Manila', 14.676, 121.0437],
      ['Makati · Metro Manila', 14.5547, 121.0244],
      ['Taguig · Metro Manila', 14.5176, 121.0509],
      ['Pasig · Metro Manila', 14.5764, 121.0851],
      ['Mandaluyong · Metro Manila', 14.5794, 121.0359],
      ['Pasay · Metro Manila', 14.5378, 121.0014],
      ['Parañaque · Metro Manila', 14.4793, 121.0198],
      ['Las Piñas · Metro Manila', 14.4445, 120.9939],
      ['Muntinlupa · Metro Manila', 14.4081, 121.0415],
      ['Marikina · Metro Manila', 14.6507, 121.1029],
      ['San Juan · Metro Manila', 14.6019, 121.0355],
      ['Caloocan · Metro Manila', 14.6507, 120.9668],
      ['Malabon · Metro Manila', 14.6681, 120.9658],
      ['Navotas · Metro Manila', 14.6667, 120.9417],
      ['Valenzuela · Metro Manila', 14.7011, 120.983],
      ['Pateros · Metro Manila', 14.5454, 121.0687],
      ['Antipolo · Rizal', 14.586, 121.1761],
      ['Cainta · Rizal', 14.5786, 121.1222],
      ['Taytay · Rizal', 14.5574, 121.1324],
      ['Bacoor · Cavite', 14.459, 120.9459],
      ['Imus · Cavite', 14.4297, 120.9367],
      ['Dasmariñas · Cavite', 14.3294, 120.9367],
      ['General Trias · Cavite', 14.3869, 120.8817],
      ['Tagaytay · Cavite', 14.1153, 120.9621],
      ['Santa Rosa · Laguna', 14.3122, 121.1114],
      ['Biñan · Laguna', 14.3333, 121.0833],
      ['Calamba · Laguna', 14.2117, 121.1653],
      ['San Pedro · Laguna', 14.3595, 121.0473],
      ['Batangas City · Batangas', 13.7565, 121.0583],
      ['Lipa · Batangas', 13.9411, 121.1631],
      ['Malolos · Bulacan', 14.8527, 120.816],
      ['Meycauayan · Bulacan', 14.7344, 120.9572],
      ['San Jose del Monte · Bulacan', 14.8139, 121.0453],
      ['Angeles · Pampanga', 15.145, 120.5887],
      ['San Fernando · Pampanga', 15.0286, 120.6898],
      ['Tarlac City · Tarlac', 15.4802, 120.5979],
      ['Baguio · Benguet', 16.4023, 120.596],
      ['Dagupan · Pangasinan', 16.0433, 120.3333],
      ['Laoag · Ilocos Norte', 18.196, 120.5927],
      ['Legazpi · Albay', 13.1391, 123.7438],
      ['Naga · Camarines Sur', 13.6218, 123.1948],
      ['Puerto Princesa · Palawan', 9.7392, 118.7353],
      ['Cebu City · Cebu', 10.3157, 123.8854],
      ['Mandaue · Cebu', 10.3236, 123.9223],
      ['Lapu-Lapu · Cebu', 10.3103, 123.9494],
      ['Iloilo City · Iloilo', 10.7202, 122.5621],
      ['Bacolod · Negros Occidental', 10.6765, 122.9509],
      ['Dumaguete · Negros Oriental', 9.3068, 123.3054],
      ['Tacloban · Leyte', 11.2444, 125.0039],
      ['Tagbilaran · Bohol', 9.65, 123.85],
      ['Davao City · Davao Region', 7.1907, 125.4553],
      ['Cagayan de Oro · Misamis Oriental', 8.4542, 124.6319],
      ['General Santos · South Cotabato', 6.1164, 125.1716],
      ['Zamboanga City · Zamboanga Peninsula', 6.9214, 122.079],
      ['Butuan · Agusan del Norte', 8.9475, 125.5406],
    ];
    cities.forEach(([city]) => {
      const option = document.createElement('option');
      option.value = city;
      list.append(option);
    });
    input.after(list);
    const hint = document.createElement('small');
    hint.id = 'location-suggestions-note';
    hint.setAttribute('aria-live', 'polite');
    const defaultHint =
      'Choose a suggested city or municipality, or enter your location if it is not listed.';
    hint.textContent = defaultHint;
    input.closest('label').append(hint);
    // USE MY LOCATION: the browser's position is matched on this device against about 4,400
    // Philippine places (assets/data/ph-places.json, GeoNames) to name the municipality and province.
    // The coordinates are never stored or sent anywhere; the visitor can edit the result.
    if (navigator.geolocation && window.isSecureContext) {
      const locate = document.createElement('button');
      locate.type = 'button';
      locate.className = 'solar-locate';
      locate.innerHTML = `${window.TechouseIcons.icon('my_location')}<span>Use my location</span>`;
      const row = document.createElement('span');
      row.className = 'solar-location-row';
      input.before(row);
      row.append(input, locate);
      const distance = (lat, lon, a, b) => {
        const rad = Math.PI / 180;
        const h =
          Math.sin(((a - lat) * rad) / 2) ** 2 +
          Math.cos(lat * rad) * Math.cos(a * rad) * Math.sin(((b - lon) * rad) / 2) ** 2;
        return 12742 * Math.asin(Math.sqrt(h));
      };
      let places;
      const loadPlaces = () =>
        (places ||= fetch('assets/data/ph-places.json')
          .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
          .catch(() => (places = null)));
      async function nearestPlace(lat, lon) {
        const data = await loadPlaces();
        if (data) {
          const { points, municipalities } = data;
          let best = { km: Infinity };
          for (let i = 0; i < points.length; i += 3) {
            const km = distance(lat, lon, points[i] / 1000, points[i + 1] / 1000);
            if (km < best.km) best = { km, index: points[i + 2] };
          }
          const [town, province] = municipalities[best.index] || [];
          return { km: best.km, name: province ? `${town} · ${province}` : town, short: town, limit: 25 };
        }
        // Fallback when the place list cannot load: the nearest suggested city.
        const [name, a, b] = cities.reduce((closest, city) =>
          distance(lat, lon, city[1], city[2]) < distance(lat, lon, closest[1], closest[2]) ? city : closest,
        );
        return { km: distance(lat, lon, a, b), name, short: name.split(' · ')[0], limit: 50 };
      }
      locate.addEventListener('click', () => {
        locate.disabled = true;
        locate.querySelector('span').textContent = 'Finding your location…';
        loadPlaces();
        const done = (message) => {
          locate.disabled = false;
          locate.querySelector('span').textContent = 'Use my location';
          hint.textContent = message;
        };
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const match = await nearestPlace(coords.latitude, coords.longitude);
            if (!match.name || match.km > match.limit) {
              done('Your location does not look like it is in the Philippines. Type your city or municipality.');
              return;
            }
            input.value = match.name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            done(`Filled from your location: ${match.short}. Edit it if your property is elsewhere. Place names from GeoNames.`);
          },
          (error) =>
            done(
              error.code === error.PERMISSION_DENIED
                ? 'Location access was not allowed. Type your city or municipality instead.'
                : 'We could not get your location. Type your city or municipality instead.',
            ),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
        );
      });
      input.addEventListener('input', (e) => {
        if (e.isTrusted) hint.textContent = defaultHint;
      });
    }
    const steps = [...form.querySelectorAll('fieldset')];
    let step = 0;
    const layout = document.createElement('div');
    layout.className = 'discovery-stage';
    form.before(layout);
    layout.append(form);
    const visual = document.createElement('aside');
    visual.className = 'discovery-visual';
    visual.setAttribute('aria-label', 'Your solar choices illustrated');
    layout.append(visual);
    const progress = document.createElement('div');
    progress.className = 'discovery-progress';
    form.prepend(progress);
    const controls = document.createElement('div');
    controls.className = 'discovery-controls';
    controls.innerHTML =
      '<button type="button" class="text-link" data-back>← Back</button><span class="discovery-count" aria-live="polite"></span><button type="button" class="button" data-next>Continue →</button>';
    form.append(controls);
    const extras = [form.querySelector('.solar-location'), form.querySelector('[data-solar-next]')];
    function draw() {
      const sector = new FormData(form).get('sector') || 'Residential';
      const photos = {
        Residential: [
          'assets/solar-story/home-selected.jpg',
          'A bright home interior with a sofa, houseplant and resting dog',
          'Make room for a brighter everyday.',
          'Explore solar for the place you call home.',
        ],
        Commercial: [
          'assets/solar-story/store-selected.jpg',
          'A bright supermarket aisle with stocked shelves',
          'Put your roof to work for your business.',
          'Explore solar for the spaces that keep your business moving.',
        ],
        Industrial: [
          'assets/solar-story/factory-selected.jpg',
          'Engineers working together inside a bright manufacturing facility',
          'Think bigger. Start with your roof.',
          'Explore solar for your facility’s energy needs.',
        ],
      };
      const [image, alt, title, description] =
        photos[sector] || photos.Residential;
      visual.classList.add('discovery-photo-visual');
      visual.dataset.story = sector;
      visual.innerHTML = `<img class="discovery-story-photo" src="${image}" alt="${alt}"><div class="discovery-photo-shade"></div><div class="discovery-photo-copy"><h3>${title}</h3><p>${description}</p><small>Photo · Unsplash · illustrative</small></div>`;
    }
    const estimator = document.querySelector('#estimator');
    const planning = document.createElement('div');
    planning.className = 'solar-planning-pages';
    layout.before(planning);
    planning.append(progress, layout, estimator);
    progress.setAttribute('aria-label', 'Solar planning steps');
    const heading = document.querySelector('#solar-start > .section-heading');
    const originalTitle = heading.querySelector('h2').innerHTML;
    const originalDescription = heading.querySelector('p').textContent;
    const costHeading = estimator.querySelector('.section-heading');
    const costTitle = costHeading.querySelector('h2').textContent;
    const costDescription = costHeading.querySelector('p').textContent;
    costHeading.remove();
    function show(focus = false) {
      heading.querySelector('h2').innerHTML = step === 1 ? costTitle : originalTitle;
      heading.querySelector('p').textContent = step === 1 ? costDescription : originalDescription;
      planning.dataset.step = String(step + 1);
      layout.hidden = step === 1;
      estimator.hidden = step !== 1;
      // Step 1 holds the property type and its location; step 2 is the estimate itself.
      steps.forEach((section) => (section.hidden = step !== 0));
      extras.forEach((element) => (element.hidden = step !== 0));
      form.querySelector('[data-solar-next]').hidden = true;
      progress.innerHTML = ['Your property', 'Your estimate']
        .map(
          (label, index) =>
            `<button type="button" data-step="${index}" class="${index < step ? 'is-complete' : ''}" aria-current="${index === step ? 'step' : 'false'}" aria-label="Step ${index + 1} of 2: ${label}${index < step ? ', completed' : index === step ? ', current' : ''}"><span class="step-marker" aria-hidden="true">${index < step ? window.TechouseIcons.icon('check') : index + 1}</span><span class="step-label">${label}</span></button>`,
        )
        .join('');
      controls.querySelector('[data-back]').hidden = step === 0;
      controls.querySelector('[data-next]').textContent =
        'See my estimate →';
      controls.querySelector('.discovery-count').textContent = `${step + 1} / 2`;
      draw();
      // Cancel an interrupted reveal before starting the next; no delayed state changes.
      for (const target of [layout, estimator])
        target.getAnimations().forEach((animation) => animation.cancel());
      if (focus && !reduced()) {
        (step === 1 ? estimator : layout).animate(
          [
            { opacity: 0.3, filter: 'blur(5px)' },
            { opacity: 1, filter: 'blur(0px)' },
          ],
          { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
      if (focus) {
        const target =
          step === 1 ? heading.querySelector('h2') : steps[0].querySelector('legend');
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    }
    controls.querySelector('[data-next]').onclick = () => {
      step = Math.min(1, step + 1);
      show(true);
    };
    controls.querySelector('[data-back]').onclick = () => {
      step = 0;
      show(true);
    };
    progress.onclick = (event) => {
      const button = event.target.closest('[data-step]');
      if (button) {
        step = Number(button.dataset.step);
        show(true);
      }
    };
    document
      .querySelectorAll('[data-scroll="estimator"], [data-scroll="solar-start"]')
      .forEach((link) => {
        link.addEventListener(
          'click',
          () => {
            step = link.dataset.scroll === 'estimator' ? 1 : 0;
            show();
          },
          { capture: true },
        );
      });
    form.addEventListener('change', draw);
    show();
    const learning = document.querySelector('.solar-learning');
    const grid = learning.querySelector('.solar-story-grid');
    const cards = [...grid.children];
    let slide = 0;
    const illustration = document.createElement('div');
    illustration.className = 'learning-visual';
    grid.prepend(illustration);
    const card = document.createElement('div');
    card.className = 'solar-lesson-card';
    grid.before(card);
    card.append(grid);
    const pager = document.createElement('div');
    pager.className = 'learning-controls';
    pager.innerHTML =
      '<button type="button" class="text-link" data-prev>← Previous</button><span aria-live="polite"></span><button type="button" class="button" data-forward>Next →</button>';
    card.append(pager);
    const titles = [
      'Use solar during the day',
      'Store energy for later',
      'Understand shade on your roof',
    ];
    cards.forEach((c, i) => (c.querySelector('h3').textContent = titles[i]));
    function page(focus = false) {
      cards.forEach((c, i) => (c.hidden = i !== slide));
      const lessons = [
        ['assets/solar-story/lesson-daytime.jpg', 'A home fitted with rooftop solar panels'],
        [
          'assets/solar-story/lesson-equipment.jpg',
          'Electrical enclosures and wiring mounted on a building',
        ],
        ['assets/solar-story/lesson-roof.jpg', 'A worker preparing a residential roof'],
      ];
      illustration.dataset.lesson = String(slide);
      illustration.innerHTML = `<img src="${lessons[slide][0]}" alt="${lessons[slide][1]}" loading="lazy"><small>Photo · Unsplash</small>`;
      pager.querySelector('span').textContent = `${slide + 1} / ${cards.length}`;
      pager.querySelector('[data-prev]').disabled = slide === 0;
      pager.querySelector('[data-forward]').textContent =
        slide === 2 ? 'View equipment →' : 'Next →';
      if (focus) {
        cards[slide].tabIndex = -1;
        cards[slide].focus({ preventScroll: true });
      }
    }
    pager.querySelector('[data-prev]').onclick = () => {
      slide = Math.max(0, slide - 1);
      page(true);
    };
    pager.querySelector('[data-forward]').onclick = () => {
      if (slide < 2) {
        slide++;
        page(true);
      } else {
        document.querySelector('.division-subnav [data-scroll="solar-technical"]')?.click();
      }
    };
    page();
  }
  return {
    mount,
    setCompanyPreview: (animate) => {
      companySeen = !animate;
    },
  };
})();
