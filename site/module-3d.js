/**
 * Prefabrication: an animated 3D view of the standard precast module, drawn to scale
 * (7.2 × 3.6 × 3 m, 15 cm walls, 12 cm roof) on a canvas with a small built-in 3D
 * projection: no 3D library and no CSS 3D, so it renders the same in every browser.
 * The whole model turns (slow sway, or drag); dimension labels are plain text placed
 * over it and always stay upright, facing the viewer. Stacks to three storeys on request.
 * Holds still under reduced motion and pauses while off-screen or hidden.
 */
'use strict';
window.TechouseModule3D = (() => {
  // Dimensions in metres.
  const L = 7.2;
  const W = 3.6;
  const H = 3;
  const WALL = 0.15;
  const ROOF = 0.12;
  const OVERHANG_END = 0.3;
  const CANOPY = 0.5;
  let teardown = () => {};

  // An axis-aligned block between two corners; kind sets its colour.
  const box = (x0, y0, z0, x1, y1, z1, kind) => ({ x0, y0, z0, x1, y1, z1, kind });
  // One module: floor slab, two long walls and the roof slab, open at both ends.
  // Pieces meet edge to edge (no overlaps), so faces never fight each other.
  function moduleBoxes(level) {
    const y = level * H;
    return [
      box(-L / 2, y, -W / 2, L / 2, y + WALL, W / 2, 'floor'),
      box(-L / 2, y + WALL, W / 2 - WALL, L / 2, y + H - ROOF, W / 2, 'wall-front'),
      box(-L / 2, y + WALL, -W / 2, L / 2, y + H - ROOF, -W / 2 + WALL, 'wall-back'),
      box(
        -L / 2 - OVERHANG_END,
        y + H - ROOF,
        -W / 2 - CANOPY,
        L / 2 + OVERHANG_END,
        y + H,
        W / 2 + CANOPY,
        'roof',
      ),
    ];
  }
  // The six faces of a block, each with its outward normal.
  function faces(b) {
    const { x0, y0, z0, x1, y1, z1 } = b;
    return [
      {
        n: [0, 1, 0],
        p: [
          [x0, y1, z0],
          [x1, y1, z0],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
      },
      {
        n: [0, -1, 0],
        p: [
          [x0, y0, z0],
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y0, z0],
        ],
      },
      {
        n: [0, 0, 1],
        p: [
          [x0, y0, z1],
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y0, z1],
        ],
      },
      {
        n: [0, 0, -1],
        p: [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y1, z0],
          [x0, y1, z0],
        ],
      },
      {
        n: [1, 0, 0],
        p: [
          [x1, y0, z0],
          [x1, y0, z1],
          [x1, y1, z1],
          [x1, y1, z0],
        ],
      },
      {
        n: [-1, 0, 0],
        p: [
          [x0, y0, z0],
          [x0, y1, z0],
          [x0, y1, z1],
          [x0, y0, z1],
        ],
      },
    ].map((f) => ({ ...f, kind: b.kind }));
  }
  // Concrete, with the room's interior (inner wall faces, roof underside) in shadow.
  function baseColour(face) {
    if (face.kind === 'floor' && face.n[1] === 1) return [176, 170, 158];
    const inner =
      (face.kind === 'wall-front' && face.n[2] === -1) ||
      (face.kind === 'wall-back' && face.n[2] === 1) ||
      (face.kind === 'roof' && face.n[1] === -1);
    return inner ? [104, 99, 91] : [222, 217, 205];
  }

  function mount(host) {
    teardown();
    if (!host) return;
    host.insertAdjacentHTML(
      'afterbegin',
      `<div class="m3d-stage"><canvas aria-hidden="true"></canvas><div class="m3d-labels" aria-hidden="true">
        <span class="m3d-label" data-anchor="length">7.2 m</span>
        <span class="m3d-label" data-anchor="width">3.6 m</span>
        <span class="m3d-label" data-anchor="height">3 m</span>
        <span class="m3d-label m3d-note" data-anchor="note">15 cm walls · 12 cm roof</span>
        <span class="m3d-label m3d-storeys" data-anchor="storeys">Up to 3 storeys</span>
      </div></div>`,
    );
    const stage = host.querySelector('.m3d-stage');
    const canvas = stage.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const labels = [...stage.querySelectorAll('.m3d-label')];
    const toggle = host.querySelector('[data-m3d-stack]');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const levels = [0, 1, 2].map((level) => ({ level, boxes: moduleBoxes(level) }));
    // Labels sit along the edges facing the camera (sx, sz: which side it is on).
    const anchorFor = (key, sx, sz) =>
      ({
        length: [0, -0.2, sz * (W / 2 + CANOPY + 0.5)],
        width: [sx * (L / 2 + OVERHANG_END + 0.8), -0.2, 0],
        height: [-sx * (L / 2 + OVERHANG_END + 0.7), H / 2, sz * (W / 2)],
        note: [-sx * (L / 2 - 0.8), H + 0.8, sz * (W / 2)],
        storeys: [0, 3 * H + 0.9, 0],
      })[key];
    let yaw = -0.6;
    let elevation = 0.42;
    let stack = 0; // 0 = one module, 1 = three storeys (animated between)
    let target = 0;
    let drag = null;
    let visible = false;
    let frame = 0;
    let last = 0;
    let t = 0;
    let size = { w: 0, h: 0 };

    // Camera: orbit by yaw (around the vertical axis) and elevation (looking down).
    const DIST = 26;
    const rotate = ([x, y, z], view) => {
      const cy = Math.cos(view.yaw);
      const sy = Math.sin(view.yaw);
      const ce = Math.cos(view.elevation);
      const se = Math.sin(view.elevation);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      return [x1, y * ce - z1 * se, y * se + z1 * ce];
    };
    function project([x, y, z], view) {
      const cam = rotate([x, y - view.centre, z], view);
      const k = view.focal / (DIST - cam[2]);
      return { x: view.cx + cam[0] * k, y: view.cy - cam[1] * k, cam };
    }
    const LIGHT = (() => {
      const v = [-0.35, 0.8, 0.5];
      const m = Math.hypot(...v);
      return v.map((c) => c / m);
    })();

    function draw() {
      if (!size.w) return;
      const ease = stack * stack * (3 - 2 * stack);
      const view = {
        yaw,
        elevation,
        // Frame one module, or zoom out to the three-storey stack.
        focal: (Math.min(size.w * 0.72, size.h * 1.15) * DIST) / 9.5 / (1 + ease * 0.75),
        centre: H / 2 + ease * H,
        cx: size.w / 2,
        cy: size.h * 0.5,
      };
      ctx.clearRect(0, 0, size.w, size.h);
      // Soft ground shadow under the footprint.
      const g = project([0, 0, 0], view);
      const r = Math.max(40, (size.w * 0.3) / (1 + ease * 0.75));
      const shadow = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      shadow.addColorStop(0, 'rgba(23,59,48,0.2)');
      shadow.addColorStop(1, 'rgba(23,59,48,0)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, r, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Camera position in model space, for ordering blocks and placing labels.
      const ce = Math.cos(elevation);
      const camera = [
        -DIST * ce * Math.sin(yaw),
        DIST * Math.sin(elevation) + view.centre,
        DIST * ce * Math.cos(yaw),
      ];
      // Gather every shown block, lifted by its drop-in offset.
      const blocks = [];
      for (const { level, boxes } of levels) {
        const shown = level === 0 ? 1 : Math.max(0, Math.min(1, ease * 2 - (level - 1) * 0.6));
        if (shown <= 0) continue;
        const drop = (1 - shown) * 3.2;
        for (const b of boxes)
          blocks.push({ ...b, y0: b.y0 + drop, y1: b.y1 + drop, alpha: shown });
      }
      // Blocks never overlap, so a plane always separates any two of them: the one on
      // the camera's side of that plane is nearer. Paint far blocks first.
      const axes = [
        ['x0', 'x1', 0],
        ['y0', 'y1', 1],
        ['z0', 'z1', 2],
      ];
      const behind = (a, b) => {
        for (const [lo, hi, i] of axes) {
          if (a[hi] <= b[lo]) return camera[i] > b[lo];
          if (b[hi] <= a[lo]) return camera[i] < a[lo];
        }
        return false;
      };
      const order = [];
      const state = new Map();
      const visit = (b) => {
        if (state.get(b)) return;
        state.set(b, 1);
        for (const other of blocks) if (other !== b && behind(other, b)) visit(other);
        order.push(b);
      };
      blocks.forEach(visit);
      // Within a convex block, front faces never overlap, so any order works.
      const polys = [];
      for (const b of order)
        for (const f of faces(b)) {
          const pts = f.p.map((point) => project(point, view));
          const n = rotate(f.n, view);
          const c = pts.reduce((acc, q) => acc.map((v, i) => v + q.cam[i] / 4), [0, 0, 0]);
          // Back-face cull against the camera at (0, 0, DIST).
          if (-n[0] * c[0] - n[1] * c[1] + n[2] * (DIST - c[2]) <= 0) continue;
          const lit = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
          const light = 0.62 + 0.38 * Math.max(0, lit);
          polys.push({
            pts,
            alpha: b.alpha,
            rgb: baseColour(f).map((v) => Math.round(v * light)),
          });
        }
      ctx.lineJoin = 'round';
      for (const p of polys) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        p.pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        ctx.closePath();
        ctx.fillStyle = `rgb(${p.rgb.join(',')})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(23,59,48,0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Labels: plain upright text placed at their projected points.
      for (const el of labels) {
        const key = el.dataset.anchor;
        const q = project(
          anchorFor(key, Math.sign(camera[0]) || 1, Math.sign(camera[2]) || 1),
          view,
        );
        // Keep every label inside the frame, whatever the angle.
        const hw = el.offsetWidth / 2 + 8;
        const hh = el.offsetHeight / 2 + 8;
        const x = Math.max(hw, Math.min(size.w - hw, q.x));
        const y = Math.max(hh, Math.min(size.h - hh, q.y));
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        el.classList.toggle(
          'is-hidden',
          (key === 'storeys' && ease < 0.95) || (key === 'note' && ease > 0.05),
        );
      }
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(2, devicePixelRatio || 1);
      size = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    const running = () => visible && !document.hidden && !calm.matches;
    const tick = (now) => {
      frame = 0;
      const dt = last ? Math.min(64, now - last) / 1000 : 0.016;
      last = now;
      if (!drag) {
        t += dt;
        yaw = -0.6 + Math.sin(t * 0.45) * 0.34;
      }
      stack += (target - stack) * Math.min(1, dt * 4.5);
      if (Math.abs(target - stack) < 0.001) stack = target;
      draw();
      if (running()) frame = requestAnimationFrame(tick);
    };
    const play = () => {
      if (!frame && running()) {
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
    watcher.observe(stage);
    const sizer = new ResizeObserver(resize);
    sizer.observe(stage);
    document.addEventListener(
      'visibilitychange',
      () => (document.hidden ? stop() : play()),
      options,
    );
    calm.addEventListener(
      'change',
      () => {
        if (calm.matches) {
          stop();
          draw();
        } else play();
      },
      options,
    );

    // Drag turns the whole model; the sway resumes from where it was left.
    stage.addEventListener(
      'pointerdown',
      (event) => {
        drag = { x: event.clientX, y: event.clientY, yaw, elevation };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      },
      options,
    );
    stage.addEventListener(
      'pointermove',
      (event) => {
        if (!drag) return;
        yaw = drag.yaw + (event.clientX - drag.x) * 0.008;
        elevation = Math.max(
          0.08,
          Math.min(1.1, drag.elevation + (event.clientY - drag.y) * 0.005),
        );
        draw();
      },
      options,
    );
    const release = () => {
      if (!drag) return;
      drag = null;
      stage.classList.remove('is-dragging');
      // Continue the sway from the dragged angle, without a jump.
      const s = Math.max(-1, Math.min(1, (yaw + 0.6) / 0.34));
      t = Math.asin(s) / 0.45;
      if (Math.abs((yaw + 0.6) / 0.34) > 1) yaw = -0.6 + Math.sign(yaw + 0.6) * 0.34;
    };
    stage.addEventListener('pointerup', release, options);
    stage.addEventListener('pointercancel', release, options);

    toggle?.addEventListener(
      'click',
      () => {
        target = target ? 0 : 1;
        toggle.setAttribute('aria-pressed', String(Boolean(target)));
        toggle.querySelector('span').textContent = target
          ? 'Show one module'
          : 'Stack to 3 storeys';
        if (running()) play();
        else {
          stack = target;
          draw();
        }
      },
      options,
    );
    resize();
    teardown = () => {
      stop();
      watcher.disconnect();
      sizer.disconnect();
      controller.abort();
      teardown = () => {};
    };
  }

  return { mount, destroy: () => teardown() };
})();
