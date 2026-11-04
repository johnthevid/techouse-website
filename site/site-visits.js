/** Demo scheduling foundation. Replace the adapter with server availability/request endpoints at launch.
 * Preferred times are not reservations. No staff calendar is connected and no notification is sent.
 */
window.TechouseVisits = (() => {
  let currentInquiry = null;
  let currentVisit = null;
  const escape = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const key = 'techouse-demo-site-visits-v1';
  const timezone = 'Asia/Manila';
  const slots = ['09:00', '11:00', '14:00', '16:00']; // Illustrative preferences, not staff availability.
  const today = () => {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const get = (type) => parts.find((part) => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  const day = (value) => new Date(value + 'T00:00:00Z');
  const iso = (value) => value.toISOString().slice(0, 10);
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = day(value),
      start = day(today());
    return (
      Number.isFinite(+date) &&
      iso(date) === value &&
      date > start &&
      date <= new Date(+start + 90 * 86400000) &&
      ![0, 6].includes(date.getUTCDay())
    );
  }
  const adapter = {
    async request({ inquiryId, date, time }) {
      if (!inquiryId || !validDate(date) || !slots.includes(time))
        throw Error('Choose a future weekday and a preferred time.');
      let records;
      try {
        records = JSON.parse(localStorage.getItem(key) || '[]');
      } catch {
        throw Error('Your saved visit requests could not be read. Please try again.');
      }
      if (!Array.isArray(records)) throw Error('Your saved visit requests could not be read.');
      const existing = records.find((r) => r?.inquiryId === inquiryId && r.status === 'requested');
      const record = {
        id: existing?.id || crypto.randomUUID(),
        inquiryId,
        date,
        time,
        timezone,
        status: 'requested',
        demo: true,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = existing
        ? records.map((r) => (r?.id === existing.id ? record : r))
        : [...records, record];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        throw Error('This browser could not save your request. Nothing has been booked.');
      }
      return record;
    },
  };
  function open(button) {
    const host = button.closest('.success, dialog');
    if (!host || host.querySelector('.visit-card')) {
      host?.querySelector('.visit-card')?.focus();
      return;
    }
    const card = document.createElement('section');
    card.className = 'visit-card';
    card.tabIndex = -1;
    card.innerHTML = `<span class="eyebrow">LET’S TAKE A CLOSER LOOK</span><h3>Request a site visit</h3><p>Choose a day and time that suit you. The team will need to confirm your visit.</p><p class="solar-confirmation-note">Demo calendar · sample times · Philippine time (UTC+8). No live availability.</p><form><div class="visit-month"><button type="button" data-month="-1" aria-label="Previous month">←</button><strong aria-live="polite"></strong><button type="button" data-month="1" aria-label="Next month">→</button></div><div class="visit-calendar" role="group" aria-label="Preferred visit date"></div><fieldset><legend>Preferred time</legend><div class="visit-times">${slots.map((s) => `<label><input type="radio" name="time" value="${s}" required><span>${s}</span></label>`).join('')}</div></fieldset><p data-selected aria-live="polite">Select a future weekday, then a time.</p><p data-error role="alert"></p><div class="modal-actions"><button class="button" type="submit">Done · save visit request</button><button class="button outline" type="button" data-cancel-visit>Cancel</button></div></form>`;
    // Keep the confirmation intact in the left column while the calendar opens beside it.
    let confirmation = host.querySelector('.visit-confirmation-column');
    if (!confirmation) {
      confirmation = document.createElement('div');
      confirmation.className = 'visit-confirmation-column';
      for (const child of [...host.childNodes]) {
        if (child.nodeType === 1 && child.classList.contains('modal-close')) continue;
        confirmation.append(child);
      }
      host.append(confirmation);
    }
    const before = host.getBoundingClientRect();
    button.hidden = true;
    host.classList.add('has-visit-card');
    host.append(card);
    if (host.tagName === 'DIALOG')
      host.addEventListener('close', () => host.classList.remove('has-visit-card'), { once: true });
    button.setAttribute('aria-expanded', 'true');
    // Animate explicit outer dimensions so centering and text reflow move together.
    // The final width is already laid out; only the shell and calendar enter.
    const animateLayout = (start = before) => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const after = host.getBoundingClientRect();
      host.animate(
        [
          { width: `${start.width}px`, height: `${start.height}px` },
          { width: `${after.width}px`, height: `${after.height}px` },
        ],
        { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' },
      );
      if (card.isConnected)
        card.animate(
          [
            { opacity: 0, transform: 'translateX(32px)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
    };
    let month = day(today());
    month.setUTCDate(1);
    let selected = '';
    const form = card.querySelector('form');
    function render() {
      card.querySelector('.visit-month strong').textContent = month.toLocaleDateString('en-PH', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
      const first = new Date(month),
        offset = first.getUTCDay();
      card.querySelector('.visit-calendar').innerHTML =
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
          .map((d) => `<span aria-hidden="true">${d}</span>`)
          .join('') +
        Array.from({ length: 42 }, (_, i) => {
          const date = new Date(first);
          date.setUTCDate(1 - offset + i);
          const value = iso(date);
          return `<button type="button" data-date="${value}" ${!validDate(value) || date.getUTCMonth() !== month.getUTCMonth() ? 'disabled' : ''} aria-pressed="${value === selected}" aria-label="${date.toLocaleDateString('en-PH', { dateStyle: 'full', timeZone: 'UTC' })}">${date.getUTCDate()}</button>`;
        }).join('');
      const start = day(today());
      start.setUTCDate(1);
      card.querySelector('[data-month="-1"]').disabled = +month <= +start;
      const end = new Date(+day(today()) + 90 * 86400000);
      end.setUTCDate(1);
      card.querySelector('[data-month="1"]').disabled = +month >= +end;
    }
    card.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-month]'),
        date = e.target.closest('[data-date]');
      if (nav) {
        month.setUTCMonth(month.getUTCMonth() + Number(nav.dataset.month));
        render();
      }
      if (date && !date.disabled) {
        selected = date.dataset.date;
        render();
        // Rendering replaces the date buttons; retain the user's keyboard position.
        card.querySelector(`[data-date="${selected}"]`)?.focus({ preventScroll: true });
        card.querySelector('[data-selected]').textContent =
          'Preferred date: ' +
          day(selected).toLocaleDateString('en-PH', { dateStyle: 'long', timeZone: 'UTC' });
      }
      if (e.target.closest('[data-cancel-visit]')) closeCalendar();
    });
    let closing = false;
    async function closeCalendar() {
      if (closing) return;
      closing = true;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        await card.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(28px)' },
          ],
          { duration: 220, easing: 'ease-in', fill: 'forwards' },
        ).finished;
      const expanded = host.getBoundingClientRect();
      card.remove();
      host.classList.remove('has-visit-card');
      button.hidden = false;
      button.setAttribute('aria-expanded', 'false');
      if (!confirmation.querySelector('[data-visit-recommendation]')) {
        const note = document.createElement('p');
        note.dataset.visitRecommendation = '';
        note.className = 'solar-confirmation-note';
        note.textContent =
          'A site visit is recommended to check your roof and refine your estimate. You can request one when you’re ready.';
        confirmation.append(note);
      }
      animateLayout(expanded);
      button.focus({ preventScroll: true });
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const record = await adapter.request({
          inquiryId: button.dataset.inquiryId,
          date: selected,
          time: new FormData(form).get('time'),
        });
        currentVisit = record;
        // Go directly to the ticket after a successful save, without a second Done step.
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
          await card.animate(
            [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: 'translateY(36px)' },
            ],
            { duration: 240, easing: 'ease-in', fill: 'forwards' },
          ).finished;
        showTicket(button);
      } catch (error) {
        card.querySelector('[data-error]').textContent = error.message;
        submit.disabled = false;
      }
    });
    render();
    animateLayout();
    card.focus({ preventScroll: true });
    if (matchMedia('(max-width: 800px)').matches)
      card.scrollIntoView({
        block: 'nearest',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  }
  // Business hours are evaluated from submission time in Manila, independently of the visitor's timezone.
  function callbackTiming(timestamp) {
    const instant = new Date(timestamp);
    if (!Number.isFinite(+instant))
      return 'Expect a call during business hours, Monday–Friday, 9am–5pm Philippine time.';
    const local = new Date(+instant + 8 * 3600000);
    const weekday = local.getUTCDay(),
      hour = local.getUTCHours();
    if (weekday > 0 && weekday < 6 && hour >= 9 && hour < 17)
      return 'Expect a call from our customer representative shortly.';
    if (!(weekday > 0 && weekday < 6 && hour < 9)) local.setUTCDate(local.getUTCDate() + 1);
    while ([0, 6].includes(local.getUTCDay())) local.setUTCDate(local.getUTCDate() + 1);
    const date = local.toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    return `Expect a call during our next business hours: ${date}, 9am–5pm Philippine time.`;
  }
  function showTicket(button) {
    const host = button.closest('dialog, .success');
    if (!host) return;
    // Recover the saved record if the in-memory context was lost; never silently ignore Done.
    const reference = button.dataset.inquiryId;
    let q = currentInquiry?.id === reference ? currentInquiry : null;
    if (!q) {
      try {
        q = JSON.parse(localStorage.getItem('techouse.sample.inquiries.v1') || '[]').find(
          (item) => item.id === reference,
        );
      } catch {
        /* Keep the existing confirmation if browser storage is unavailable. */
      }
    }
    if (!q) {
      const message = document.createElement('p');
      message.setAttribute('role', 'alert');
      message.textContent =
        'Your saved reference could not be loaded. Please close this preview and submit the demo again.';
      host.append(message);
      return;
    }
    const visit = currentVisit?.inquiryId === q.id ? currentVisit : null;
    host.classList.remove('has-visit-card');
    host.classList.add('ticket-only');
    host.innerHTML = `${host.tagName === 'DIALOG' ? '<button type="button" class="modal-close" aria-label="Close request ticket">×</button>' : ''}<article class="request-ticket" tabindex="-1"><span class="eyebrow">YOUR SOLAR REQUEST</span><p class="ticket-reference">Reference <strong>${escape(q.id)}</strong></p><h2 id="${host.tagName === 'DIALOG' ? 'modal-title' : 'request-ticket-title'}">${escape(callbackTiming(q.createdAt))}</h2>${visit ? `<p class="ticket-visit"><strong>Preferred site visit</strong><br>${escape(visit.date)} · ${escape(visit.time)} Philippine time<br><small>Awaiting confirmation</small></p>` : ''}<p class="ticket-demo">Demo only — saved in this browser. No inquiry sent or call booked.</p><div class="modal-actions">${host.tagName === 'DIALOG' ? '<button type="button" class="button" data-stay>Close ticket</button>' : '<a class="button" href="#/divisions/solar">Back to solar</a>'}<a class="button outline" href="#/divisions/solar?section=projects">See how much others are saving ↗</a></div></article>`;
    syncCompletedPage(q, host.querySelector('.request-ticket'));
    const ticket = host.querySelector('.request-ticket');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      ticket.animate(
        [
          { opacity: 0, transform: 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 520, easing: 'ease-out' },
      );
    ticket.focus({ preventScroll: true });
    host.scrollTop = 0;
  }
  function syncCompletedPage(q, ticket) {
    const page = document.querySelector('#inquiry-form-area .success');
    if (!page) return;
    if (document.querySelector('#saved-inquiry-history')) {
      window.TechouseInquiry.showInquiryOverview();
      window.TechouseInquiry.showSavedInquiry(q);
      return;
    }
    const summary = document.createElement('div');
    summary.innerHTML = window.TechouseSolarExtras.confirmationMarkup(q.solarSavings, escape(q.id));
    summary.querySelector('.solar-confirmation-demo')?.remove();
    if (currentVisit?.inquiryId === q.id) summary.querySelector('[data-request-visit]')?.remove();
    const copy = ticket.cloneNode(true);
    copy.querySelector('h2')?.removeAttribute('id');
    copy.querySelector('.modal-actions')?.remove();
    page.classList.remove('has-visit-card', 'ticket-only');
    page.replaceChildren(summary, copy);
    renderProjectPreviews();
  }
  let projectSlideshowTimer;
  function renderProjectPreviews() {
    clearInterval(projectSlideshowTimer);
    const aside = document.querySelector('.contact-grid .contact-aside');
    if (!aside) return;
    aside.closest('.contact-grid').classList.add('inquiry-workspace');
    aside.dataset.originalContact ||= aside.innerHTML;
    const sector = currentInquiry?.solarSector;
    const labels = {
      residential: 'Residential',
      commercial: 'Commercial',
      industrial: 'Industrial',
    };
    const selected = labels[sector] ? sector : '';
    const records = (
      window.TechouseContent?.snapshot().projects ||
      window.TechousePortfolioSamples ||
      []
    )
      .filter(
        (p) => p.status !== 'draft' && (!selected || (p.sector || 'residential') === selected),
      )
      .map((p) => window.TechousePortfolio.presentationProject(p));
    // The examples replace the contact sidebar after saving, rather than adding a full-width row.
    document.querySelector('#completed-solar-projects')?.remove();
    const projects = document.createElement('section');
    projects.id = 'completed-solar-projects';
    projects.className = 'inquiry-project-slideshow';
    projects.setAttribute('aria-label', `${labels[selected] || 'Solar'} project examples`);
    projects.setAttribute('aria-roledescription', 'carousel');
    const portfolio =
      '#/divisions/solar?section=projects' + (selected ? `&sector=${selected}` : '');
    projects.innerHTML = `<span class="eyebrow">KEEP EXPLORING</span><h2>See solar in action.</h2><p>Explore installations ${selected ? 'for properties like yours' : 'across different property types'}. Reference examples are not Techouse work.</p><div class="inquiry-project-window"><div class="inquiry-project-track">${
      records
        .map((p, i) => {
          const image = /^(assets\/|data:image\/(jpeg|png|webp);base64,)/.test(p.image || '')
            ? p.image
            : 'assets/solar.jpg';
          return `<article class="inquiry-project-slide" aria-roledescription="slide" aria-label="${i + 1} of ${records.length}"><img src="${escape(image)}" alt="${escape(p.title)}" loading="${i ? 'lazy' : 'eager'}" width="800" height="500"><div><span>${p.reference ? 'REFERENCE EXAMPLE' : p.sample ? 'ILLUSTRATIVE SAMPLE' : 'SOLAR PROJECT'}</span><h3>${escape(p.title)}</h3><p>${escape(p.capacity)} · ${escape(p.location)}</p>${p.provider ? `<p class="visual-note">Reference credit: ${escape(p.provider)}</p>` : ''}${window.TechousePortfolio.savingsDetail(p)}<a class="text-link" href="#/divisions/solar/projects/${encodeURIComponent(p.id)}">View project details ↗</a></div></article>`;
        })
        .join('') || '<p>No published projects in this sector yet.</p>'
    }</div></div>${records.length > 1 ? '<div class="inquiry-project-controls"><button type="button" data-slide="-1" aria-label="Previous project">←</button><span data-slide-position></span><button type="button" data-slide="1" aria-label="Next project">→</button><button type="button" data-slide-pause aria-pressed="false">Pause slideshow</button></div>' : ''}<a class="button outline" href="${portfolio}">Explore all solar projects ↗</a>`;
    const related = document.createElement('details');
    related.className = 'inquiry-related-projects';
    related.innerHTML =
      '<summary>Explore similar solar projects <span aria-hidden="true">＋</span></summary>';
    related.append(projects);
    if (document.body.classList.contains('inquiry-inline-details')) aside.replaceChildren(projects);
    else aside.replaceChildren(related);
    if (!records.length) return;
    let index = 0;
    let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const track = projects.querySelector('.inquiry-project-track');
    const slides = [...track.children];
    const pause = projects.querySelector('[data-slide-pause]');
    function show(next) {
      index = (next + records.length) % records.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      slides.forEach((slide, i) => {
        slide.inert = i !== index;
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      const status = projects.querySelector('[data-slide-position]');
      if (status) status.textContent = `${index + 1} / ${records.length}`;
    }
    function syncPause() {
      if (!pause) return;
      pause.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
      pause.setAttribute('aria-pressed', String(paused));
    }
    projects.addEventListener('click', (event) => {
      const arrow = event.target.closest('[data-slide]');
      if (arrow) show(index + Number(arrow.dataset.slide));
      if (event.target.closest('[data-slide-pause]')) {
        paused = !paused;
        syncPause();
      }
    });
    show(0);
    syncPause();
    if (records.length > 1)
      projectSlideshowTimer = setInterval(() => {
        if (!projects.isConnected) {
          clearInterval(projectSlideshowTimer);
          return;
        }
        const bounds = projects.getBoundingClientRect();
        if (
          !paused &&
          !document.hidden &&
          bounds.bottom > 0 &&
          bounds.top < innerHeight &&
          !projects.matches(':hover, :focus-within')
        )
          show(index + 1);
      }, 6000);
  }
  document.addEventListener(
    'click',
    (event) => {
      if (event.target.closest('[data-completed-projects]')) {
        document.querySelector('#completed-solar-projects')?.scrollIntoView({
          block: 'start',
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
        return;
      }
      const ticket = event.target.closest('[data-show-ticket]');
      if (ticket) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showTicket(ticket);
        return;
      }
      const button = event.target.closest('[data-request-visit]');
      if (button) {
        event.preventDefault();
        open(button);
      }
    },
    { capture: true },
  );
  return {
    adapter,
    validDate,
    timezone,
    callbackTiming,
    renderProjectPreviews,
    clearProjectPreviews() {
      clearInterval(projectSlideshowTimer);
      const aside = document.querySelector('.contact-grid .contact-aside');
      if (aside?.dataset.originalContact) aside.innerHTML = aside.dataset.originalContact;
    },
    restoreSavedVisit(host, q) {
      if (!currentVisit || currentVisit.inquiryId !== q.id) return;
      host.querySelector('[data-request-visit]')?.remove();
      host.querySelector('.inquiry-next-step')?.remove();
      const card = [...document.querySelectorAll('[data-review-inquiry]')].find(
        (button) => button.dataset.reviewInquiry === q.id,
      );
      if (card)
        card.querySelector('.saved-card-status').textContent = 'Site visit requested · demo';
      const note = document.createElement('section');
      note.className = 'ticket-visit';
      const date = new Date(currentVisit.date + 'T00:00:00Z');
      const dateLabel = Number.isFinite(+date)
        ? date.toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })
        : currentVisit.date;
      note.innerHTML = `<span class="eyebrow">YOUR SITE VISIT</span><h3>${escape(dateLabel)} <span>· ${escape(currentVisit.time)}</span></h3><p>Philippine time · preferred schedule</p><p class="visit-saved-note">Saved as a demo preference. No visit is booked or confirmed.</p>`;
      (host.querySelector('.inquiry-ticket-body') || host).append(note);
    },
    setInquiry(q) {
      currentInquiry = q;
      try {
        const visits = JSON.parse(localStorage.getItem(key) || '[]');
        currentVisit = Array.isArray(visits)
          ? visits.find((v) => v?.inquiryId === q.id && v.status === 'requested') || null
          : null;
      } catch {
        currentVisit = null;
      }
    },
  };
})();
