/**
 * Solar progress, energy comparisons, expandable explanations, and the post-inquiry portfolio prompt.
 * Energy examples use explicit sample assumptions; the project section remains a preview.
 */
window.TechouseSolarExtras = (() => {
  let controller;
  const iconAC = window.TechouseIcons.icon('ac_unit');
  const iconEV = window.TechouseIcons.icon('electric_car');
  // ENERGY EQUIVALENTS: each example uses all estimated generation separately; they are alternatives, not additive loads.
  function updateEnergy(form, generation) {
    const result = document.querySelector('#estimate-result');
    if (!result) return;
    const energy = document.createElement('details');
    energy.className = 'energy-equivalents';
    const daily = generation / 30;
    energy.innerHTML = `<summary>Want to see what this energy means in everyday life?</summary><h4>Your energy, in familiar terms</h4><p>About <strong>${daily.toFixed(1)} kWh a day</strong> on average over a 30-day month. For scale, that is equivalent to either:</p><div class="energy-examples"><article>${iconAC}<div><strong>${(daily / Math.max(1, Math.ceil(daily / 24))).toFixed(1)} hours per day${daily > 24 ? ' each' : ''}</strong><span>${daily > 24 ? Math.ceil(daily / 24) + ' window-type air conditioners, each averaging 1 kW' : 'One window-type air conditioner averaging 1 kW'}. Across the assumed 30-day month: about ${(generation / Math.max(1, Math.ceil(daily / 24))).toFixed(0)} hours${daily > 24 ? ' per unit' : ''} in total. This compares energy, not guaranteed daily runtime.</span></div></article><article>${iconEV}<div><strong>${(generation / 60).toFixed(1)} battery-equivalents / month</strong><span>An EV with a 60 kWh battery</span></div></article></div><details><summary>How to read these comparisons</summary><p></p><ul class="comparison-notes"><li><strong>Time period:</strong> estimated monthly generation divided across 30 days. Daily output will vary.</li><li><strong>Air conditioner:</strong> assumes an average 1 kW draw. For example, 432 kWh equals 432 total operating hours, or 14.4 hours per day averaged over 30 days.</li><li><strong>EV:</strong> assumes a 60 kWh battery. Charging losses are not included.</li><li><strong>Separate examples:</strong> each uses all the estimated energy. Do not add the examples together.</li><li><strong>Not a runtime promise:</strong> direct daytime supply, night use, simultaneous loads, and outage backup depend on system design, storage, and actual conditions.</li></ul><p></p></details>`;
    result.querySelector('.estimate-metrics').after(energy);
  }
  // Ease coarse mouse-wheel steps; touch, trackpads, nested panels and reduced motion remain native.
  function weightedScroll(signal) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(pointer: fine)');
    let frame = 0,
      target = scrollY,
      lastWritten = scrollY,
      previousTime = 0;
    const limit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      target = scrollY;
    }
    function tick(time) {
      const elapsed = Math.min(32, Math.max(1, time - previousTime));
      previousTime = time;
      target = Math.max(0, Math.min(limit(), target));
      const distance = target - scrollY;
      if (Math.abs(distance) < 0.6) {
        window.scrollTo({ top: target, behavior: 'instant' });
        frame = 0;
        return;
      }
      window.scrollTo({
        top: scrollY + distance * (1 - Math.exp(-elapsed / 180)),
        behavior: 'instant',
      });
      lastWritten = scrollY;
      frame = requestAnimationFrame(tick);
    }
    window.addEventListener(
      'wheel',
      (event) => {
        if (
          event.defaultPrevented ||
          reduced.matches ||
          !finePointer.matches ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
          document.querySelector('dialog[open]')
        ) {
          stop();
          return;
        }
        if (event.deltaMode === 0 && Math.abs(event.deltaY) < 40) {
          stop();
          return;
        }
        for (
          let node = event.target instanceof Element ? event.target : null;
          node && node !== document.body;
          node = node.parentElement
        ) {
          if (
            node.matches('input,textarea,select,[contenteditable="true"]') ||
            (/(auto|scroll)/.test(getComputedStyle(node).overflowY) &&
              node.scrollHeight > node.clientHeight + 1)
          ) {
            stop();
            return;
          }
        }
        const delta =
          event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1);
        if (!delta) return;
        if (!frame) target = scrollY;
        const next = Math.max(0, Math.min(limit(), target + delta * 0.95));
        if (next === target) return;
        event.preventDefault();
        target = next;
        if (!frame) {
          previousTime = performance.now();
          lastWritten = scrollY;
          frame = requestAnimationFrame(tick);
        }
      },
      { passive: false, signal },
    );
    window.addEventListener(
      'scroll',
      () => {
        if (frame && Math.abs(scrollY - lastWritten) > 2) stop();
      },
      { passive: true, signal },
    );
    window.addEventListener('pointerdown', stop, { passive: true, signal });
    window.addEventListener(
      'keydown',
      (event) => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key))
          stop();
      },
      { signal },
    );
    reduced.addEventListener('change', stop, { signal });
    signal.addEventListener('abort', stop, { once: true });
  }
  function mount() {
    controller?.abort();
    controller = new AbortController();
    const options = { signal: controller.signal };
    const disclosures = new WeakMap();
    document.addEventListener(
      'click',
      (event) => {
        const summary = event.target.closest(
          '#solar-estimator details > summary, .solar-optional-guide > summary',
        );
        if (!summary || event.defaultPrevented || event.button !== 0) return;
        const details = summary.parentElement;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        event.preventDefault();
        const previous = disclosures.get(details),
          opening = previous ? !previous.opening : !details.open,
          start = details.getBoundingClientRect().height;
        previous?.animation.cancel();
        details.style.height = '';
        details.style.overflow = 'hidden';
        details.open = true;
        let end;
        if (opening) {
          end = details.getBoundingClientRect().height;
        } else {
          details.open = false;
          end = details.getBoundingClientRect().height;
          details.open = true;
        }
        const animation = details.animate([{ height: start + 'px' }, { height: end + 'px' }], {
          duration: 280,
          easing: 'cubic-bezier(.2,.7,.2,1)',
        });
        disclosures.set(details, { animation, opening });
        animation.finished
          .then(() => {
            details.open = opening;
            details.style.height = '';
            details.style.overflow = '';
            disclosures.delete(details);
          })
          .catch(() => {});
      },
      options,
    );
    const article = document.querySelector('.division-experience'),
      nav = document.querySelector('.division-subnav');
    if (!article || !document.querySelector('#solar-estimator') || !nav) return;
    weightedScroll(controller.signal);
    const links = document.createElement('div');
    links.className = 'solar-subnav-links';
    while (nav.firstChild) links.append(nav.firstChild);
    nav.append(links);
    const call = document.createElement('a');
    call.className = 'button small solar-subnav-call';
    call.href = 'tel:+639855626888';
    call.setAttribute('aria-label', 'Call Techouse at +63 985 562 6888');
    call.innerHTML = window.TechouseIcons.icon('call') + '<span>Call us</span>';
    call.inert = true;
    call.setAttribute('aria-hidden', 'true');
    nav.append(call);
    const headerCall = document.querySelector('#header .header-call');
    function syncCall() {
      const bounds = headerCall?.getBoundingClientRect();
      const visible =
        bounds &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.bottom > 0 &&
        bounds.top < innerHeight;
      const show = !visible;
      nav.classList.toggle('solar-call-visible', show);
      call.inert = !show;
      call.setAttribute('aria-hidden', String(!show));
    }
    let framePending = false;
    function update() {
      syncCall();
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!framePending) {
          framePending = true;
          requestAnimationFrame(() => {
            framePending = false;
            if (article.isConnected) update();
          });
        }
      },
      { ...options, passive: true },
    );
    window.addEventListener('resize', update, options);
    update();
    const disclaimer = document.querySelector('.estimate-disclaimer');
    if (disclaimer) {
      const panel = document.createElement('details');
      panel.className = 'estimate-disclaimer estimate-notes';
      panel.innerHTML =
        '<summary>Indicative estimate only · final pricing needs a site review. <span>See assumptions</span></summary><div><p><b>How we estimate</b>4 peak sun hours per day · 80% system efficiency · 30 days per month · budget range ±15%.</p><p><b>How energy is counted</b>Assumes generation can be used on site. No export credits are included.</p><p><b>What we still need to check</b>Roof suitability, shade, permits, electrical upgrades, actual tariffs, and battery sizing.</p></div>';
      disclaimer.replaceWith(panel);
    }
    if (new URLSearchParams(location.hash.split('?')[1]).get('section') === 'projects')
      requestAnimationFrame(() => {
        document.querySelector('#projects').scrollIntoView({ behavior: 'instant' });
        update();
      });
  }
  // Shared by the saved confirmation and dialog. Savings come from the carried estimate, not free text.
  function confirmationMarkup(savings, reference, modal = false) {
    const amount = Number(savings);
    const hasSavings = Number.isFinite(amount) && amount > 0;
    const money = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    });
    const title = hasSavings
      ? `You’re a step closer to saving <strong class="solar-savings-amount">${money.format(amount)}<span>per month</span></strong>`
      : 'You’re a step closer to a solar-powered future.';
    return `<span class="eyebrow">YOUR NEXT STEP STARTS HERE</span><h2${modal ? ' id="modal-title"' : ''} class="solar-confirmation-title">${title}</h2><p class="solar-confirmation-intro">Let’s find the right solar setup for your property.</p>${hasSavings ? '<p class="solar-confirmation-note">Potential savings based on your estimate. Subject to a site and usage review.</p>' : ''}<div class="modal-actions"><button class="button" type="button" data-request-visit data-inquiry-id="${reference}" aria-expanded="false">Request a site visit</button></div><p class="solar-confirmation-demo">Demo saved · ${reference}<br>No inquiry sent or callback booked. Live service: a representative will contact you to discuss your property.</p>`;
  }
  // Entrance belongs to the dialog and its fading backdrop; no whole-page wipe.
  function revealConfirmation(update) {
    update();
  }
  // Called only after a successful local demo save. Do not imply a live inquiry or scheduled callback.
  function afterInquiry(division, savings, reference = '') {
    if (division !== 'solar') return;
    window.TechouseVisits?.renderProjectPreviews();
    const dialog = document.querySelector('#modal');
    dialog.innerHTML =
      '<button class="modal-close" type="button" aria-label="Close solar confirmation">×</button>' +
      confirmationMarkup(savings, reference, true);
    const lifecycle = new AbortController();
    let leaving = false;
    dialog.classList.remove('ticket-only', 'has-visit-card');
    dialog.classList.add('project-dialog');
    dialog.showModal();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce)
      dialog.animate(
        [
          { opacity: 0, transform: 'translateY(-42px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 620, delay: 100, fill: 'backwards', easing: 'cubic-bezier(.22,.61,.36,1)' },
      );
    async function leave(destination) {
      if (leaving) return;
      leaving = true;
      dialog.classList.add('is-leaving');
      if (!reduce)
        await dialog.animate(
          [
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(8px) scale(.985)' },
          ],
          { duration: 220, easing: 'ease-in' },
        ).finished;
      dialog.close();
      if (destination) location.hash = destination;
    }
    dialog.addEventListener(
      'click',
      (event) => {
        const close = event.target.closest('.modal-close,[data-stay]'),
          link = event.target.closest('a[href]');
        if (close || link) {
          event.preventDefault();
          event.stopPropagation();
          leave(link?.getAttribute('href'));
        }
      },
      { signal: lifecycle.signal },
    );
    dialog.addEventListener(
      'cancel',
      (event) => {
        event.preventDefault();
        leave();
      },
      { signal: lifecycle.signal },
    );
    dialog.addEventListener(
      'close',
      () => {
        lifecycle.abort();
        dialog.classList.remove('project-dialog', 'is-leaving', 'ticket-only', 'has-visit-card');
      },
      { once: true },
    );
  }
  return { mount, updateEnergy, afterInquiry, confirmationMarkup, revealConfirmation };
})();
