/** Back office: stored inquiries (manage and follow up) and the Traffic & leads report.
 * Signed-in staff read the shared database; the local prototype reads this browser's demo records.
 */
window.TechouseInsights = (() => {
  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const icon = (name) => window.TechouseIcons.icon(name);
  const live = () => !!window.TechouseAdmin;
  const localKey = 'techouse.sample.inquiries.v1';
  const statuses = [
    ['new', 'New'],
    ['contacted', 'Contacted'],
    ['qualified', 'Qualified'],
    ['won', 'Won'],
    ['closed', 'Closed'],
    ['spam', 'Spam'],
  ];
  const statusName = (id) => statuses.find(([s]) => s === id)?.[1] || 'New';
  const divisionNames = {
    solar: 'Solar energy',
    construction: 'Construction',
    prefabrication: 'Prefabrication',
    development: 'Real estate development',
    elevators: 'Elevator engineering',
  };
  // Partner applications (Be a partner page) share the inbox with project inquiries.
  const isPartner = (q) => q.topic === 'partnership';
  const kind = (q) => (isPartner(q) ? 'Partner application' : divisionNames[q.division] || 'Project');
  const number = new Intl.NumberFormat('en-PH');
  const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });
  const manila = (options) =>
    new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options });
  const shortDate = manila({ month: 'short', day: 'numeric' });
  const fullDate = manila({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const dateTime = manila({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const clock = manila({ hour: 'numeric', minute: '2-digit' });
  function ago(value) {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return '';
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    return days < 7 ? `${days} d ago` : shortDate.format(time);
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Data ----------
  async function api(path, options = {}) {
    const response = await fetch('/api/' + path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        'X-CSRF-Token': window.TechouseAdmin?.csrf || '',
      },
    });
    const value = await response.json().catch(() => ({}));
    if (response.status === 401) {
      location.href = '/admin';
      throw Error('Your session has ended. Please sign in again.');
    }
    if (!response.ok) throw Error(value.error || 'The server could not complete this request.');
    return value;
  }
  let records = null,
    recordsError = '',
    recordsPromise = null,
    recordsAt = 0;
  function readLocal() {
    try {
      const list = JSON.parse(localStorage.getItem(localKey) || '[]');
      return Array.isArray(list) ? list.filter((q) => q && typeof q.id === 'string') : [];
    } catch {
      return [];
    }
  }
  function normalize(q) {
    return {
      ...q,
      status: statuses.some(([s]) => s === q.status) ? q.status : 'new',
      seenAt: q.seenAt || q.reviewedAt || null,
      note: q.note || '',
      channel: q.channel || (live() ? 'Direct' : 'Browser demo'),
    };
  }
  const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  function load(force = false) {
    if (!live()) {
      records = readLocal().map(normalize).sort(byNewest);
      return Promise.resolve(records);
    }
    if (recordsPromise) return recordsPromise;
    if (!force && records && Date.now() - recordsAt < 15000) return Promise.resolve(records);
    recordsPromise = api('admin/inquiries')
      .then((value) => {
        records = value.inquiries.map(normalize);
        recordsError = '';
        recordsAt = Date.now();
        return records;
      })
      .catch((error) => {
        recordsError = error.message;
        records ||= [];
        return records;
      })
      .finally(() => (recordsPromise = null));
    return recordsPromise;
  }
  async function update(id, patch) {
    if (live()) {
      const { inquiry } = await api('admin/inquiries/update', {
        method: 'POST',
        body: JSON.stringify({ id, ...patch }),
      });
      records = records.map((q) => (q.id === id ? normalize(inquiry) : q));
      return;
    }
    const now = new Date().toISOString();
    const next = readLocal().map((q) =>
      q.id === id
        ? {
            ...q,
            ...(patch.status ? { status: patch.status } : {}),
            ...(patch.note !== undefined ? { note: patch.note } : {}),
            ...(patch.seen && !q.reviewedAt ? { reviewedAt: now } : {}),
          }
        : q,
    );
    localStorage.setItem(localKey, JSON.stringify(next));
    records = next.map(normalize).sort(byNewest);
  }
  async function remove(id) {
    if (live())
      await api('admin/inquiries/delete', { method: 'POST', body: JSON.stringify({ id }) });
    else localStorage.setItem(localKey, JSON.stringify(readLocal().filter((q) => q.id !== id)));
    records = records.filter((q) => q.id !== id);
  }

  let report = null,
    reportError = '',
    reportDays = 30,
    reportPromise = null;
  function loadReport(days = reportDays) {
    reportDays = days;
    if (!live()) return Promise.resolve(null);
    reportPromise = api('admin/analytics?days=' + days)
      .then((value) => {
        report = value;
        reportError = '';
        return value;
      })
      .catch((error) => {
        reportError = error.message;
        return null;
      });
    return reportPromise;
  }

  // ---------- Shared pieces ----------
  function bars(
    rows,
    { tone = 'visitors', total, empty = 'Nothing recorded in this period.' } = {},
  ) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    if (!rows.length || rows.every((r) => !r.value)) return `<p class="ix-empty">${esc(empty)}</p>`;
    return `<ol class="ix-bars" data-tone="${tone}">${rows
      .map(
        (r) =>
          `<li title="${esc(r.label)}: ${number.format(r.value)}${total ? ` (${pct(r.value, total)})` : ''}"><span class="ix-bar-label">${esc(r.label)}</span><span class="ix-bar-track"><span class="ix-bar" style="width:${Math.max(r.value ? 1.5 : 0, (r.value / max) * 100).toFixed(2)}%"></span></span><span class="ix-bar-value">${number.format(r.value)}${r.extra ? `<small>${r.extra}</small>` : ''}</span></li>`,
      )
      .join('')}</ol>`;
  }
  function pct(part, whole) {
    if (!whole) return '0%';
    const value = (part / whole) * 100;
    return (value > 0 && value < 1 ? value.toFixed(1) : Math.round(value)) + '%';
  }
  function delta(now, before, label) {
    if (!before && !now) return `<span class="ix-delta">No change from the ${label}</span>`;
    if (!before) return `<span class="ix-delta">New this period · none in the ${label}</span>`;
    const change = Math.round(((now - before) / before) * 100);
    const dir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    return `<span class="ix-delta" data-direction="${dir}">${dir === 'flat' ? '' : icon(dir === 'up' ? 'arrow_upward' : 'arrow_downward')}${change > 0 ? '+' : ''}${change}% vs the ${label}</span>`;
  }
  function panel(title, note, body, extra = '') {
    return `<section class="ix-panel${extra}"><header><h2>${title}</h2>${note ? `<p>${note}</p>` : ''}</header>${body}</section>`;
  }

  // ---------- Overview ----------
  function overview(ctx) {
    const root = document.querySelector('#office-overview-live');
    if (!root) return;
    const draw = () => {
      if (!root.isConnected) return;
      const list = records || [];
      const week = Date.now() - 7 * 86400000;
      const awaiting = list.filter((q) => !q.seenAt && q.status !== 'spam').length;
      const recent = list.filter(
        (q) => new Date(q.createdAt) >= week && q.status !== 'spam',
      ).length;
      const visitors = report?.totals.visitors;
      root.querySelector('[data-stat="visitors"]').textContent = !live()
        ? '—'
        : visitors === undefined
          ? '…'
          : number.format(visitors);
      root.querySelector('[data-stat="recent"]').textContent = records
        ? number.format(recent)
        : '…';
      root.querySelector('[data-stat="awaiting"]').textContent = records
        ? number.format(awaiting)
        : '…';
      root.querySelector('[data-stat="visitors-note"]').textContent = !live()
        ? 'Counted on the hosted website'
        : report
          ? `${number.format(report.totals.views)} page views`
          : reportError
            ? 'Not available'
            : 'Loading';
      const latest = root.querySelector('.ix-latest');
      latest.innerHTML = recordsError
        ? `<p class="ix-error" role="alert">${esc(recordsError)}</p>`
        : list.length
          ? `<ul class="ix-latest-list">${list
              .filter((q) => q.status !== 'spam')
              .slice(0, 4)
              .map(
                (q) =>
                  `<li><a href="#/office/inquiries?id=${encodeURIComponent(q.id)}"><span class="ix-latest-name">${!q.seenAt ? '<span class="ix-unseen" aria-label="Not opened yet"></span>' : ''}${esc(q.name)}</span><span>${esc(kind(q))} · ${esc(q.location)}</span><span class="ix-status" data-status="${q.status}">${statusName(q.status)}</span><time datetime="${esc(q.createdAt)}">${esc(ago(q.createdAt))}</time></a></li>`,
              )
              .join('')}</ul>`
          : `<p class="ix-empty">No inquiries yet. Requests sent from the website’s Start a project form appear here.</p>`;
    };
    draw();
    Promise.all([load(), live() ? loadReport(7) : null]).then(draw);
    void ctx;
  }

  // ---------- Inquiries ----------
  let filter = 'all',
    search = '',
    selected = null,
    confirming = false;
  function matches(q) {
    const inFilter =
      filter === 'all'
        ? q.status !== 'spam'
        : filter === 'unseen'
          ? !q.seenAt && q.status !== 'spam'
          : filter === 'partners'
            ? isPartner(q) && q.status !== 'spam'
            : q.status === filter;
    const text = [q.name, q.email, q.phone, q.company, q.location, q.id, q.requirements]
      .join(' ')
      .toLowerCase();
    return inFilter && text.includes(search.trim().toLowerCase());
  }
  function csv(list) {
    const columns = [
      ['Reference', 'id'],
      ['Received', 'createdAt'],
      ['Status', (q) => statusName(q.status)],
      ['Type', (q) => (isPartner(q) ? 'Partner application' : 'Project inquiry')],
      ['Division', (q) => (isPartner(q) ? '' : divisionNames[q.division] || q.division)],
      ['Name', 'name'],
      ['Company', 'company'],
      ['Email', 'email'],
      ['Mobile', 'phone'],
      ['Location', 'location'],
      ['Size / capacity', 'capacity'],
      ['Requirements', 'requirements'],
      ['Solar property', 'solarSector'],
      ['Estimated monthly savings (PHP)', 'solarSavings'],
      ['Property pin', (q) => (q.site ? `${q.site.lat}, ${q.site.lng}` : '')],
      ['Roof area (m²)', (q) => (q.site?.roofArea ? Math.round(q.site.roofArea) : '')],
      ['Preferred visit', (q) => (q.visit ? `${q.visit.date} ${q.visit.time}` : '')],
      ['Source', 'channel'],
      ['Campaign', 'campaign'],
      ['Referring site', 'referrer'],
      ['Landing page', 'landing'],
      ['Notes', 'note'],
    ];
    // Prefix formula-like cells so spreadsheet apps show them as text.
    const cell = (v) => {
      let text = String(v ?? '');
      if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
      return `"${text.replaceAll('"', '""')}"`;
    };
    return [
      columns.map(([h]) => cell(h)).join(','),
      ...list.map((q) =>
        columns.map(([, k]) => cell(typeof k === 'function' ? k(q) : q[k])).join(','),
      ),
    ].join('\r\n');
  }
  function row(q) {
    return `<li><button type="button" class="ix-row" data-select-inquiry="${esc(q.id)}" aria-pressed="${q.id === selected}"><span class="ix-row-main"><strong>${!q.seenAt ? '<span class="ix-unseen" aria-label="Not opened yet"></span>' : ''}${esc(q.name)}</strong><span>${esc(q.company || q.email || q.phone)}</span></span><span class="ix-row-project">${esc(kind(q))}<span>${esc(q.location)}</span></span><span class="ix-row-source">${esc(q.channel)}${q.campaign ? `<span>${esc(q.campaign)}</span>` : ''}</span><time datetime="${esc(q.createdAt)}" title="${esc(dateTime.format(new Date(q.createdAt)))}">${esc(ago(q.createdAt))}</time><span class="ix-status" data-status="${q.status}">${statusName(q.status)}</span></button></li>`;
  }
  // PROPERTY PIN: where the customer pinned the property and, optionally, outlined the roof.
  function site(pin) {
    if (!pin) return '';
    const P = window.TechousePropertyPin;
    const key = window.TechouseContent?.snapshot().settings?.googleMapsKey;
    const coords = `${Number(pin.lat).toFixed(6)}, ${Number(pin.lng).toFixed(6)}`;
    const from =
      pin.source === 'gps'
        ? `from the customer’s phone at the property${pin.accuracy ? ` (±${Math.round(pin.accuracy)} m)` : ''}`
        : 'placed by the customer on the map';
    const roof = pin.roof?.length
      ? `${pin.roof.length} corners · ≈ ${Math.round(pin.roofArea)} m² · about ${P ? P.panels(pin.roofArea) : '–'} panels at 620 W`
      : '';
    const image =
      key && P
        ? `<a class="ix-site-map" href="${esc(P.mapsLink(pin.lat, pin.lng))}" target="_blank" rel="noopener"><img src="${esc(P.staticMap(pin, 640, 400))}" alt="Satellite view of the pinned property${roof ? ' with the roof outline' : ''}" width="640" height="400" loading="lazy"></a>`
        : '';
    return `<section class="ix-site"><h3>Property</h3><div class="ix-site-body">${image}<div><dl class="ix-facts"><div><dt>Pin</dt><dd>${esc(coords)} <small>${esc(from)}</small></dd></div>${roof ? `<div><dt>Roof outline</dt><dd>${esc(roof)}</dd></div>` : ''}</dl><div class="ix-site-actions"><a class="button small" href="${esc(P ? P.mapsLink(pin.lat, pin.lng) : `https://www.google.com/maps/search/?api=1&query=${coords}`)}" target="_blank" rel="noopener">Open in Google Maps ${icon('arrow_outward')}</a><button type="button" class="button outline small" data-copy-coordinates="${esc(coords)}">Copy coordinates</button></div></div></div></section>`;
  }
  function detail(q) {
    if (!q)
      return `<div class="ix-detail-empty"><h2>Select an inquiry</h2><p>Choose a request to see the full brief, contact details and where the visitor came from. Set a status as you follow up so the team knows what is in progress.</p></div>`;
    const fact = (label, value) => (value ? `<div><dt>${label}</dt><dd>${value}</dd></div>` : '');
    const sector = { residential: 'Home', commercial: 'Business', industrial: 'Industrial' }[
      q.solarSector
    ];
    return `<article class="ix-detail" aria-labelledby="ix-detail-name"><button type="button" class="ix-back text-link" data-close-inquiry>${icon('arrow_back')} All inquiries</button><header class="ix-detail-head"><div><h2 id="ix-detail-name" tabindex="-1">${esc(q.name)}</h2><p>${esc(q.id)} · Received ${esc(dateTime.format(new Date(q.createdAt)))}</p></div><label class="ix-status-field">Status<select data-inquiry-status>${statuses
      .map(
        ([id, label]) =>
          `<option value="${id}" ${q.status === id ? 'selected' : ''}>${label}</option>`,
      )
      .join(
        '',
      )}</select></label></header><p class="ix-save-state" role="status" aria-live="polite"></p><div class="ix-contact">${q.email ? `<a class="button outline small" href="mailto:${esc(q.email)}?subject=${encodeURIComponent('Your Techouse inquiry ' + q.id)}">${icon('arrow_outward')} Email ${esc(q.email)}</a>` : ''}${q.phone ? `<a class="button outline small" href="tel:${esc(q.phone.replace(/[^+\d]/g, ''))}">${icon('call')} Call ${esc(q.phone)}</a>` : ''}</div><dl class="ix-facts">${fact(isPartner(q) ? 'Type' : 'Division', esc(isPartner(q) ? 'Solar partner application' : divisionNames[q.division] || q.division))}${fact('Company', esc(q.company))}${fact('Project location', esc(q.location))}${fact('Size or capacity', esc(q.capacity))}${fact('Solar property', esc(sector || ''))}${fact('Estimated savings', Number(q.solarSavings) > 0 ? `${esc(peso.format(q.solarSavings))} a month (website estimate)` : '')}${fact('Preferred site visit', q.visit ? `${esc(fullDate.format(new Date(q.visit.date + 'T12:00:00+08:00')))} · ${esc(q.visit.time)} Philippine time <small>Not yet confirmed</small>` : '')}</dl>${site(q.site)}<section class="ix-brief"><h3>${isPartner(q) ? 'Application' : 'Project requirements'}</h3><p>${esc(q.requirements)}</p></section><section class="ix-source"><h3>How they found the website</h3><dl class="ix-facts">${fact('Source', esc(q.channel))}${fact('Campaign', esc(q.campaign))}${fact('Referring site', esc(q.referrer))}${fact('First page seen', esc(q.landing))}</dl>${!q.campaign && !q.referrer && q.channel === 'Direct' ? '<p class="ix-hint">Direct visits came from a typed address, a bookmark or an app that hides where links come from.</p>' : ''}</section><form class="ix-note" data-inquiry-note><label for="ix-note-text">Team notes <small>Only staff see these.</small></label><textarea id="ix-note-text" name="note" rows="4" maxlength="2000" placeholder="Calls made, quote sent, next step…">${esc(q.note)}</textarea><div><button class="button small" type="submit">Save note</button></div></form><footer class="ix-detail-foot">${
      confirming
        ? `<p>Delete this inquiry permanently? This cannot be undone.</p><button type="button" class="button small ix-danger" data-confirm-delete-inquiry>Delete permanently</button><button type="button" class="button outline small" data-keep-inquiry>Keep inquiry</button>`
        : `<button type="button" class="text-link ix-danger-link" data-delete-stored-inquiry>Delete inquiry</button>`
    }</footer></article>`;
  }
  function inquiries() {
    const root = document.querySelector('#office-inquiries');
    if (!root) return;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    if (params.get('id')) selected = params.get('id');
    confirming = false;
    function draw(focusDetail = false) {
      if (!root.isConnected) return;
      const list = records || [];
      const counts = Object.fromEntries(
        statuses.map(([id]) => [id, list.filter((q) => q.status === id).length]),
      );
      const visible = list.filter(matches);
      const current = list.find((q) => q.id === selected) || null;
      const searchHadFocus = document.activeElement?.matches?.('[data-inquiry-search]');
      root.classList.toggle('has-selection', !!current);
      root.innerHTML = `<div class="ix-toolbar"><div class="ix-filters" role="group" aria-label="Show inquiries">${[
        ['all', 'All', list.filter((q) => q.status !== 'spam').length],
        ['unseen', 'Not opened', list.filter((q) => !q.seenAt && q.status !== 'spam').length],
        ['partners', 'Partners', list.filter((q) => isPartner(q) && q.status !== 'spam').length],
        ...statuses.map(([id, label]) => [id, label, counts[id]]),
      ]
        .map(
          ([id, label, count]) =>
            `<button type="button" data-inquiry-view="${id}" aria-pressed="${filter === id}">${label}<span>${count}</span></button>`,
        )
        .join(
          '',
        )}</div><div class="ix-toolbar-actions"><input type="search" class="search-input" data-inquiry-search aria-label="Search inquiries" placeholder="Search name, email or place" value="${esc(search)}"><button type="button" class="button outline small" data-export-inquiries ${visible.length ? '' : 'disabled'}>Download CSV</button><button type="button" class="button outline small" data-refresh-inquiries>Refresh</button></div></div>${
        recordsError
          ? `<p class="ix-error" role="alert">${esc(recordsError)} <button type="button" class="text-link" data-refresh-inquiries>Try again</button></p>`
          : ''
      }${
        live()
          ? ''
          : '<p class="ix-hint">Local workspace: these are demo requests saved in this browser. On the hosted website, inquiries are stored for the whole team.</p>'
      }<div class="ix-inbox"><div class="ix-list-wrap"><div class="ix-list-head" aria-hidden="true"><span>Name</span><span>Project</span><span>Source</span><span>Received</span><span>Status</span></div>${
        records === null
          ? '<p class="ix-empty">Loading inquiries…</p>'
          : visible.length
            ? `<ul class="ix-list">${visible.map(row).join('')}</ul>`
            : list.length
              ? '<p class="ix-empty">No inquiries match this view. Try another status or clear the search.</p>'
              : `<div class="ix-empty ix-empty-first"><h3>No inquiries yet</h3><p>When someone sends the Start a project form, their request appears here with where they came from. Share a tracked link from Traffic &amp; leads to see which posts and ads bring them.</p><a class="button small" href="#/office/traffic">Open Traffic &amp; leads</a></div>`
      }</div><div class="ix-detail-wrap">${detail(current)}</div></div>`;
      if (searchHadFocus) {
        const input = root.querySelector('[data-inquiry-search]');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
      if (focusDetail)
        root
          .querySelector('#ix-detail-name')
          ?.focus({ preventScroll: matchMedia('(min-width: 1100px)').matches });
    }
    async function open(id) {
      selected = id;
      confirming = false;
      const url = '#/office/inquiries?id=' + encodeURIComponent(id);
      if (location.hash !== url) history.replaceState(null, '', url);
      draw(true);
      const q = records?.find((item) => item.id === id);
      if (q && !q.seenAt) {
        try {
          await update(id, { seen: true });
          syncTab();
          draw();
          root.querySelector('#ix-detail-name')?.focus({ preventScroll: true });
        } catch {}
      }
    }
    root.onclick = async (event) => {
      const view = event.target.closest('[data-inquiry-view]');
      if (view) {
        filter = view.dataset.inquiryView;
        return draw();
      }
      const pick = event.target.closest('[data-select-inquiry]');
      if (pick) return open(pick.dataset.selectInquiry);
      const copy = event.target.closest('[data-copy-coordinates]');
      if (copy) {
        const say = (text) => (root.querySelector('.ix-save-state').textContent = text);
        return navigator.clipboard
          ?.writeText(copy.dataset.copyCoordinates)
          .then(() => say('Coordinates copied.'))
          .catch(() => say(`Copy failed. Coordinates: ${copy.dataset.copyCoordinates}`));
      }
      if (event.target.closest('[data-close-inquiry]')) {
        const id = selected;
        selected = null;
        history.replaceState(null, '', '#/office/inquiries');
        draw();
        root.querySelector(`[data-select-inquiry="${CSS.escape(id || '')}"]`)?.focus();
        return;
      }
      if (event.target.closest('[data-refresh-inquiries]')) {
        await load(true);
        return draw();
      }
      if (event.target.closest('[data-export-inquiries]')) {
        const blob = new Blob(['﻿' + csv(records.filter(matches))], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `techouse-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        return;
      }
      if (event.target.closest('[data-delete-stored-inquiry]')) {
        confirming = true;
        draw();
        return root.querySelector('[data-keep-inquiry]')?.focus();
      }
      if (event.target.closest('[data-keep-inquiry]')) {
        confirming = false;
        draw();
        return root.querySelector('[data-delete-stored-inquiry]')?.focus();
      }
      if (event.target.closest('[data-confirm-delete-inquiry]')) {
        const button = event.target.closest('button');
        button.disabled = true;
        try {
          await remove(selected);
          syncTab();
          selected = null;
          confirming = false;
          history.replaceState(null, '', '#/office/inquiries');
          draw();
          window.showToast?.('Inquiry deleted.');
        } catch (error) {
          button.disabled = false;
          root.querySelector('.ix-save-state').textContent = error.message;
        }
      }
    };
    root.oninput = (event) => {
      if (event.target.matches('[data-inquiry-search]')) {
        search = event.target.value;
        draw();
      }
    };
    root.onchange = async (event) => {
      if (!event.target.matches('[data-inquiry-status]')) return;
      const select = event.target,
        state = root.querySelector('.ix-save-state');
      select.disabled = true;
      state.textContent = 'Saving…';
      try {
        await update(selected, { status: select.value, seen: true });
        syncTab();
        draw();
        root.querySelector('.ix-save-state').textContent =
          `Status saved: ${statusName(select.value)}.`;
        root.querySelector('[data-inquiry-status]').focus();
      } catch (error) {
        select.disabled = false;
        state.textContent = error.message;
      }
    };
    root.onsubmit = async (event) => {
      if (!event.target.matches('[data-inquiry-note]')) return;
      event.preventDefault();
      const form = event.target,
        state = root.querySelector('.ix-save-state'),
        button = form.querySelector('button');
      button.disabled = true;
      state.textContent = 'Saving note…';
      try {
        await update(selected, { note: form.elements.note.value });
        state.textContent = 'Note saved.';
      } catch (error) {
        state.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    };
    draw();
    load().then(() => {
      const q = records.find((item) => item.id === selected);
      if (q && !q.seenAt) open(q.id);
      else draw();
    });
  }

  // ---------- Traffic & leads ----------
  const channelHelp = {
    Direct: 'Typed address, bookmark or an app that hides the link',
    Search: 'Google, Bing and other search engines',
    Social: 'Facebook, TikTok, LinkedIn and other social links',
    Referral: 'Links on other websites',
    Paid: 'Ads tagged as paid (cpc, paid, ads)',
    Email: 'Newsletters and email links',
    Campaign: 'Other tagged links, such as flyers or QR codes',
  };
  const eventLabels = [
    ['call', 'Tapped a phone number'],
    ['email', 'Clicked the email address'],
    ['viber', 'Opened Viber'],
    ['estimate', 'Got a solar estimate'],
    ['datasheet', 'Opened a product datasheet'],
    ['social', 'Followed a social link'],
  ];
  function pageList(ctx) {
    const projects = window.TechouseContent?.snapshot().projects || [];
    const published = (division) =>
      projects.filter(
        (p) => p.status === 'published' && window.TechousePortfolio.divisionOf(p) === division,
      ).length;
    const posts = ctx.posts.filter((p) => p.status === 'published').length;
    const datasheets = window.TechouseCatalogue?.datasheets().length || 0;
    const content = (count, one, many, none) =>
      count ? { text: `${count} ${count === 1 ? one : many}` } : { text: none, warn: true };
    return [
      ['/', 'Home', { text: 'Five division banners' }],
      ['/divisions', 'Our divisions', { text: 'Division directory' }],
      ...ctx.divisions.map((d) => [
        '/divisions/' + d.id,
        d.short,
        content(
          published(d.id),
          'project published',
          'projects published',
          'No projects published',
        ),
      ]),
      [
        '/divisions/solar/products/panels',
        'Solar panels',
        { text: `${datasheets} datasheets in the catalogue` },
      ],
      [
        '/divisions/solar/products/inverters',
        'Inverters',
        { text: 'Shares the catalogue datasheets' },
      ],
      [
        '/divisions/solar/products/batteries',
        'Battery storage',
        { text: 'Shares the catalogue datasheets' },
      ],
      ['/about', 'About Techouse', { text: 'Company story and office map' }],
      [
        '/updates',
        'News',
        content(posts, 'post published', 'posts published', 'No posts published'),
      ],
      [
        '/inquiry',
        'Start a project',
        { text: live() ? 'Sends to Inquiries' : 'Demo form, saves in the browser' },
      ],
    ];
  }
  function chart(data) {
    const weekly = data.daily.length > 120;
    let points = data.daily;
    if (weekly) {
      points = [];
      for (let i = 0; i < data.daily.length; i += 7) {
        const slice = data.daily.slice(i, i + 7);
        points.push({
          day: slice[0].day,
          until: slice.at(-1).day,
          views: slice.reduce((s, d) => s + d.views, 0),
          visitors: slice.reduce((s, d) => s + d.visitors, 0),
          inquiries: slice.reduce((s, d) => s + d.inquiries, 0),
        });
      }
    }
    return { points, weekly };
  }
  function ticks(max) {
    if (max <= 4) return [0, 1, 2, 3, 4].filter((t) => t <= Math.max(max, 1) || t === 0);
    const step =
      [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000].find(
        (s) => max / s <= 4,
      ) || Math.ceil(max / 4);
    const out = [];
    for (let t = 0; t <= max + step - 1; t += step) out.push(t);
    return out;
  }
  function drawSeries(host, points, key, tone, height) {
    const width = Math.max(280, host.clientWidth);
    const axis = 40,
      top = 8,
      bottom = 6;
    const max = Math.max(...points.map((p) => p[key]), 0);
    const scale = ticks(max);
    const ceiling = scale.at(-1) || 1;
    const plot = width - axis;
    const band = plot / points.length;
    const barWidth = Math.max(1, Math.min(24, band - 2));
    const y = (v) => top + (height - top - bottom) * (1 - v / ceiling);
    const radius = Math.min(4, barWidth / 2);
    const bar = (p, i) => {
      const v = p[key];
      if (!v) return '';
      const x = axis + i * band + (band - barWidth) / 2;
      const yTop = y(v),
        base = y(0),
        h = base - yTop,
        r = Math.min(radius, h);
      return `<path d="M${x},${base}V${yTop + r}Q${x},${yTop} ${x + r},${yTop}H${x + barWidth - r}Q${x + barWidth},${yTop} ${x + barWidth},${yTop + r}V${base}Z"/>`;
    };
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true" data-tone="${tone}"><g class="ix-gridlines">${scale
      .map(
        (t) =>
          `<line x1="${axis}" x2="${width}" y1="${y(t)}" y2="${y(t)}"/><text x="${axis - 8}" y="${y(t) + 4}" text-anchor="end">${number.format(t)}</text>`,
      )
      .join(
        '',
      )}</g><g class="ix-marks">${points.map(bar).join('')}</g><line class="ix-cross" x1="0" x2="0" y1="${top}" y2="${height - bottom}" visibility="hidden"/></svg>`;
    return { axis, band };
  }
  function mountChart(root, data) {
    const figure = root.querySelector('.ix-trend');
    if (!figure) return;
    const { points, weekly } = chart(data);
    const label = (p) =>
      weekly
        ? `${shortDate.format(new Date(p.day + 'T12:00:00+08:00'))} – ${shortDate.format(new Date(p.until + 'T12:00:00+08:00'))}`
        : fullDate.format(new Date(p.day + 'T12:00:00+08:00'));
    const tip = figure.querySelector('.ix-tip');
    let geometry;
    function render() {
      if (!figure.isConnected) return;
      geometry = drawSeries(
        figure.querySelector('[data-series="visitors"]'),
        points,
        'visitors',
        'visitors',
        200,
      );
      drawSeries(
        figure.querySelector('[data-series="inquiries"]'),
        points,
        'inquiries',
        'inquiries',
        72,
      );
      const axis = figure.querySelector('.ix-x-axis');
      const marks = [0, Math.floor((points.length - 1) / 2), points.length - 1];
      axis.style.paddingLeft = geometry.axis + 'px';
      axis.innerHTML = [...new Set(marks)]
        .map(
          (i) =>
            `<span style="left:${geometry.axis + (i + 0.5) * geometry.band}px">${esc(shortDate.format(new Date(points[i].day + 'T12:00:00+08:00')))}</span>`,
        )
        .join('');
    }
    function show(index) {
      if (index < 0 || index >= points.length) return hide();
      const p = points[index];
      const x = geometry.axis + (index + 0.5) * geometry.band;
      figure.querySelectorAll('.ix-cross').forEach((line) => {
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
        line.setAttribute('visibility', 'visible');
      });
      figure
        .querySelectorAll('.ix-marks path')
        .forEach((path) => path.classList.remove('is-active'));
      tip.replaceChildren();
      const title = document.createElement('strong');
      title.textContent = label(p);
      tip.append(title);
      for (const [key, name] of [
        ['visitors', 'Visitors'],
        ['views', 'Page views'],
        ['inquiries', 'Inquiries'],
      ]) {
        const line = document.createElement('span');
        line.dataset.key = key;
        const value = document.createElement('b');
        value.textContent = number.format(p[key]);
        line.append(value, ' ' + name);
        tip.append(line);
      }
      tip.hidden = false;
      const room = figure.clientWidth;
      tip.style.left =
        Math.min(Math.max(x - tip.offsetWidth / 2, 0), room - tip.offsetWidth) + 'px';
      figure.querySelector('.ix-hit').setAttribute('aria-valuenow', index + 1);
      figure
        .querySelector('.ix-hit')
        .setAttribute(
          'aria-valuetext',
          `${label(p)}: ${p.visitors} visitors, ${p.views} page views, ${p.inquiries} inquiries`,
        );
    }
    function hide() {
      tip.hidden = true;
      figure
        .querySelectorAll('.ix-cross')
        .forEach((line) => line.setAttribute('visibility', 'hidden'));
    }
    const hit = figure.querySelector('.ix-hit');
    let focusIndex = points.length - 1;
    hit.onpointermove = (event) => {
      const box = hit.getBoundingClientRect();
      focusIndex = Math.floor((event.clientX - box.left - geometry.axis) / geometry.band);
      show(focusIndex);
    };
    hit.onpointerleave = hide;
    hit.onfocus = () => show(focusIndex);
    hit.onblur = hide;
    hit.onkeydown = (event) => {
      const step = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity }[event.key];
      if (step === undefined) return;
      event.preventDefault();
      focusIndex = Math.min(points.length - 1, Math.max(0, focusIndex + step));
      show(focusIndex);
    };
    render();
    const observer = new ResizeObserver(() => render());
    observer.observe(figure);
  }
  function trendSection(data) {
    const { points, weekly } = chart(data);
    const unit = weekly ? 'week' : 'day';
    return `<section class="ix-panel ix-panel-wide ix-trend-panel"><header><h2>Visitors and inquiries per ${unit}</h2><p>Visitors are counted once a ${weekly ? 'day and summed by week' : 'day'}. Hover or use the arrow keys for each ${unit}.</p></header><figure class="ix-trend"><div class="ix-series-label"><span class="ix-key" data-tone="visitors"></span>Visitors</div><div data-series="visitors" class="ix-series"></div><div class="ix-series-label"><span class="ix-key" data-tone="inquiries"></span>Inquiries</div><div data-series="inquiries" class="ix-series"></div><div class="ix-x-axis" aria-hidden="true"></div><div class="ix-hit" tabindex="0" role="slider" aria-label="Choose a ${unit}" aria-valuemin="1" aria-valuemax="${points.length}" aria-valuenow="${points.length}"></div><div class="ix-tip" role="status" hidden></div></figure><details class="ix-table-view"><summary>Show as a table</summary><div class="ix-table-scroll"><table><thead><tr><th scope="col">${weekly ? 'Week starting' : 'Date'}</th><th scope="col">Visitors</th><th scope="col">Page views</th><th scope="col">Inquiries</th></tr></thead><tbody>${[
      ...points,
    ]
      .reverse()
      .map(
        (p) =>
          `<tr><th scope="row">${esc(fullDate.format(new Date(p.day + 'T12:00:00+08:00')))}</th><td>${number.format(p.visitors)}</td><td>${number.format(p.views)}</td><td>${number.format(p.inquiries)}</td></tr>`,
      )
      .join('')}</tbody></table></div></details></section>`;
  }
  function linkBuilder() {
    return `<details class="ix-builder"><summary>Make a tracked link for a post, ad or flyer</summary><form data-link-builder><p>Use one link per post or ad. Visits and inquiries from it then show here under its campaign name.</p><div class="ix-builder-fields"><label>Page<select name="page"><option value="#/">Home</option><option value="#/divisions/solar">Solar energy</option><option value="#/divisions/construction">Construction</option><option value="#/divisions/prefabrication">Prefabrication</option><option value="#/divisions/development">Real estate development</option><option value="#/divisions/elevators">Elevator engineering</option><option value="#/inquiry">Start a project</option></select></label><label>Where it is shared<select name="source"><option value="facebook">Facebook</option><option value="tiktok">TikTok</option><option value="linkedin">LinkedIn</option><option value="google">Google</option><option value="viber">Viber</option><option value="flyer">Flyer or QR code</option><option value="newsletter">Email newsletter</option></select></label><label>Type<select name="medium"><option value="social">Free post</option><option value="paid">Paid ad</option><option value="qr">QR code</option><option value="email">Email</option></select></label><label>Campaign name<input name="campaign" required maxlength="40" pattern="[A-Za-z0-9 _.\\-]+" placeholder="november-solar"></label></div><div class="ix-builder-output"><output name="link" aria-live="polite"></output><button type="submit" class="button small">Copy link</button></div></form></details>`;
  }
  function builtLink(form) {
    const f = form.elements;
    const slug = f.campaign.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_.-]/g, '');
    const url = new URL(location.origin + '/');
    url.searchParams.set('utm_source', f.source.value);
    url.searchParams.set('utm_medium', f.medium.value);
    if (slug) url.searchParams.set('utm_campaign', slug);
    return url.href + f.page.value;
  }
  function trafficBody(ctx) {
    const pages = pageList(ctx);
    if (!live())
      return `<div class="ix-notice"><h2>Visitor counts start on the hosted website</h2><p>This local workspace has no visitor data. On the hosted website, every page view is counted without cookies, and inquiries are linked to the post, ad or search that brought the visitor.</p></div>${pageStatus(pages, null)}`;
    if (!report)
      return reportError
        ? `<div class="ix-notice ix-notice-error" role="alert"><h2>Traffic data is unavailable</h2><p>${esc(reportError)}</p><p>If this is the first release with traffic reports, the database update (migration 0002) may not have been applied yet.</p><button type="button" class="button small" data-refresh-report>Try again</button></div>`
        : '<p class="ix-empty ix-loading">Loading traffic…</p>';
    const d = report;
    const period = d.days === 365 ? 'previous 12 months' : `previous ${d.days} days`;
    const t = d.totals,
      p = d.previous;
    const events = Object.fromEntries(d.events.map((e) => [e.name, e]));
    const noTraffic = !t.views && !p.views;
    return `${
      noTraffic
        ? '<div class="ix-notice"><h2>No visits counted yet</h2><p>Counting starts when this version is live on the hosted website. Visits from signed-in staff, search crawlers and draft previews are never counted.</p></div>'
        : ''
    }<div class="ix-stats"><div><span>Visitors</span><strong>${number.format(t.visitors)}</strong>${delta(t.visitors, p.visitors, period)}</div><div><span>Page views</span><strong>${number.format(t.views)}</strong>${delta(t.views, p.views, period)}</div><div><span>Project inquiries</span><strong>${number.format(t.inquiries)}</strong>${delta(t.inquiries, p.inquiries, period)}${t.partners ? `<span class="ix-delta">Plus ${number.format(t.partners)} partner ${t.partners === 1 ? 'application' : 'applications'}</span>` : ''}</div><div><span>Visitors who sent an inquiry</span><strong>${t.visitors ? pct(t.inquiries, t.visitors) : '—'}</strong><span class="ix-delta">${t.visitors ? `${number.format(t.inquiries)} of ${number.format(t.visitors)} visitors` : 'Needs visitors to calculate'}</span></div></div>${trendSection(d)}<div class="ix-grid">${panel(
      'Where visitors come from',
      'Visitors by the site or link that brought them, with the inquiries each source produced.',
      d.channels.length
        ? `<table class="ix-table"><thead><tr><th scope="col">Source</th><th scope="col">Visitors</th><th scope="col">Inquiries</th><th scope="col">Rate</th></tr></thead><tbody>${d.channels
            .map(
              (c) =>
                `<tr><th scope="row">${esc(c.name)}<small>${esc(channelHelp[c.name] || '')}</small></th><td><span class="ix-cell-bar" data-tone="visitors" style="--w:${((c.visitors / Math.max(...d.channels.map((x) => x.visitors), 1)) * 100).toFixed(1)}%"></span>${number.format(c.visitors)}</td><td>${number.format(c.inquiries)}</td><td>${c.visitors ? pct(c.inquiries, c.visitors) : '—'}</td></tr>`,
            )
            .join('')}</tbody></table>`
        : '<p class="ix-empty">No visits in this period.</p>',
    )}${panel(
      'From visit to inquiry',
      'How many visitors reached each step. A big drop shows where people leave.',
      `<ol class="ix-funnel">${d.funnel
        .map(
          (s, i) =>
            `<li><span class="ix-funnel-step">${esc(s.step)}</span><span class="ix-bar-track"><span class="ix-bar" data-tone="${i === d.funnel.length - 1 ? 'inquiries' : 'visitors'}" style="width:${t.visitors ? Math.max(s.visitors ? 1.5 : 0, (s.visitors / t.visitors) * 100).toFixed(1) : 0}%"></span></span><span class="ix-bar-value">${number.format(s.visitors)}<small>${pct(s.visitors, t.visitors)}</small></span></li>`,
        )
        .join('')}</ol>`,
    )}${panel(
      'Campaigns',
      'Visits and inquiries from tracked links.',
      `${
        d.campaigns.length
          ? `<table class="ix-table"><thead><tr><th scope="col">Campaign</th><th scope="col">Visitors</th><th scope="col">Inquiries</th></tr></thead><tbody>${d.campaigns
              .map(
                (c) =>
                  `<tr><th scope="row">${esc(c.name)}</th><td>${number.format(c.visitors)}</td><td>${number.format(c.inquiries)}</td></tr>`,
              )
              .join('')}</tbody></table>`
          : '<p class="ix-empty">No tracked links used yet. Make one below and use it in your next post or ad.</p>'
      }${linkBuilder()}`,
    )}${panel(
      'Referring sites',
      'Other websites that linked visitors here.',
      bars(
        d.referrers.map((r) => ({ label: r.name, value: r.visitors })),
        { empty: 'No visits from other websites in this period.' },
      ),
    )}${panel(
      'Inquiries by division',
      `Requests received in the ${d.days === 365 ? 'last 12 months' : `last ${d.days} days`}.`,
      bars(
        Object.entries(divisionNames).map(([id, label]) => ({
          label,
          value: d.divisions.find((x) => x.name === id)?.value || 0,
        })),
        { tone: 'inquiries', empty: 'No inquiries in this period.' },
      ),
    )}${panel(
      'What visitors did',
      'Actions that show interest, counted once per page view.',
      `<dl class="ix-actions">${eventLabels
        .map(
          ([id, label]) =>
            `<div><dt>${label}</dt><dd>${number.format(events[id]?.visitors || 0)}<small>${events[id]?.total > (events[id]?.visitors || 0) ? `${number.format(events[id].total)} times` : 'visitors'}</small></dd></div>`,
        )
        .join('')}</dl>`,
    )}${panel(
      'Devices',
      'Share of visitors by screen type.',
      devices(d.devices) +
        (d.countries.length
          ? `<p class="ix-countries"><span>Top countries</span>${d.countries
              .map((c) => `${esc(regionName(c.name))} ${pct(c.visitors, t.visitors)}`)
              .join(' · ')}</p>`
          : ''),
    )}</div>${pageStatus(pages, d)}`;
  }
  function regionName(code) {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    } catch {
      return code;
    }
  }
  function devices(list) {
    const total = list.reduce((s, d) => s + d.visitors, 0);
    if (!total) return '<p class="ix-empty">No visits in this period.</p>';
    const names = { mobile: 'Phone', desktop: 'Computer', tablet: 'Tablet' };
    const order = ['mobile', 'desktop', 'tablet'].filter((id) => list.some((d) => d.name === id));
    const value = (id) => list.find((d) => d.name === id)?.visitors || 0;
    return `<div class="ix-split" role="img" aria-label="${order.map((id) => `${names[id]} ${pct(value(id), total)}`).join(', ')}">${order
      .map(
        (id, i) =>
          `<span data-slot="${i}" style="flex-grow:${value(id)}" title="${names[id]}: ${pct(value(id), total)}"></span>`,
      )
      .join('')}</div><ul class="ix-legend">${order
      .map(
        (id, i) =>
          `<li><span class="ix-key" data-slot="${i}"></span>${names[id]} <b>${pct(value(id), total)}</b><small>${number.format(value(id))}</small></li>`,
      )
      .join('')}</ul>`;
  }
  function pageStatus(pages, d) {
    const stats = new Map((d?.pages || []).map((p) => [p.path, p]));
    const last = new Map((d?.lastViews || []).map((p) => [p.path, p.last]));
    const errors = d?.errors || [];
    const known = new Set(pages.map(([path]) => path));
    const others = (d?.pages || []).filter((p) => !known.has(p.path));
    const otherViews = others.reduce((s, p) => s + p.views, 0);
    const health = (path) => {
      const count = errors.filter((e) => e.path === path).reduce((s, e) => s + e.total, 0);
      if (count)
        return `<span class="ix-health" data-health="warn">${icon('info')} ${count} script ${count === 1 ? 'error' : 'errors'}</span>`;
      if (!d) return '<span class="ix-health">—</span>';
      return stats.get(path)
        ? `<span class="ix-health" data-health="ok">${icon('check')} No errors reported</span>`
        : '<span class="ix-health">No visits in this period</span>';
    };
    return `<section class="ix-panel ix-panel-wide ix-pages"><header><h2>Page status</h2><p>Every public page with its visits, what it currently shows and any script errors visitors hit. Use Check files to confirm datasheets and key images still load.</p></header><div class="ix-table-scroll"><table class="ix-table"><thead><tr><th scope="col">Page</th>${d ? '<th scope="col">Views</th><th scope="col">Visitors</th><th scope="col">Last visit</th>' : ''}<th scope="col">Content</th><th scope="col">Health</th></tr></thead><tbody>${pages
      .map(([path, label, content]) => {
        const s = stats.get(path);
        return `<tr><th scope="row"><a href="/#${path}" target="_blank" rel="noopener">${esc(label)}</a><small>${esc(path)}</small></th>${d ? `<td>${number.format(s?.views || 0)}</td><td>${number.format(s?.visitors || 0)}</td><td>${last.get(path) ? esc(ago(last.get(path))) : 'Never'}</td>` : ''}<td${content.warn ? ' class="ix-warn-text"' : ''}>${content.warn ? icon('info') + ' ' : ''}${esc(content.text)}</td><td>${health(path)}</td></tr>`;
      })
      .join('')}${
      d && others.length
        ? `<tr class="ix-other-row"><th scope="row">Project and news pages<small>${others.length} ${others.length === 1 ? 'page' : 'pages'}</small></th><td>${number.format(otherViews)}</td><td>—</td><td>—</td><td>Individual projects and posts</td><td>${errors.some((e) => !known.has(e.path)) ? '<span class="ix-health" data-health="warn">' + icon('info') + ' Errors reported</span>' : '<span class="ix-health">—</span>'}</td></tr>`
        : ''
    }</tbody></table></div><div class="ix-check"><button type="button" class="button outline small" data-check-files>Check files</button><p class="ix-check-result" role="status" aria-live="polite"></p></div>${
      errors.length
        ? `<h3 class="ix-subhead">Script errors visitors hit</h3><div class="ix-table-scroll"><table class="ix-table ix-errors"><thead><tr><th scope="col">Page</th><th scope="col">Message</th><th scope="col">Times</th><th scope="col">Last seen</th></tr></thead><tbody>${errors
            .map(
              (e) =>
                `<tr><th scope="row">${esc(e.path)}</th><td><code>${esc(e.detail)}</code></td><td>${number.format(e.total)}</td><td>${esc(ago(e.last))}</td></tr>`,
            )
            .join('')}</tbody></table></div>`
        : ''
    }</section>`;
  }
  async function checkFiles(root, ctx) {
    const result = root.querySelector('.ix-check-result'),
      button = root.querySelector('[data-check-files]');
    const files = [
      'assets/techouse-logo-horizontal.png',
      'assets/data/ph-places.json',
      ...ctx.divisions.map((d) => 'assets/' + d.image),
      ...(window.TechouseCatalogue?.datasheets() || []),
    ];
    button.disabled = true;
    result.textContent = `Checking ${files.length} files…`;
    const broken = [];
    let next = 0;
    async function worker() {
      while (next < files.length) {
        const file = files[next++];
        try {
          const response = await fetch(encodeURI('/' + file), {
            method: 'HEAD',
            cache: 'no-store',
          });
          if (!response.ok) broken.push(`${file} (${response.status})`);
        } catch {
          broken.push(`${file} (no response)`);
        }
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
    button.disabled = false;
    result.dataset.health = broken.length ? 'warn' : 'ok';
    result.innerHTML = broken.length
      ? `${icon('info')} ${broken.length} of ${files.length} files did not load: ${broken.map(esc).join(', ')}`
      : `${icon('check')} All ${files.length} files load. Checked at ${esc(clock.format(new Date()))}.`;
  }
  function traffic(ctx) {
    const root = document.querySelector('#office-traffic');
    if (!root) return;
    const controls = document.querySelector('.ix-range');
    function draw() {
      if (!root.isConnected) return;
      const openBuilder = root.querySelector('.ix-builder')?.open;
      root.innerHTML = trafficBody(ctx);
      root.classList.remove('is-refreshing');
      if (openBuilder) root.querySelector('.ix-builder').open = true;
      if (report) mountChart(root, report);
      const builder = root.querySelector('[data-link-builder]');
      if (builder) builder.elements.link.value = builtLink(builder);
      controls?.querySelectorAll('[data-report-days]').forEach((button) => {
        button.setAttribute(
          'aria-pressed',
          String(Number(button.dataset.reportDays) === reportDays),
        );
      });
      const stamp = document.querySelector('.ix-updated');
      if (stamp)
        stamp.textContent = report ? `Updated ${clock.format(new Date(report.generatedAt))}` : '';
    }
    async function refresh(days) {
      root.classList.add('is-refreshing');
      await loadReport(days);
      draw();
    }
    controls?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-report-days]');
      if (button) refresh(Number(button.dataset.reportDays));
      if (event.target.closest('[data-refresh-report]')) refresh(reportDays);
    });
    root.onclick = (event) => {
      if (event.target.closest('[data-refresh-report]')) refresh(reportDays);
      if (event.target.closest('[data-check-files]')) checkFiles(root, ctx);
    };
    root.oninput = root.onchange = (event) => {
      const form = event.target.closest('[data-link-builder]');
      if (form) form.elements.link.value = builtLink(form);
    };
    root.onsubmit = async (event) => {
      const form = event.target.closest('[data-link-builder]');
      if (!form) return;
      event.preventDefault();
      const link = builtLink(form);
      const button = form.querySelector('button');
      try {
        await navigator.clipboard.writeText(link);
        button.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(form.elements.link);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        button.textContent = 'Select and copy';
      }
      setTimeout(() => (button.textContent = 'Copy link'), 2000);
    };
    draw();
    if (live()) refresh(reportDays);
  }
  function rangeControls() {
    if (!live()) return '';
    return `<div class="ix-range-bar"><div class="ix-range" role="group" aria-label="Report period">${[
      [7, '7 days'],
      [30, '30 days'],
      [90, '90 days'],
      [365, '12 months'],
    ]
      .map(
        ([days, label]) =>
          `<button type="button" data-report-days="${days}" aria-pressed="${days === reportDays}">${label}</button>`,
      )
      .join(
        '',
      )}<button type="button" class="ix-refresh" data-refresh-report>Refresh</button></div><span class="ix-updated" aria-live="polite"></span></div>`;
  }
  // The Inquiries tab shows how many requests nobody has opened yet.
  function syncTab() {
    const tab = document.querySelector('.admin-tabs [data-tab="inquiries"]');
    if (!tab || records === null) return;
    const awaiting = counts().awaiting;
    tab.querySelector('.tab-count')?.remove();
    if (awaiting)
      tab.insertAdjacentHTML(
        'beforeend',
        ` <span class="tab-count" title="Not opened yet">${awaiting}<span class="visually-hidden"> not opened</span></span>`,
      );
  }
  function mount(path, ctx) {
    load().then(syncTab);
    if (path === '/office') overview(ctx);
    if (path === '/office/inquiries') inquiries(ctx);
    if (path === '/office/traffic') traffic(ctx);
  }
  const counts = () => ({
    awaiting: (records || []).filter((q) => !q.seenAt && q.status !== 'spam').length,
    known: records !== null,
  });
  return { mount, rangeControls, load, counts, statusName, divisionNames };
})();
