/* Overlay thumb: no native gutter or painted track beside the page. */
(() => {
  if (!matchMedia('(pointer: fine)').matches) return;
  const thumb = document.createElement('div');
  thumb.className = 'page-scroll-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  document.body.append(thumb);
  let queued = false;
  function update() {
    queued = false;
    const root = document.documentElement;
    const max = root.scrollHeight - innerHeight;
    const locked =
      root.classList.contains('intro-scroll-locked') ||
      root.classList.contains('project-dialog-open') ||
      getComputedStyle(root).overflowY === 'hidden';
    thumb.hidden = max < 2 || locked;
    // Complementary golden-ratio thumb: 38.2% of the viewport.
    const phi = (1 + Math.sqrt(5)) / 2;
    const height = innerHeight * (1 - 1 / phi);
    thumb.style.height = height + 'px';
    thumb.style.transform = `translateY(${max > 0 ? (scrollY / max) * (innerHeight - height) : 0}px)`;
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(document.body);
  new MutationObserver(schedule).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  thumb.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    const start = event.clientY,
      scroll = scrollY;
    const ratio =
      (document.documentElement.scrollHeight - innerHeight) / (innerHeight - thumb.offsetHeight);
    const move = (e) =>
      scrollTo({ top: scroll + (e.clientY - start) * ratio, behavior: 'instant' });
    const end = () => {
      thumb.removeEventListener('pointermove', move);
      thumb.removeEventListener('pointerup', end);
      thumb.removeEventListener('pointercancel', end);
    };
    thumb.addEventListener('pointermove', move);
    thumb.addEventListener('pointerup', end);
    thumb.addEventListener('pointercancel', end);
  });
  document.documentElement.classList.add('overlay-page-scroll');
  update();
})();
