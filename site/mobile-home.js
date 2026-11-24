/**
 * Phone homepage (max-width 599px), client-chosen "Cinematic chapters" in light mode:
 * a photo per division with its chapter (title, label, gold button) over it, a strip of
 * round division selectors on paper below, and Call us / Get a quote fixed to the bottom
 * of the screen for the whole homepage. The photo strip can be swiped between divisions.
 * Built from the rendered division banners, so CMS banner text and images carry over.
 * The approved intro is untouched: chapter and selectors follow its reveal phases in CSS.
 */
'use strict';
window.TechouseMobileHome = (() => {
  const PHONE = '(max-width: 599px)';
  const SHORT = {
    solar: 'Solar',
    construction: 'Construction',
    prefabrication: 'Prefab',
    development: 'Real estate',
    elevators: 'Elevators',
  };
  let teardown = () => {};
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (text) =>
    String(text).replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );

  function read(host) {
    return [...host.querySelectorAll('.division-banner')].map((panel) => {
      const id = panel.dataset.banner;
      const img = panel.querySelector(
        '.banner-background img.banner-color-layer, .banner-background img',
      );
      return {
        id,
        title: panel.querySelector('.banner-title-row h2')?.innerHTML || '',
        label: panel.querySelector('.banner-division-label span')?.textContent || '',
        icon: panel.querySelector('.banner-division-label svg')?.outerHTML || '',
        cta: panel.querySelector('.banner-cta')?.childNodes[0]?.textContent.trim() || '',
        href: panel.querySelector('.banner-cta')?.getAttribute('href') || `#/divisions/${id}`,
        image: img ? img.currentSrc || img.src : '',
      };
    });
  }

  function markup(items, arrow) {
    return `<div class="mh" data-mobile-home>
      <div class="mh-stage"><div class="mh-photos" aria-hidden="true">${items.map((d, i) => `<div class="mh-photo">${d.image ? `<img src="${esc(d.image)}" alt="" draggable="false" ${i ? '' : 'fetchpriority="high"'} decoding="async">` : ''}</div>`).join('')}</div><div class="mh-shade" aria-hidden="true"></div></div>
      <div class="mh-chapters" aria-live="polite">${items
        .map(
          (d, i) =>
            `<div class="mh-chapter ${i ? 'is-after' : 'is-on'}" ${i ? 'aria-hidden="true" inert' : ''}><h2 class="mh-title">${d.title}</h2><p class="mh-label">${d.icon}<span>${esc(d.label)}</span></p><a class="mh-cta" href="${esc(d.href)}">${esc(d.cta)} ${arrow}</a></div>`,
        )
        .join('')}</div>
      <nav class="mh-pick" aria-label="Choose a division">${items
        .map(
          (d, i) =>
            `<button type="button" data-index="${i}" aria-pressed="${!i}" aria-label="${esc(d.label)}"><span class="mh-ring">${d.icon}</span><span class="mh-pick-name">${esc(SHORT[d.id] || d.label)}</span></button>`,
        )
        .join('')}</nav>
    </div>`;
  }

  // Call us and Get a quote stay at the bottom of the screen on the whole phone homepage.
  function barMarkup(arrow) {
    return `<div class="mh-bar" data-mobile-home-bar><a class="mh-bar-call" href="tel:+639855626888">${window.TechouseIcons.icon('call')}Call us</a><a class="mh-bar-quote" href="#/inquiry">Get a quote ${arrow}</a></div>`;
  }

  function menuMarkup(arrow) {
    return `<div class="mh-menu" id="mh-menu" aria-hidden="true" inert><nav class="mh-menu-list" aria-label="Main navigation"><a href="#/divisions">Our divisions ${arrow}</a><a href="#/about">About Techouse ${arrow}</a><a href="#/updates">News ${arrow}</a><a class="mh-menu-partner" href="#/partnership"><span>Be a partner<small>Earn 5% referring solar clients</small></span>${arrow}</a></nav><div class="mh-menu-foot"><a class="mh-menu-cta" href="#/inquiry">Start a project ${arrow}</a><a href="mailto:techouse889@gmail.com">techouse889@gmail.com</a><a href="tel:+639855626888">+63 985 562 6888</a></div></div>`;
  }

  function mount(host) {
    teardown();
    if (!host || !matchMedia(PHONE).matches) {
      const media = matchMedia(PHONE);
      const later = () => {
        if (media.matches && document.body.classList.contains('landing'))
          mount(document.querySelector('.division-landing'));
      };
      media.addEventListener('change', later);
      teardown = () => media.removeEventListener('change', later);
      return;
    }
    const arrow = window.TechouseIcons.icon('arrow_outward');
    const items = read(host);
    if (items.length < 2) return;
    host.insertAdjacentHTML('beforeend', markup(items, arrow));
    const hero = host.querySelector('[data-mobile-home]');
    const stage = hero.querySelector('.mh-stage');
    const track = hero.querySelector('.mh-photos');
    const chapters = [...hero.querySelectorAll('.mh-chapter')];
    const picks = [...hero.querySelectorAll('.mh-pick button')];
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const last = items.length - 1;
    let on = 0;
    document.body.insertAdjacentHTML('beforeend', barMarkup(arrow));
    const bar = document.querySelector('[data-mobile-home-bar]');
    document.documentElement.classList.add('mh-has-bar');

    const place = (offset = 0, instant = false) => {
      track.classList.toggle('is-dragging', instant);
      track.style.transform = `translate3d(calc(${-on * 100}% + ${offset}px), 0, 0)`;
    };
    const show = (i) => {
      i = Math.max(0, Math.min(last, i));
      const changed = i !== on;
      on = i;
      place();
      chapters.forEach((c, k) => {
        c.style.transform = '';
        c.style.opacity = '';
        if (!changed) return;
        c.className = `mh-chapter ${k === i ? 'is-on' : k < i ? 'is-before' : 'is-after'}`;
        c.toggleAttribute('inert', k !== i);
        c.setAttribute('aria-hidden', String(k !== i));
      });
      picks.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    };
    hero.querySelector('.mh-pick').addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('button');
        if (button) show(Number(button.dataset.index));
      },
      options,
    );

    // Swipe: the photo strip follows the finger and settles on release; the chapter drifts
    // with it and fades. Vertical drags still scroll the page (touch-action: pan-y).
    let start = null;
    let moved = false;
    const width = () => stage.clientWidth || innerWidth;
    stage.parentElement.addEventListener(
      'pointerdown',
      (event) => {
        if (event.button > 0 || event.target.closest('.mh-pick')) return;
        start = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
        moved = false;
      },
      options,
    );
    addEventListener(
      'pointermove',
      (event) => {
        if (!start || event.pointerId !== start.id) return;
        let dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!moved) {
          if (Math.abs(dx) < 8) return;
          if (Math.abs(dy) > Math.abs(dx)) {
            start = null;
            return;
          }
          moved = true;
        }
        if ((on === 0 && dx > 0) || (on === last && dx < 0)) dx *= 0.35;
        place(dx, true);
        const share = Math.min(1, Math.abs(dx) / width());
        const chapter = chapters[on];
        chapter.style.transition = 'none';
        chapter.style.transform = `translateX(${dx * 0.35}px)`;
        chapter.style.opacity = String(1 - share * 1.4);
      },
      options,
    );
    const release = (event) => {
      if (!start || (event && event.pointerId !== start.id)) return;
      const dx = event ? event.clientX - start.x : 0;
      const speed = dx / Math.max(1, performance.now() - start.t);
      start = null;
      const chapter = chapters[on];
      chapter.style.transition = '';
      if (!moved) return;
      const step = width() * 0.2;
      show(dx < -step || speed < -0.5 ? on + 1 : dx > step || speed > 0.5 ? on - 1 : on);
    };
    addEventListener('pointerup', release, options);
    addEventListener('pointercancel', release, options);
    // A drag must not also follow the chapter's link.
    hero.addEventListener(
      'click',
      (event) => {
        if (moved && event.target.closest('.mh-chapter')) {
          event.preventDefault();
          event.stopPropagation();
          moved = false;
        }
      },
      { capture: true, signal: controller.signal },
    );
    hero.addEventListener('dragstart', (event) => event.preventDefault(), options);
    hero.addEventListener(
      'keydown',
      (event) => {
        if (!event.target.closest('.mh-pick')) return;
        const next =
          event.key === 'ArrowRight' ? on + 1 : event.key === 'ArrowLeft' ? on - 1 : null;
        if (next === null) return;
        event.preventDefault();
        show(next);
        picks[on].focus();
      },
      options,
    );
    addEventListener('resize', () => place(), options);
    place();

    // Menu: a button after the call icon; the bars turn into a close mark and a panel drops in.
    const actions = document.querySelector('#header .banner-nav-right');
    let menuButton = null;
    let menu = null;
    if (actions) {
      menuButton = document.createElement('button');
      menuButton.type = 'button';
      menuButton.className = 'mh-menu-button';
      menuButton.setAttribute('aria-label', 'Open menu');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-controls', 'mh-menu');
      menuButton.innerHTML =
        '<span class="mh-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
      actions.append(menuButton);
      document.body.insertAdjacentHTML('beforeend', menuMarkup(arrow));
      menu = document.querySelector('#mh-menu');
      const setMenu = (open) => {
        if (open && scrollY > 0) {
          // Opening further down the page: return to the top first, then open and lock
          scrollTo({ top: 0, behavior: calm() ? 'instant' : 'smooth' });
          let done = false;
          const go = () => {
            if (done) return;
            done = true;
            removeEventListener('scrollend', go);
            scrollTo({ top: 0, behavior: 'instant' });
            setMenu(true);
          };
          addEventListener('scrollend', go, options);
          setTimeout(go, 700);
          return;
        }
        document.documentElement.classList.toggle('mh-menu-open', open);
        menu.toggleAttribute('inert', !open);
        menu.setAttribute('aria-hidden', String(!open));
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      };
      menuButton.addEventListener(
        'click',
        () => setMenu(!document.documentElement.classList.contains('mh-menu-open')),
        options,
      );
      menu.addEventListener(
        'click',
        (event) => {
          if (event.target.closest('a')) setMenu(false);
        },
        options,
      );
      addEventListener(
        'keydown',
        (event) => {
          if (
            event.key === 'Escape' &&
            document.documentElement.classList.contains('mh-menu-open')
          ) {
            setMenu(false);
            menuButton.focus();
          }
        },
        options,
      );
    }

    // Leaving phone width: remove the phone hero and show the regular layout again
    const media = matchMedia(PHONE);
    media.addEventListener(
      'change',
      () => {
        if (!media.matches) {
          teardown();
          mount(host);
        }
      },
      options,
    );

    teardown = () => {
      controller.abort();
      document.documentElement.classList.remove('mh-menu-open', 'mh-has-bar');
      hero.remove();
      bar?.remove();
      menuButton?.remove();
      menu?.remove();
      teardown = () => {};
    };
  }

  // read() is shared with tablet-home.js, which builds the tablet panels from the same banners.
  return { mount, read, destroy: () => teardown() };
})();
