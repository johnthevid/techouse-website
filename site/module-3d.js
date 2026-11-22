/**
 * Prefabrication: an animated 3D view of the standard precast module, drawn to scale
 * (7.2 × 3.6 × 3 m, 15 cm walls, 12 cm roof) with CSS 3D transforms. No 3D library.
 * It sways slowly, can be dragged to rotate, and stacks to three storeys on request.
 * Holds still under reduced motion and pauses while off-screen or hidden.
 */
'use strict';
window.TechouseModule3D = (() => {
  const M = 34; // pixels per metre
  const L = 7.2 * M;
  const W = 3.6 * M;
  const H = 3 * M;
  const WALL = Math.max(5, 0.15 * M);
  const ROOF = Math.max(4, 0.12 * M);
  let teardown = () => {};

  // One flat face of the scene; x, y, z are the face centre (y up), sizes in px.
  const face = (cls, w, h, transform) =>
    `<div class="m3d-face ${cls}" style="width:${w}px;height:${h}px;transform:translate(-50%,-50%) ${transform}"></div>`;

  // A solid block (used for the walls and the roof slab), centred at x, y, z.
  function block(cls, x, y, z, lx, ly, lz, inner = 0) {
    const at = `translate3d(${x}px,${-y}px,${z}px)`;
    return `<div class="m3d-block ${cls}">${[
      face('m3d-top', lx, lz, `${at} translateY(${-ly / 2}px) rotateX(90deg)`),
      face(
        cls === 'm3d-roof' ? 'm3d-inner' : 'm3d-bottom',
        lx,
        lz,
        `${at} translateY(${ly / 2}px) rotateX(90deg)`,
      ),
      face(inner === 1 ? 'm3d-inner' : 'm3d-side', lx, ly, `${at} translateZ(${lz / 2}px)`),
      face(inner === -1 ? 'm3d-inner' : 'm3d-side', lx, ly, `${at} translateZ(${-lz / 2}px)`),
      face('m3d-end', lz, ly, `${at} translateX(${lx / 2}px) rotateY(90deg)`),
      face('m3d-end', lz, ly, `${at} translateX(${-lx / 2}px) rotateY(90deg)`),
    ].join('')}</div>`;
  }

  // The module: floor, two long walls and the roof slab, open at both ends.
  function module(level) {
    const y0 = level * H;
    return `<div class="m3d-module" data-level="${level}">${[
      block('m3d-floor', 0, y0 + WALL / 2, 0, L, WALL, W),
      block('m3d-wall', 0, y0 + H / 2, W / 2 - WALL / 2, L, H - ROOF, WALL, -1),
      block('m3d-wall', 0, y0 + H / 2, -W / 2 + WALL / 2, L, H - ROOF, WALL, 1),
      block('m3d-roof', 0, y0 + H - ROOF / 2, 0, L + 0.6 * M, ROOF, W + 1 * M),
    ].join('')}</div>`;
  }

  // Dimension labels sit on the scene's edges and turn with it.
  const label = (text, x, y, z, cls = '') =>
    `<span class="m3d-label ${cls}" data-x="${x}" data-y="${y}" data-z="${z}">${text}</span>`;

  function markup() {
    return `<div class="m3d-stage" aria-hidden="true"><div class="m3d-scene">
      <div class="m3d-ground" style="width:${L + 4 * M}px;height:${W + 4 * M}px;transform:translate(-50%,-50%) rotateX(90deg)"></div>
      ${module(0)}${module(1)}${module(2)}
      ${label('7.2 m', 0, -14, W / 2 + 30, 'm3d-length')}
      ${label('3.6 m', L / 2 + 34, -14, 0, 'm3d-width')}
      ${label('3 m', -L / 2 - 28, H / 2, W / 2 + 8, 'm3d-height')}
      ${label('15 cm walls · 12 cm roof', -L / 2 + 20, H + 34, W / 2, 'm3d-note')}
      ${label('Up to 3 storeys', 0, 3 * H + 40, 0, 'm3d-storeys')}
    </div></div>`;
  }

  function mount(host) {
    teardown();
    if (!host) return;
    host.insertAdjacentHTML('afterbegin', markup());
    const scene = host.querySelector('.m3d-scene');
    const toggle = host.querySelector('[data-m3d-stack]');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let yaw = -32;
    let pitch = -24;
    let drag = null;
    let visible = false;
    let frame = 0;
    let last = 0;
    let t = 0;
    const labels = [...host.querySelectorAll('.m3d-label')];
    const paint = () => {
      const stacked = host.classList.contains('is-stacked');
      scene.style.transform = `translateY(${stacked ? 96 : 20}px) scale(${stacked ? 0.72 : 1}) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
      // Labels stay on their edges but always face the viewer.
      for (const el of labels)
        el.style.transform = `translate3d(${el.dataset.x}px,${-el.dataset.y}px,${el.dataset.z}px) rotateY(${-yaw}deg) rotateX(${-pitch}deg) scale(${stacked ? 1 / 0.72 : 1}) translate(-50%,-50%)`;
    };
    // A slow sway keeps the labels readable instead of spinning the module fully round.
    const tick = (now) => {
      frame = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!drag) {
        t += dt / 1000;
        yaw = -32 + Math.sin(t * 0.45) * 18;
      }
      paint();
      if (visible && !calm.matches && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const play = () => {
      if (!frame && visible && !calm.matches && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else stop();
    });
    watcher.observe(host);
    document.addEventListener(
      'visibilitychange',
      () => (document.hidden ? stop() : play()),
      options,
    );
    calm.addEventListener('change', () => (calm.matches ? stop() : play()), options);

    // Drag to turn the module; the sway resumes from where it was left.
    const stage = host.querySelector('.m3d-stage');
    stage.addEventListener(
      'pointerdown',
      (event) => {
        drag = { x: event.clientX, y: event.clientY, yaw, pitch };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      },
      options,
    );
    stage.addEventListener(
      'pointermove',
      (event) => {
        if (!drag) return;
        yaw = drag.yaw + (event.clientX - drag.x) * 0.4;
        pitch = Math.max(-60, Math.min(-6, drag.pitch - (event.clientY - drag.y) * 0.25));
        paint();
      },
      options,
    );
    const release = () => {
      if (!drag) return;
      drag = null;
      stage.classList.remove('is-dragging');
      t = Math.asin(Math.max(-1, Math.min(1, (yaw + 32) / 18))) / 0.45 || 0;
    };
    stage.addEventListener('pointerup', release, options);
    stage.addEventListener('pointercancel', release, options);

    toggle?.addEventListener(
      'click',
      () => {
        const stacked = !host.classList.contains('is-stacked');
        host.classList.toggle('is-stacked', stacked);
        toggle.setAttribute('aria-pressed', String(stacked));
        toggle.querySelector('span').textContent = stacked
          ? 'Show one module'
          : 'Stack to 3 storeys';
        paint();
      },
      options,
    );
    paint();
    teardown = () => {
      stop();
      watcher.disconnect();
      controller.abort();
      teardown = () => {};
    };
  }

  return { mount, destroy: () => teardown() };
})();
