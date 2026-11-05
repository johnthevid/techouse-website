/** Local staff guidance. No AI service, inquiry data transmission or automatic publishing. */
window.TechouseStaffHelper = (() => {
  const icon = (name) => window.TechouseIcons.icon(name);
  const clip = `<svg viewBox="0 0 100 120" aria-hidden="true" class="staff-helper-mascot"><path d="M70 39v48c0 17-12 25-25 25S22 101 22 87V32C22 13 36 6 49 6s27 10 27 26v47c0 12-7 20-17 20S43 92 43 81V38" fill="none" stroke="#d5bb80" stroke-width="11" stroke-linecap="round"/><path d="M70 39v48c0 17-12 25-25 25S22 101 22 87V32C22 13 36 6 49 6s27 10 27 26v47c0 12-7 20-17 20S43 92 43 81V38" fill="none" stroke="#fff2c8" stroke-width="3" stroke-linecap="round"/><g class="staff-helper-eyes"><ellipse cx="34" cy="36" rx="17" ry="19" fill="#fffdf4" stroke="#214a38" stroke-width="2"/><ellipse cx="69" cy="40" rx="17" ry="19" fill="#fffdf4" stroke="#214a38" stroke-width="2"/><ellipse cx="38" cy="38" rx="7" ry="9" fill="#214a38"/><ellipse cx="65" cy="42" rx="7" ry="9" fill="#214a38"/></g><path d="M23 13q12-8 23 0M59 16q12-6 22 5" stroke="#214a38" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  const guides = {
    projects: {
      name: 'Add a project',
      route: '/office/projects',
      steps: [
        {
          title: 'Start a separate project',
          text: 'Use Add project to start a new entry. Check that the editor says Add a project, rather than editing an existing story.',
          target: '#project-editor-title',
        },
        {
          title: 'Enter approved facts',
          text: 'Fill in the title, location, capacity and description. Use approved project facts and keep reference examples clearly labelled.',
          target: '#project-editor',
        },
        {
          title: 'Add project photos',
          text: 'Choose authorised JPEG, PNG or WebP photos. This editor supports up to three images. Review the previews and captions.',
          target: '[data-project-upload]',
        },
        {
          title: 'Review publication and save',
          text: 'Check the draft/published choice before saving. Draft projects do not appear on the public website. Only save once you have reviewed the content.',
          target: '#project-editor button[type="submit"]',
        },
      ],
    },
    inquiries: {
      name: 'Review inquiries',
      route: '/office/inquiries',
      steps: [
        {
          title: 'Find the request',
          text: 'Search by name, email or location, or choose Awaiting review. This prototype stores inquiries in this browser; live email delivery is not connected.',
          target: '#inquiry-search',
        },
        {
          title: 'Open the right inquiry',
          text: () =>
            document.querySelector('[data-view-inquiry]')
              ? 'Check the sender and location, then click View inquiry. Review contact details and requirements before following up.'
              : 'There are no inquiries in this browser yet. Once a demo request exists, its View inquiry button appears here. The guide does not create customer records.',
          target: () =>
            document.querySelector('[data-view-inquiry]') ? '[data-view-inquiry]' : '.inquiry-list',
        },
        {
          title: 'Plan your follow-up',
          text: 'Confirm the customer’s requirements and any proposed visit directly with them. A demo request or preferred date does not confirm a booking. Close the inquiry when finished.',
          target: () =>
            document.querySelector('#modal[open]') ? '#modal .inquiry-detail' : '.inquiry-list',
        },
      ],
    },
    delete: {
      name: 'Delete an inquiry safely',
      route: '/office/inquiries',
      steps: [
        {
          title: 'Identify the correct record',
          text: 'Check the sender and location first. Open the inquiry if you need to confirm which request it is.',
          target: '.inquiry-list',
        },
        {
          title: 'Request deletion yourself',
          text: () =>
            document.querySelector('[data-delete-inquiry]')
              ? 'The Delete button opens a confirmation. Only click it for a record you intend to remove. The helper does not click it for you.'
              : 'There are no inquiries to delete in this browser. When records exist, each card has a Delete button. I will not add or remove records for this demo.',
          target: () =>
            document.querySelector('[data-delete-inquiry]')
              ? '[data-delete-inquiry]'
              : '.inquiry-list',
        },
        {
          title: 'Read the confirmation',
          text: 'Review the deletion message. Cancel if you are unsure. Confirm deletion only when you intend to remove the record. Deleting an inquiry cannot be undone through this guide.',
          target: () => (document.querySelector('#modal[open]') ? '#modal' : '.inquiry-list'),
        },
      ],
    },
    text: {
      name: 'Change text or images',
      route: '/office/customizer',
      steps: [
        {
          title: 'Choose the website section',
          text: 'Select the content group you want to change. These controls edit the supported fields within the current templates.',
          target: '#website-customizer',
        },
        {
          title: 'Review before saving',
          text: 'Edit the approved wording or choose an authorised image. Review the preview and change summary. Save changes updates the shared content; Discard changes abandons unsaved edits.',
          target: '.customizer-savebar',
        },
      ],
    },
  };
  let host,
    panel,
    tour,
    step = 0,
    open = false,
    lastFocus,
    ring,
    observer,
    raf,
    messages = [];
  function esc(v) {
    return String(v).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  }
  function active() {
    return !!window.TechouseAdmin && location.hash.startsWith('#/office');
  }
  function clearRing() {
    ring?.remove();
    ring = null;
  }
  function render() {
    if (!host) return;
    const guide = guides[tour],
      current = guide?.steps[step];
    panel.hidden = !open;
    host.querySelector('.staff-helper-launcher').setAttribute('aria-expanded', String(open));
    if (!open) {
      panel.replaceChildren();
      clearRing();
      cancelAnimationFrame(raf);
      return;
    }
    panel.innerHTML = `<header><div><strong>Tip</strong><small>Your back-office guide</small></div><button type="button" data-helper="close" aria-label="Minimise staff helper">${icon('close')}</button></header><div class="staff-helper-content">${
      guide
        ? `<div class="staff-helper-step-label">${esc(guide.name)} · Step ${step + 1} of ${guide.steps.length}</div><h2 tabindex="-1">${esc(current.title)}</h2><p>${esc(typeof current.text === 'function' ? current.text() : current.text)}</p><p class="staff-helper-target-note" role="status"></p><div class="staff-helper-tour-actions"><button data-helper="back" ${step === 0 ? 'disabled' : ''}>Back</button><button class="button" data-helper="next">${step === guide.steps.length - 1 ? 'Finish guide' : 'Next step'}</button></div><button class="staff-helper-link" data-helper="end">Exit guide</button>`
        : `<div class="staff-helper-welcome">${clip}<div><h2>A little help?</h2><p>Choose a task. I’ll show you the actual controls, one step at a time.</p></div></div><div class="staff-helper-topics">${Object.entries(
            guides,
          )
            .map(
              ([id, g]) =>
                `<button data-guide="${id}">${esc(g.name)} ${icon('arrow_outward')}</button>`,
            )
            .join(
              '',
            )}</div>${messages.length ? `<div class="staff-helper-messages" aria-live="polite">${messages.map((m) => `<p><strong>${m.user ? 'You' : 'Tip'}:</strong> ${esc(m.text)}</p>`).join('')}</div>` : ''}<form id="staff-helper-question"><label for="staff-helper-input">What do you need help with?</label><div><input id="staff-helper-input" maxlength="400" placeholder="How do I add a project?" autocomplete="off"><button type="submit" aria-label="Ask staff helper">${icon('arrow_forward')}</button></div></form><p class="staff-helper-disclosure">Guided demo. No AI service connected. Your question stays in this page.</p>`
    }</div>`;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => highlight(true));
  }
  function highlight(scroll = false) {
    clearRing();
    for (const key of ['left', 'right', 'top', 'bottom']) panel?.style.removeProperty(key);
    if (!open || !tour || !active()) return;
    // Native modal dialogs stay above the helper. Allow the user to finish or cancel them first.
    if (document.querySelector('dialog[open]')) return;
    const current = guides[tour].steps[step];
    const selector = typeof current.target === 'function' ? current.target() : current.target;
    const el = document.querySelector(selector),
      note = panel.querySelector('.staff-helper-target-note');
    if (!el || !el.getClientRects().length) {
      if (note)
        note.textContent =
          'This control is not currently visible. Follow the instructions, or continue to the next step.';
      return;
    }
    if (note) note.textContent = 'Highlighted on your page. You stay in control.';
    if (scroll) {
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight)
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    const r = el.getBoundingClientRect();
    ring = document.createElement('div');
    ring.className = 'staff-helper-highlight';
    ring.setAttribute('aria-hidden', 'true');
    ring.style.left = Math.max(0, r.left - 4) + 'px';
    ring.style.top = Math.max(0, r.top - 4) + 'px';
    ring.style.width = Math.min(innerWidth - Math.max(0, r.left - 4), r.width + 8) + 'px';
    ring.style.height = Math.min(innerHeight - Math.max(0, r.top - 4), r.height + 8) + 'px';
    document.body.append(ring);
    // Put the guide beside the highlighted control where space allows, otherwise use a screen corner.
    panel.style.removeProperty('left');
    panel.style.removeProperty('top');
    panel.style.removeProperty('right');
    panel.style.removeProperty('bottom');
    if (innerWidth >= 900) {
      const w = 340,
        h = panel.offsetHeight;
      let x = r.right + 18;
      if (x + w > innerWidth - 16) x = r.left - w - 18;
      if (x < 16) x = innerWidth - w - 16;
      let y = Math.max(16, Math.min(r.top, innerHeight - h - 16));
      if (x < r.right && x + w > r.left && y < r.bottom && y + h > r.top)
        y = r.top >= h + 24 ? r.top - h - 12 : Math.max(16, innerHeight - h - 16);
      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }
  function start(id) {
    if (!guides[id]) return;
    tour = id;
    step = 0;
    open = true;
    location.hash = '#' + guides[id].route;
    render();
    panel.querySelector('h2')?.focus({ preventScroll: true });
  }
  function mount() {
    if (!active()) {
      host?.remove();
      host = null;
      panel = null;
      tour = null;
      open = false;
      observer?.disconnect();
      observer = null;
      clearRing();
      return;
    }
    if (!host) {
      host = document.createElement('aside');
      host.id = 'staff-helper';
      host.setAttribute('aria-label', 'Staff guidance');
      host.innerHTML = `<button class="staff-helper-launcher" aria-label="Open Tip staff helper" aria-expanded="false" aria-controls="staff-helper-panel">${clip}<span>Need a hand?</span></button><section id="staff-helper-panel" role="region" aria-label="Tip staff helper" hidden></section>`;
      document.body.append(host);
      panel = host.querySelector('#staff-helper-panel');
      host.addEventListener('click', (e) => {
        const topic = e.target.closest('[data-guide]');
        if (topic) {
          start(topic.dataset.guide);
          return;
        }
        if (e.target.closest('.staff-helper-launcher')) {
          lastFocus = document.activeElement;
          open = !open;
          render();
          if (open) panel.querySelector('button')?.focus();
          else clearRing();
          return;
        }
        const action = e.target.closest('[data-helper]')?.dataset.helper;
        if (action === 'close') {
          open = false;
          clearRing();
          render();
          lastFocus?.isConnected && lastFocus.focus();
        }
        if (action === 'next') {
          if (step < guides[tour].steps.length - 1) step++;
          else tour = null;
          render();
        }
        if (action === 'back' && step > 0) {
          step--;
          render();
        }
        if (action === 'end') {
          tour = null;
          clearRing();
          render();
        }
      });
      host.addEventListener('submit', (e) => {
        if (e.target.id !== 'staff-helper-question') return;
        e.preventDefault();
        const input = host.querySelector('#staff-helper-input').value.trim();
        if (!input) return;
        const q = input.toLowerCase();
        const id =
          /delet|remov/.test(q) && /inquir|request/.test(q)
            ? 'delete'
            : /inquir|request|customer/.test(q)
              ? 'inquiries'
              : /project|portfolio/.test(q) && !/delet|remov/.test(q)
                ? 'projects'
                : /text|image|photo|word|page/.test(q)
                  ? 'text'
                  : null;
        if (id) {
          start(id);
          return;
        }
        messages = [
          ...messages,
          { user: true, text: input },
          {
            user: false,
            text: 'I can guide project entries, text and images, and reviewing or deleting inquiries. Choose a task above to start a walkthrough.',
          },
        ].slice(-6);
        render();
      });
      observer = new MutationObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => highlight());
      });
      observer.observe(document.querySelector('#main'), { childList: true, subtree: true });
    }
    render();
  }
  document.addEventListener(
    'click',
    (e) => {
      if (!tour || !open || e.target.closest('#staff-helper')) return;
      const match = guides[tour].steps[step].advanceOn;
      if (match && e.target.closest(match)) {
        step = Math.min(step + 1, guides[tour].steps.length - 1);
        setTimeout(() => render(), 0);
      }
    },
    true,
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open && !document.querySelector('dialog[open]')) {
      open = false;
      clearRing();
      render();
      host?.querySelector('.staff-helper-launcher').focus();
    }
  });
  window.addEventListener('resize', () => highlight());
  document.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => highlight());
    },
    true,
  );
  return { mount };
})();
