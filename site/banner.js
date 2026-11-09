/**
 * Landing-page copy and five-banner interactions.
 * copy = division headings/hooks; html() = landing/About markup; mount() = hover, return animation, and scroll behavior.
 */
'use strict';
window.TechouseBanner = (() => {
  let teardown = () => {};
  // EDITABLE COPY: display labels may change; object keys must match app.js division ids.
  const copy = {
    solar: { title: 'Power your<br>tomorrow.' },
    construction: { title: 'Build your<br>next chapter.' },
    prefabrication: { title: 'Rethink<br>your space.' },
    development: { title: 'Shape your<br>next address.' },
    elevators: { title: 'Rise to new<br>possibilities.' },
  };
  function header(brand, arrow) {
    return `<div class="banner-nav"><a href="#company" class="banner-company-link" aria-label="About Techouse">${brand}</a><div class="banner-nav-right"><a class="header-call" href="tel:+639855626888" aria-label="Call Techouse at +63 985 562 6888">${window.TechouseIcons.icon('call')}<span>Call us</span></a><a class="banner-global-quote" href="#/inquiry">Request a quote ${arrow}</a></div></div>`;
  }
  // LANDING MARKUP: intro, banners, About section, and right-edge About cue.
  function html(divisions, art, arrow) {
    return `<section class="division-landing" aria-labelledby="landing-title"><div class="landing-intro"><h1 id="landing-title">What are you <br>building next?</h1><span class="landing-kicker" hidden>We bring the newest technology to the Philippines.</span></div><div class="division-banners" aria-label="Explore Techouse business divisions">${divisions
      .map((d) => {
        const c = copy[d.id];
        return `<section class="division-banner banner-${d.id}" data-banner="${d.id}" aria-labelledby="banner-title-${d.id}"><div class="banner-background" aria-hidden="true">${d.image ? `<img src="assets/${d.image}" alt="" ${d.id === 'solar' ? 'fetchpriority="high"' : ''}>` : `<div class="elevator-backdrop">${art}</div>`}</div><div class="banner-shade"></div><button class="banner-trigger" aria-label="Explore ${d.short}"></button><div class="banner-content"><div class="banner-title-row"><h2 id="banner-title-${d.id}">${c.title}</h2><span class="banner-plus" aria-hidden="true">+</span></div><p class="banner-division-label">${d.short}</p>${d.id === 'solar' ? `<a class="banner-scroll-cue" href="#company" aria-label="Scroll down to learn about Techouse"><span class="banner-scroll-icon" aria-hidden="true">${window.TechouseIcons.icon('arrow_downward')}</span><span class="banner-scroll-label" aria-hidden="true">About us</span></a>` : ''}</div><span class="banner-load-status" aria-hidden="true">Techouse · Loading image</span></section>`;
      })
      .join(
        '',
      )}</div></section><section class="landing-company" id="company" aria-labelledby="company-title"><div class="company-intro"><h2 id="company-title">New ways to build.<br>More ways forward.</h2><div class="company-story"><p>Every project starts with a possibility. A roof that could generate energy. A space ready for a new purpose. A building ready for its next chapter.</p><p class="company-story-close">Techouse brings the technology and the people together to help you explore what comes next.</p><a class="button" href="#/about">More about Techouse ↗</a></div></div></section>`;
  }
  function mount(returningHome = false) {
    teardown();
    const host = document.querySelector('.division-landing');
    if (!host) return;
    const panels = [...host.querySelectorAll('.division-banner')];
    // Identical geometry: grayscale base below, color photo fading above.
    panels.forEach((panel) => {
      const background = panel.querySelector('.banner-background');
      const color = background?.querySelector('img');
      if (!color || background.querySelector('.banner-grayscale-base')) return;
      const base = color.cloneNode();
      base.classList.add('banner-grayscale-base');
      base.alt = '';
      base.setAttribute('aria-hidden', 'true');
      color.classList.add('banner-color-layer');
      background.prepend(base);
    });
    const media = matchMedia('(max-width: 900px), (hover: none)');
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let scrollFrame = 0;
    const stopScroll = () => cancelAnimationFrame(scrollFrame);
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
      window.addEventListener(type, stopScroll, { ...options, passive: true });
    function scrollToCompany() {
      stopScroll();
      const target = document.querySelector('#company');
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        target.scrollIntoView({ behavior: 'instant' });
        return;
      }
      const start = scrollY;
      const end = Math.min(
        start + target.getBoundingClientRect().top,
        document.documentElement.scrollHeight - innerHeight,
      );
      const began = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - began) / 850);
        const eased = 1 - Math.pow(1 - progress, 4);
        scrollTo({ top: start + (end - start) * eased, behavior: 'instant' });
        if (progress < 1) scrollFrame = requestAnimationFrame(tick);
      };
      scrollFrame = requestAnimationFrame(tick);
    }
    document.querySelectorAll('.banner-company-link,.banner-scroll-cue').forEach((link) =>
      link.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          scrollToCompany();
          document.querySelector('#company-title').setAttribute('tabindex', '-1');
          document.querySelector('#company-title').focus({ preventScroll: true });
        },
        options,
      ),
    );
    let observer;
    let keyboardMode = false;
    let awaitingFreshMovement = false;
    let lastPointer = null;
    let activationPointer = null;
    const resetPointer = () => {
      lastPointer = null;
      activationPointer = null;
      awaitingFreshMovement = true;
    };
    window.addEventListener('blur', resetPointer, options);
    document.addEventListener('visibilitychange', resetPointer, options);
    host.addEventListener('pointerenter', resetPointer, options);
    host.addEventListener(
      'intro-ready',
      () => {
        resetPointer();
      },
      options,
    );
    function state(panel, open) {
      if (panel.classList.contains('is-open') === open) return;
      panel.classList.toggle('is-open', open);
    }
    // Intro playback blocks expansion; intro-ready requires fresh pointer movement afterward.
    function desktopOpen(panel) {
      if (
        host.classList.contains('banner-departing') ||
        host.classList.contains('intro-playing') ||
        host.classList.contains('banners-arriving')
      )
        return;
      panels.forEach((p) => state(p, p === panel));
      host.classList.toggle('has-expanded', !!panel);
    }

    function setup() {
      observer?.disconnect();
      panels.forEach((p) => {
        state(p, false);
        delete p.dataset.manual;
      });
      host.classList.remove('has-expanded');
      if (media.matches) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting && !entry.target.dataset.manual) {
                state(entry.target, true);
                observer.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.32, rootMargin: '-12% 0px -12% 0px' },
        );
        panels.forEach((p) => observer.observe(p));
      }
    }
    panels.forEach((panel) => {
      // Panel edges move during expansion. Activate from real pointer movement below,
      // not pointerenter events synthesized when a panel slides underneath the cursor.
      panel.addEventListener(
        'focusin',
        () => {
          if (!media.matches) desktopOpen(panel);
        },
        options,
      );
      panel.querySelector('.banner-trigger').addEventListener(
        'click',
        () => {
          window.TechouseDivisions.enter(panel);
        },
        options,
      );
    });
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Tab') keyboardMode = true;
      },
      { ...options, capture: true },
    );
    host.addEventListener(
      'pointermove',
      (event) => {
        if (
          media.matches ||
          event.pointerType === 'touch' ||
          host.classList.contains('intro-playing') ||
          host.classList.contains('banners-arriving')
        )
          return;
        // Compare viewport coordinates: movementX can jump on window re-entry.
        // Moving flex-panel boundaries must not select a different image by themselves.
        const point = { x: event.clientX, y: event.clientY };
        if (!lastPointer) {
          lastPointer = point;
          return;
        }
        const distance = Math.hypot(point.x - lastPointer.x, point.y - lastPointer.y);
        if (distance < 3) return;
        if (awaitingFreshMovement && distance < 8) return;
        lastPointer = point;
        awaitingFreshMovement = false;
        keyboardMode = false;
        const panel = event.target.closest('.division-banner');
        if (!panel || panel.classList.contains('is-open')) return;
        if (
          activationPointer &&
          Math.hypot(point.x - activationPointer.x, point.y - activationPointer.y) < 16
        )
          return;
        const bounds = panel.getBoundingClientRect();
        if (point.x < bounds.left + 8 || point.x > bounds.right - 8) return;
        activationPointer = point;
        desktopOpen(panel);
      },
      options,
    );
    host.querySelector('.division-banners').addEventListener(
      'pointerleave',
      () => {
        resetPointer();
        if (!media.matches && !panels.some((p) => p.contains(document.activeElement)))
          desktopOpen(null);
      },
      options,
    );
    host.addEventListener(
      'focusout',
      (event) => {
        if (
          !media.matches &&
          event.relatedTarget &&
          !host.contains(event.relatedTarget) &&
          !host.querySelector('.division-banners:hover')
        )
          desktopOpen(null);
      },
      options,
    );
    host.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          if (media.matches) {
            const panel = event.target.closest('.division-banner');
            if (panel) {
              panel.dataset.manual = 'true';
              state(panel, false);
              panel.querySelector('.banner-trigger').focus();
            }
          } else desktopOpen(null);
        }
      },
      options,
    );
    media.addEventListener('change', setup);
    setup();
    // RETURN TRANSITION: the logo and banners re-enter when navigating home from another route.
    const arrivalAnimations = [];
    if (returningHome && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.classList.add('banners-arriving');
      panels.forEach((panel, i) =>
        arrivalAnimations.push(
          panel.animate([{ transform: 'translateY(-110vh)' }, { transform: 'translateY(0)' }], {
            duration: 950,
            delay: i * 70,
            easing: 'cubic-bezier(.22,.75,.2,1)',
            fill: 'backwards',
          }),
        ),
      );
      const logo = document.querySelector('.banner-nav .brand-logo');
      if (logo)
        arrivalAnimations.push(
          logo.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 750,
            delay: 350,
            easing: 'ease-out',
            fill: 'backwards',
          }),
        );
      const intro = host.querySelector('.landing-intro');
      arrivalAnimations.push(
        intro.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 550,
          delay: 650,
          fill: 'backwards',
        }),
      );
      Promise.all(arrivalAnimations.map((a) => a.finished))
        .then(() => {
          host.classList.remove('banners-arriving');
          window.TechouseDivisions.clearPreviousPage();
        })
        .catch(() => {
          if (host.isConnected) window.TechouseDivisions.clearPreviousPage();
        });
    }
    teardown = () => {
      stopScroll();
      arrivalAnimations.forEach((a) => a.cancel());
      controller.abort();
      observer?.disconnect();
      media.removeEventListener('change', setup);
    };
  }
  return { html, header, mount, destroy: () => teardown() };
})();
