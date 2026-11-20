/**
 * Touch-tablet homepage (600px wide or more, 600px tall or more, no hover): the desktop's
 * five division panels, opened by tapping instead of hovering. Columns in landscape,
 * stacked bands in portrait. A tap opens a panel without navigating; its button goes to the
 * division; the X (or Escape) closes it. Tablets with a mouse or trackpad keep the hover banners.
 * Built from the rendered banners via TechouseMobileHome.read, so CMS edits carry over.
 */
'use strict';
window.TechouseTabletHome = (() => {
  const TABLET = '(min-width: 600px) and (min-height: 600px) and (hover: none)';
  let teardown = () => {};
  const esc = (text) =>
    String(text).replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  const closeIcon =
    '<svg viewBox="0 -960 960 960" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';

  function markup(items, arrow) {
    return `<div class="tp" data-tablet-home>
      <div class="tp-panels">${items
        .map(
          (d, i) => `<div class="tp-panel" data-index="${i}">
        ${d.image ? `<img src="${esc(d.image)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : ''}<div class="tp-shade" aria-hidden="true"></div>
        <button type="button" class="tp-hit" aria-expanded="false" aria-controls="tp-copy-${i}" aria-label="Show ${esc(d.label)}"></button>
        <div class="tp-copy" id="tp-copy-${i}"><h2 class="tp-title">${d.title.replace(/<br\s*\/?>/gi, ' <br>')}</h2><p class="tp-label">${d.icon}<span>${esc(d.label)}</span></p><a class="tp-cta" href="${esc(d.href)}" tabindex="-1">${esc(d.cta)} ${arrow}</a></div>
        <button type="button" class="tp-close" aria-label="Close ${esc(d.label)}" tabindex="-1">${closeIcon}</button>
      </div>`,
        )
        .join('')}</div>
      <div class="tp-top" aria-hidden="true"><div class="tp-blur tp-blur-near"></div><div class="tp-blur tp-blur-far"></div><div class="tp-vignette"></div></div>
    </div>`;
  }

  function mount(host) {
    teardown();
    const media = matchMedia(TABLET);
    if (!host || !media.matches || !window.TechouseMobileHome?.read) {
      const later = () => {
        if (media.matches && document.body.classList.contains('landing'))
          mount(document.querySelector('.division-landing'));
      };
      media.addEventListener('change', later);
      teardown = () => media.removeEventListener('change', later);
      return;
    }
    const items = window.TechouseMobileHome.read(host);
    if (items.length < 2) return;
    const arrow = window.TechouseIcons.icon('arrow_outward');
    host.insertAdjacentHTML('beforeend', markup(items, arrow));
    host.classList.add('tp-active');
    const root = host.querySelector('[data-tablet-home]');
    const panels = [...root.querySelectorAll('.tp-panel')];
    const controller = new AbortController();
    const options = { signal: controller.signal };

    const set = (open) => {
      host.classList.toggle('tp-has-open', open !== null);
      panels.forEach((panel, k) => {
        const on = k === open;
        panel.classList.toggle('is-open', on);
        panel.querySelector('.tp-hit').setAttribute('aria-expanded', String(on));
        panel.querySelector('.tp-cta').tabIndex = on ? 0 : -1;
        panel.querySelector('.tp-close').tabIndex = on ? 0 : -1;
      });
    };
    panels.forEach((panel, k) => {
      panel.querySelector('.tp-hit').addEventListener('click', () => set(k), options);
      panel.querySelector('.tp-close').addEventListener(
        'click',
        (event) => {
          event.stopPropagation();
          set(null);
          panel.querySelector('.tp-hit').focus({ preventScroll: true });
        },
        options,
      );
    });
    addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape' || !host.classList.contains('tp-has-open')) return;
        const open = panels.findIndex((p) => p.classList.contains('is-open'));
        set(null);
        panels[open]?.querySelector('.tp-hit').focus({ preventScroll: true });
      },
      options,
    );

    // Landscape columns: shrink the titles so the longest fits its column, resting and closed
    const intro = host.querySelector('.landing-intro');
    const fit = () => {
      const landscape = innerWidth > innerHeight;
      // Portrait: the bands start just below the question, however many lines it takes
      const below = intro
        ? intro.getBoundingClientRect().bottom - host.getBoundingClientRect().top
        : 0;
      if (below > 0)
        host.style.setProperty('--tp-top', `${Math.max(214, Math.round(below + 28))}px`);
      if (!landscape) {
        root.style.removeProperty('--tp-rest');
        root.style.removeProperty('--tp-closed');
        return;
      }
      const widest = Math.max(...panels.map((p) => p.querySelector('.tp-title').offsetWidth));
      if (!widest) return;
      const width = root.clientWidth;
      root.style.setProperty('--tp-rest', Math.min(0.46, (width / 5 - 48) / widest).toFixed(3));
      root.style.setProperty('--tp-closed', Math.min(0.34, (width / 8.9 - 36) / widest).toFixed(3));
    };
    fit();
    addEventListener('resize', fit, options);
    document.fonts?.ready.then(fit);
    set(null);

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
      root.remove();
      host.style.removeProperty('--tp-top');
      host.classList.remove('tp-active', 'tp-has-open');
      teardown = () => {};
    };
  }

  return { mount, destroy: () => teardown() };
})();
