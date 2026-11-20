/**
 * Phone homepage (max-width 599px): one full-screen photo, the chosen division as a
 * chapter, the other four as a balanced 2 x 2 pill grid, and a menu in the header.
 * Built from the rendered division banners, so CMS banner text and images carry over.
 * The approved intro is untouched: the chapter and pills follow its reveal phases in CSS.
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
    const count = String(items.length).padStart(2, '0');
    return `<div class="mh" data-mobile-home>
      <div class="mh-photos" aria-hidden="true">${items.map((d, i) => (d.image ? `<img src="${esc(d.image)}" alt="" class="${i ? '' : 'is-on'}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : '<span></span>')).join('')}</div>
      <div class="mh-blur mh-blur-near" aria-hidden="true"></div><div class="mh-blur mh-blur-far" aria-hidden="true"></div>
      <div class="mh-tint" aria-hidden="true"></div><div class="mh-band" aria-hidden="true"></div><div class="mh-vignette" aria-hidden="true"></div>
      <div class="mh-chapters" aria-live="polite">${items
        .map(
          (d, i) =>
            `<div class="mh-chapter ${i ? 'is-after' : 'is-on'}" ${i ? 'aria-hidden="true" inert' : ''}><span class="mh-count">${String(i + 1).padStart(2, '0')} / ${count}</span><h2 class="mh-title">${d.title}</h2><p class="mh-label">${d.icon}<span>${esc(d.label)}</span></p><a class="mh-cta" href="${esc(d.href)}">${esc(d.cta)} ${arrow}</a></div>`,
        )
        .join('')}</div>
      <div class="mh-grid" role="group" aria-label="Choose a division">${items
        .map(
          (d, i) =>
            `<button type="button" class="mh-pill ${i ? '' : 'is-gone'}" data-index="${i}" ${i ? '' : 'tabindex="-1" aria-hidden="true"'} aria-label="Show ${esc(d.label)}">${d.icon}<span>${esc(SHORT[d.id] || d.label)}</span></button>`,
        )
        .join('')}</div>
    </div>`;
  }

  function menuMarkup(arrow) {
    return `<div class="mh-menu" id="mh-menu" aria-hidden="true" inert><nav class="mh-menu-list" aria-label="Main navigation"><a href="#/divisions">Our divisions ${arrow}</a><a href="#/about">About Techouse ${arrow}</a><a href="#/updates">News ${arrow}</a><span class="mh-menu-soon" role="link" aria-disabled="true">Join us &amp; be a partner<small>Coming soon</small></span></nav><div class="mh-menu-foot"><a class="mh-menu-cta" href="#/inquiry">Start a project ${arrow}</a><a href="mailto:techouse889@gmail.com">techouse889@gmail.com</a><a href="tel:+639855626888">+63 985 562 6888</a></div></div>`;
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
    const photos = [...hero.querySelectorAll('.mh-photos > *')];
    const chapters = [...hero.querySelectorAll('.mh-chapter')];
    const grid = hero.querySelector('.mh-grid');
    const pills = [...grid.querySelectorAll('.mh-pill')];
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let on = 0;

    // 2 x 2 grid. First layout pairs the longest with the shortest on the bottom row; after
    // that a returning division takes the tapped pill's slot, so pills only glide sideways.
    // Pills are placed absolutely at computed spots, so a move can never wrap into new rows.
    const natural = new Map();
    let slots = null;
    const measure = () => {
      grid.classList.add('is-measuring');
      pills.forEach((p) => {
        const w = p.offsetWidth;
        if (w) natural.set(p, w);
        else if (!natural.has(p)) natural.set(p, p.textContent.trim().length * 8 + 46);
      });
      grid.classList.remove('is-measuring');
    };
    const arrange = (animate) => {
      measure();
      if (!slots || slots.some((p) => !p || p.classList.contains('is-gone'))) {
        const [a, b, c, d] = pills
          .filter((p) => !p.classList.contains('is-gone'))
          .sort((x, y) => natural.get(y) - natural.get(x));
        slots = [c, b, d, a];
      }
      const width = grid.clientWidth;
      const gap = 8;
      const rowHeight = 44;
      grid.classList.toggle('is-instant', !animate || calm());
      [
        [0, 1],
        [2, 3],
      ].forEach(([l, r], row) => {
        if (!slots[l] || !slots[r]) return;
        if (natural.get(slots[l]) > natural.get(slots[r]))
          [slots[l], slots[r]] = [slots[r], slots[l]];
        const left = natural.get(slots[l]);
        const right = natural.get(slots[r]);
        const extra = Math.max(0, (width - gap - left - right) / 2);
        const y = row * (rowHeight + gap);
        Object.assign(slots[l].style, { left: '0px', top: `${y}px`, width: `${left + extra}px` });
        Object.assign(slots[r].style, {
          left: `${left + extra + gap}px`,
          top: `${y}px`,
          width: `${right + extra}px`,
        });
      });
      if (!animate || calm()) requestAnimationFrame(() => grid.classList.remove('is-instant'));
    };

    const show = (i) => {
      if (i === on) return;
      on = i;
      chapters.forEach((c, k) => {
        c.className = `mh-chapter ${k === i ? 'is-on' : k < i ? 'is-before' : 'is-after'}`;
        c.toggleAttribute('inert', k !== i);
        c.setAttribute('aria-hidden', String(k !== i));
      });
      photos.forEach((p, k) => p.classList.toggle('is-on', k === i));
      const leaving = pills[i];
      const returning = pills.find((p) => p.classList.contains('is-gone'));
      if (slots && returning) slots[slots.indexOf(leaving)] = returning;
      if (returning) returning.classList.add('is-instant-one', 'is-entering');
      pills.forEach((p, k) => {
        const gone = k === i;
        p.classList.toggle('is-gone', gone);
        p.tabIndex = gone ? -1 : 0;
        p.setAttribute('aria-hidden', String(gone));
      });
      leaving.classList.add('is-leaving');
      arrange(true);
      if (returning)
        requestAnimationFrame(() => {
          returning.classList.remove('is-instant-one');
          requestAnimationFrame(() => returning.classList.remove('is-entering'));
        });
      setTimeout(() => leaving.classList.remove('is-leaving'), calm() ? 0 : 260);
      // Keep keyboard focus inside the grid when the focused pill leaves
      if (document.activeElement === leaving)
        (returning || pills.find((p) => !p.classList.contains('is-gone')))?.focus({
          preventScroll: true,
        });
    };
    grid.addEventListener(
      'click',
      (event) => {
        const pill = event.target.closest('.mh-pill');
        if (pill && !pill.classList.contains('is-gone')) show(Number(pill.dataset.index));
      },
      options,
    );
    arrange(false);
    addEventListener('resize', () => arrange(false), options);
    document.fonts?.ready.then(() => arrange(false));

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
      document.documentElement.classList.remove('mh-menu-open');
      hero.remove();
      menuButton?.remove();
      menu?.remove();
      teardown = () => {};
    };
  }

  // read() is shared with tablet-home.js, which builds the tablet panels from the same banners.
  return { mount, read, destroy: () => teardown() };
})();
