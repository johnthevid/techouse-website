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
  // ABOUT SEQUENCE: short paragraph fades, pending dots, and staggered division-card entrances.
  async function companyEntrance() {
    await document.fonts.ready;
    const company = document.querySelector('#company');
    if (!company || companySeen || reduced()) return;
    const intro = company.querySelector('.company-intro');
    const heading = intro.querySelector('h2');
    const planning = company.querySelector('.company-divisions');
    const originalLines = heading.innerHTML.split(/<br\s*\/?>/i);
    const lines = originalLines.length === 2 ? originalLines.map(html => {
      const span = document.createElement('span');
      span.innerHTML = html;
      span.style.display = 'block';
      return span;
    }) : [heading];
    if (lines[0] !== heading) heading.replaceChildren(...lines);
    const body = [...intro.querySelectorAll('p, a.button')];
    const eyebrow = intro.querySelector('.eyebrow');
    const cards = [...planning.querySelectorAll('h3, a')];
    [...lines, ...body, eyebrow, planning].forEach(el => el.style.opacity = '0');
    planning.inert = true;
    const wide = matchMedia('(min-width: 901px)').matches;
    const companyBounds = company.getBoundingClientRect();
    const introBounds = intro.getBoundingClientRect();
    const offset = wide ? companyBounds.left + (companyBounds.width - introBounds.width) / 2 - introBounds.left : 0;
    intro.style.transform = `translateX(${offset}px)`;
    // Animate actual line positions: text-align itself cannot interpolate.
    const alignmentRuns = [];
    const originals = [];
    function centeredRun(container, text) {
      const row = document.createElement('span'); row.style.display = 'block';
      const ink = document.createElement('span'); ink.textContent = text;
      ink.style.display = 'inline-block'; row.append(ink); container.append(row);
      // Paragraphs have a narrower max-width than the heading column.
      // Center every line on the same intro axis, not each paragraph's box.
      const inset = container.getBoundingClientRect().left - intro.getBoundingClientRect().left;
      const shift = (intro.clientWidth-ink.getBoundingClientRect().width)/2 - inset;
      ink.style.transform = `translateX(${shift}px)`;
      alignmentRuns.push({ink,shift});
    }
    if (wide) {
      for (const element of [...lines, ...intro.querySelectorAll('p')]) {
        originals.push({element,html:element.innerHTML});
        const text = element.textContent;
        const style = getComputedStyle(element);
        const context = document.createElement('canvas').getContext('2d');
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const max = element.clientWidth;
        const rows = []; let row = '';
        for (const word of text.split(/\s+/)) {
          const candidate = row ? row+' '+word : word;
          if(row && context.measureText(candidate).width > max-8) {rows.push(row);row=word;} else row=candidate;
        }
        if(row)rows.push(row);
        element.replaceChildren(); rows.forEach(value=>centeredRun(element,value));
      }
      // The label/button keep their own layout so their entrance motion stays independent.
      intro.style.textAlign = 'center';
      heading.style.textAlign='left';
      intro.querySelectorAll('p').forEach(el=>el.style.textAlign='left');
    }

    async function reveal(element, duration = 550) {
      if (!company.isConnected) return;
      element.style.opacity = '1';
      await element.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration,easing:'cubic-bezier(.2,.7,.2,1)'}).finished.catch(()=>{});
    }
    async function play() {
      await reveal(lines[0]);
      if (lines[1]) await reveal(lines[1]);
      await new Promise(resolve => { const timer=setTimeout(()=>{timers.delete(timer);resolve();},500);timers.add(timer); });
      if (!company.isConnected) return;
      reveal(eyebrow,350);
      for (const paragraph of body) await reveal(paragraph,450);
      if (!company.isConnected) return;
      const alignmentAnimations = alignmentRuns.map(({ink,shift}) => ink.animate([{transform:`translateX(${shift}px)`},{transform:'translateX(0)'}],{duration:900,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'}));
      if(wide) {
        const button = intro.querySelector('a.button');
        const before = button.getBoundingClientRect().left;
        intro.style.textAlign = 'left';
        const shift = before-button.getBoundingClientRect().left;
        alignmentAnimations.push(button.animate([{transform:`translateX(${shift}px)`},{transform:'translateX(0)'}],{duration:900,easing:'cubic-bezier(.22,.7,.2,1)'}));
      }
      await intro.animate([{transform:`translateX(${offset}px)`},{transform:'translateX(0)'}],{duration:900,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'}).finished.catch(()=>{});
      intro.style.transform = '';
      originals.forEach(({element,html})=>{element.innerHTML=html;element.style.textAlign='';});
      alignmentAnimations.forEach(animation=>animation.cancel());
      if (!company.isConnected) return;
      planning.style.opacity = '1';
      cards.forEach((card,index) => card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,delay:index*100,easing:'ease-out',fill:'backwards'}));
      planning.inert = false;
    }
    companyObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      companyObserver.disconnect(); companySeen = true; play();
    }, {threshold:.15});
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
    if (window.techouseIntroStarted || reduced()) return;
    window.techouseIntroStarted = true;
    const title = document.querySelector('#landing-title'),
      invitation = document.querySelector('.landing-invitation'),
      intro = kicker.closest('.landing-intro'),
      landing = document.querySelector('.division-landing'),
      steps = [...(invitation?.querySelectorAll('.intro-step') || [])];
    const sentence = kicker.textContent,
      animations = new Set(),
      localTimers = new Set();
    let done = false;
    const captions = [
      ...document.querySelectorAll('.division-banner .banner-content'),
      document.querySelector('.banner-nav-right'),
    ].filter(Boolean);
    const blocked = [
      document.querySelector('.division-banners'),
      document.querySelector('.banner-nav-right'),
      document.querySelector('.banner-company-link'),
      document.querySelector('#company'),
      document.querySelector('#footer'),
    ].filter(Boolean);
    const pause = (ms) =>
      new Promise((resolve) => {
        const t = setTimeout(() => {
          localTimers.delete(t);
          resolve();
        }, ms);
        localTimers.add(t);
      });
    const animate = (el, frames, options) => {
      const animation = el.animate(frames, options);
      animations.add(animation);
      return animation.finished.finally(() => animations.delete(animation));
    };
    intro.dataset.emphasis = 'promise';
    kicker.classList.add('intro-waiting');
    title.classList.add('intro-waiting');
    steps.forEach((el) => el.classList.add('intro-waiting'));
    landing.classList.add('intro-playing');
    document.documentElement.classList.add('intro-scroll-locked');
    document.body.classList.add('intro-scroll-locked');
    blocked.forEach((el) => (el.inert = true));
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'skip-intro';
    skip.innerHTML = 'Skip intro <span aria-hidden="true">▸│</span><span class="skip-intro-progress" aria-hidden="true"></span>';
    const skipHint = document.createElement('span');
    skipHint.className = 'intro-skip-hint';
    skipHint.textContent = matchMedia('(pointer: coarse)').matches ? 'Double tap to skip' : 'Double click to skip';
    landing.append(skip, skipHint);
    let lastTap = null;
    let skipping = false;
    let skipFade = null;
    function doubleClickSkip(event) { if (!event.target.closest('button,a')) requestSkip(); }
    function tapSkip(event) {
      if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button,a')) return;
      const now = performance.now();
      if (lastTap && now-lastTap.time < 350 && Math.hypot(event.clientX-lastTap.x,event.clientY-lastTap.y)<40) { lastTap=null; requestSkip(); }
      else lastTap={time:now,x:event.clientX,y:event.clientY};
    }
    landing.addEventListener('dblclick', doubleClickSkip);
    landing.addEventListener('pointerup', tapSkip);
    function unlock() {
      landing.classList.remove('intro-playing');
      landing.dispatchEvent(new Event('intro-ready'));
      document.documentElement.classList.remove('intro-scroll-locked');
      document.body.classList.remove('intro-scroll-locked');
      blocked.forEach((el) => (el.inert = false));
      skip.remove();
      skipHint.remove();
      landing.removeEventListener('dblclick', doubleClickSkip);
      landing.removeEventListener('pointerup', tapSkip);
    }
    // Both normal completion and Skip use this single exit path to restore the page.
    function finish(skipped = false) {
      if (done) return;
      done = true;
      localTimers.forEach(clearTimeout);
      animations.forEach((a) => a.cancel());
      animations.clear();
      kicker.textContent = sentence;
      kicker.removeAttribute('aria-label');
      kicker.classList.remove('intro-typing', 'intro-waiting');
      title.classList.remove('intro-waiting');
      steps.forEach((el) => el.classList.remove('intro-waiting'));
      intro.dataset.emphasis = 'question';
      unlock();
      captions.forEach((el, i) => {
        el.style.opacity = '1';
        if (el.isConnected)
          el.animate(
            skipped
              ? [{ opacity: 0 }, { opacity: 1 }]
              : [
                  { opacity: 0, transform: 'translateY(32px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
            {
              duration: skipped ? 550 : 750,
              delay: skipped ? 0 : i * 85,
              easing: 'cubic-bezier(.22,.7,.2,1)',
              fill: 'backwards',
            },
          );
      });
      if (skipped) document.querySelector('#main').focus({ preventScroll: true });
    }
    async function requestSkip() {
      if (done || skipping) return;
      skipping = true;
      skip.disabled = true;
      localTimers.forEach(clearTimeout);
      animations.forEach(animation => animation.pause());
      try {
        // Transition the headline only; banner photography stays visible.
        skipFade = intro.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 220, easing: 'ease-in-out', fill: 'forwards',
        });
        await skipFade.finished;
        if (!landing.isConnected || done) return;
        finish(true);
        const fadeOut = skipFade;
        skipFade = intro.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 550, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both',
        });
        fadeOut.cancel();
        await skipFade.finished;
        skipFade.cancel();
        skipFade = null;
      } catch {
        // Navigation cancels the fade and the normal cleanup restores the page.
      }
    }
    skip.onclick = requestSkip;
    cleanupIntro = () => {
      skipFade?.cancel();
      done = true;
      localTimers.forEach(clearTimeout);
      animations.forEach((a) => a.cancel());
      unlock();
    };
    const safety = setTimeout(() => finish(true), 18000);
    localTimers.add(safety);
    async function play() {
      await Promise.race([document.fonts.ready, pause(1200)]);
      if (done || !intro.isConnected) return;
      const typingDelays = Array.from(sentence).map(char => 22 + Math.random() * 44 + (char === ',' ? 100 : 0));
      const totalDuration = typingDelays.reduce((a, b) => a + b, 0) + 400 + 650 + 1600 + 1800 + steps.length * 770;
      const progress = skip.querySelector('.skip-intro-progress').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: totalDuration, easing: 'linear', fill: 'forwards' });
      animations.add(progress);
      kicker.setAttribute('aria-label', sentence);
      kicker.classList.add('intro-typing');
      const reserve = document.createElement('span');
      reserve.className = 'intro-type-reserve';
      reserve.setAttribute('aria-hidden', 'true');
      reserve.textContent = sentence;
      const ink = document.createElement('span');
      ink.className = 'intro-type-ink';
      ink.setAttribute('aria-hidden', 'true');
      kicker.replaceChildren(reserve, ink);
      kicker.classList.remove('intro-waiting');
      for (const [index, char] of Array.from(sentence).entries()) {
        if (done) return;
        ink.textContent += char;
        await pause(typingDelays[index]);
      }
      if (done) return;
      kicker.textContent = sentence;
      kicker.classList.remove('intro-typing');
      await pause(400);
      if (done) return;
      title.classList.remove('intro-waiting');
      await animate(
        title,
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 650, easing: 'ease-out' },
      );
      await pause(1600);
      if (done || !intro.isConnected) return;
      const properties = [
          'fontSize',
          'fontWeight',
          'lineHeight',
          'letterSpacing',
          'color',
          'marginTop',
          'marginBottom',
        ],
        elements = [kicker, title];
      const before = elements.map((el) => {
          const style = getComputedStyle(el);
          return Object.fromEntries(properties.map((key) => [key, style[key]]));
        }),
        top = getComputedStyle(intro).top;
      intro.dataset.emphasis = 'question';
      const after = elements.map((el) => {
        const style = getComputedStyle(el);
        return Object.fromEntries(properties.map((key) => [key, style[key]]));
      });
      await Promise.all([
        animate(intro, [{ top }, { top: getComputedStyle(intro).top }], {
          duration: 1800,
          easing: 'cubic-bezier(.4,0,.2,1)',
        }),
        ...elements.map((el, i) =>
          animate(el, [before[i], after[i]], { duration: 1800, easing: 'cubic-bezier(.4,0,.2,1)' }),
        ),
      ]);
      for (const el of steps) {
        await pause(220);
        if (done) return;
        el.classList.remove('intro-waiting');
        await animate(
          el,
          [
            { opacity: 0, transform: 'translateY(-9px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 550, easing: 'ease-out' },
        );
      }
      finish();
    }
    play().catch(() => {
      if (!done) finish(true);
    });
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
    const cities = [
      'Manila · Metro Manila',
      'Quezon City · Metro Manila',
      'Makati · Metro Manila',
      'Taguig · Metro Manila',
      'Pasig · Metro Manila',
      'Mandaluyong · Metro Manila',
      'Pasay · Metro Manila',
      'Parañaque · Metro Manila',
      'Las Piñas · Metro Manila',
      'Muntinlupa · Metro Manila',
      'Marikina · Metro Manila',
      'San Juan · Metro Manila',
      'Caloocan · Metro Manila',
      'Malabon · Metro Manila',
      'Navotas · Metro Manila',
      'Valenzuela · Metro Manila',
      'Pateros · Metro Manila',
      'Antipolo · Rizal',
      'Cainta · Rizal',
      'Taytay · Rizal',
      'Bacoor · Cavite',
      'Imus · Cavite',
      'Dasmariñas · Cavite',
      'General Trias · Cavite',
      'Tagaytay · Cavite',
      'Santa Rosa · Laguna',
      'Biñan · Laguna',
      'Calamba · Laguna',
      'San Pedro · Laguna',
      'Batangas City · Batangas',
      'Lipa · Batangas',
      'Malolos · Bulacan',
      'Meycauayan · Bulacan',
      'San Jose del Monte · Bulacan',
      'Angeles · Pampanga',
      'San Fernando · Pampanga',
      'Tarlac City · Tarlac',
      'Baguio · Benguet',
      'Dagupan · Pangasinan',
      'Laoag · Ilocos Norte',
      'Legazpi · Albay',
      'Naga · Camarines Sur',
      'Puerto Princesa · Palawan',
      'Cebu City · Cebu',
      'Mandaue · Cebu',
      'Lapu-Lapu · Cebu',
      'Iloilo City · Iloilo',
      'Bacolod · Negros Occidental',
      'Dumaguete · Negros Oriental',
      'Tacloban · Leyte',
      'Tagbilaran · Bohol',
      'Davao City · Davao Region',
      'Cagayan de Oro · Misamis Oriental',
      'General Santos · South Cotabato',
      'Zamboanga City · Zamboanga Peninsula',
      'Butuan · Agusan del Norte',
    ];
    cities.forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      list.append(option);
    });
    input.after(list);
    const hint = document.createElement('small');
    hint.id = 'location-suggestions-note';
    hint.textContent =
      'Choose a suggested city or municipality, or enter your location if it is not listed.';
    input.closest('label').append(hint);
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
    const extras = [
      form.querySelector('.solar-location'),
      form.querySelector('#solar-guidance'),
      form.querySelector('[data-solar-next]'),
    ];
    function draw() {
      const names = ['sector', 'goal'];
      const value = new FormData(form).get(names[step]);
      const sector = new FormData(form).get('sector') || 'Residential';
      const photos = {
        Residential: ['assets/solar-story/home-selected.jpg', 'A bright home interior with a sofa, houseplant and resting dog', 'Make room for a brighter everyday.', 'Explore solar for the place you call home.'],
        Commercial: ['assets/solar-story/store-selected.jpg', 'A bright supermarket aisle with stocked shelves', 'Put your roof to work for your business.', 'Explore solar for the spaces that keep your business moving.'],
        Industrial: ['assets/solar-story/factory-selected.jpg', 'Engineers working together inside a bright manufacturing facility', 'Think bigger. Start with your roof.', 'Explore solar for your facility’s energy needs.'],
      };
      const priorities = {
        'Lower electricity costs': ['assets/solar-story/peso-meralco-bill.jpg', 'A person reviewing an illustrative Meralco electricity bill in Philippine pesos', 'Lower my electricity bill', 'Explore how daytime solar could offset electricity you buy from the grid.'],
        'Energy after sunset': ['assets/solar-story/night-home.jpg', 'A house with warmly illuminated windows at night', 'Keep the day going.', 'Discuss battery storage for using stored solar energy after sunset.'],
        'Backup for essentials': ['assets/solar-story/essential-light.jpg', 'A single light illuminating otherwise dark surroundings', 'Keep the essentials connected.', 'Plan backup for essential lights, Wi-Fi and selected appliances, with battery capacity matched to your needs.'],
      };
      const [image,alt,title,description] = (step === 1 ? priorities[value] : photos[sector]) || photos.Residential;
      visual.classList.add('discovery-photo-visual');
      visual.dataset.story = step === 0 ? sector : value;
      visual.innerHTML = `<img class="discovery-story-photo" src="${image}" alt="${alt}"><div class="discovery-photo-shade"></div><div class="discovery-photo-copy"><span>YOUR SOLAR STORY / ${step === 0 ? sector.toUpperCase() : 'YOUR PRIORITY'}</span><h3>${title}</h3><p>${description}</p><small>${step === 1 && value === 'Lower electricity costs' ? 'Illustrative bill image' : 'Photo · Unsplash · illustrative'}</small></div>`;
    }
    function show(focus = false) {
      form.classList.toggle('priority-step', step === steps.length - 1);
      layout.classList.toggle('priority-stage', step === steps.length - 1);
      steps.forEach((s, i) => (s.hidden = i !== step));
      extras.forEach((e) => (e.hidden = step !== steps.length - 1));
      progress.innerHTML = ['Your property', 'Your priority']
        .map(
          (v, i) =>
            `<button type="button" data-step="${i}" aria-current="${i === step ? 'step' : 'false'}">0${i + 1} <span>${v}</span></button>`,
        )
        .join('');
      controls.querySelector('[data-back]').disabled = step === 0;
      controls.querySelector('[data-next]').hidden = step === steps.length - 1;
      controls.querySelector('.discovery-count').textContent = `${step + 1} / ${steps.length}`;
      draw();
      if (focus) {
        steps[step].querySelector('legend').tabIndex = -1;
        steps[step].querySelector('legend').focus({ preventScroll: true });
      }
    }
    controls.querySelector('[data-back]').onclick = () => {
      step = Math.max(0, step - 1);
      show(true);
    };
    controls.querySelector('[data-next]').onclick = () => {
      step = Math.min(steps.length - 1, step + 1);
      show(true);
    };
    progress.onclick = (e) => {
      const b = e.target.closest('[data-step]');
      if (b) {
        step = +b.dataset.step;
        show(true);
      }
    };
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
        ['assets/solar-story/lesson-equipment.jpg', 'Electrical enclosures and wiring mounted on a building'],
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
