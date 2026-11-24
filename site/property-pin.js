/**
 * Solar inquiry property pin and roof outline (optional).
 * The visitor can pin the property from their phone's GPS ("I'm at the property") or on a Google
 * satellite map, then outline the roof by tapping its corners. The result travels with the inquiry
 * as { lat, lng, accuracy, source, roof: [[lat, lng], ...], roofArea } and is shown to the sales team
 * in the back office. Maps load only when opened. Google Maps is used when the back office holds a
 * key and Google answers; otherwise a free fallback takes over: Leaflet (self-hosted) with Esri World
 * Imagery satellite tiles and OpenStreetMap Nominatim address search.
 */
window.TechousePropertyPin = (() => {
  const PH = { south: 4, north: 21.5, west: 116, east: 127.5 };
  const PANEL_M2 = 2.7; // one 620 W panel with spacing
  const USABLE = 0.6; // share of a pitched roof that typically takes panels
  const MANILA = { lat: 14.5995, lng: 120.9842 };
  let state = null;
  let host = null;
  let mapsReady = null;
  let mapsFailed = false;

  const icon = (name) => window.TechouseIcons.icon(name);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const key = () => window.TechouseContent?.snapshot().settings?.googleMapsKey || '';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inPH = (lat, lng) => lat >= PH.south && lat <= PH.north && lng >= PH.west && lng <= PH.east;
  const fixed = (n, places = 4) => Number(n).toFixed(places);
  const mapsLink = (lat, lng) =>
    `https://www.google.com/maps/search/?api=1&query=${fixed(lat, 6)},${fixed(lng, 6)}`;
  const panels = (area) => Math.max(0, Math.floor((area * USABLE) / PANEL_M2));

  /** Square metres of a small lat/lng polygon; the server recomputes the same figure. */
  function area(points) {
    if (points.length < 3) return 0;
    const lat0 = ((points.reduce((sum, [lat]) => sum + lat, 0) / points.length) * Math.PI) / 180;
    const xy = points.map(([lat, lng]) => [lng * 111320 * Math.cos(lat0), lat * 110540]);
    let twice = 0;
    xy.forEach(([x1, y1], i) => {
      const [x2, y2] = xy[(i + 1) % xy.length];
      twice += x1 * y2 - x2 * y1;
    });
    return Math.abs(twice) / 2;
  }

  function staticMap({ lat, lng, roof }, width = 640, height = 320) {
    const params = new URLSearchParams({
      size: `${width}x${height}`,
      scale: '2',
      maptype: 'satellite',
      key: key(),
    });
    if (!roof?.length) {
      params.set('center', `${lat},${lng}`);
      params.set('zoom', '19');
    }
    let url = `https://maps.googleapis.com/maps/api/staticmap?${params}`;
    url += `&markers=${encodeURIComponent(`color:0x1c352a|${lat},${lng}`)}`;
    if (roof?.length) {
      const ring = [...roof, roof[0]].map(([a, b]) => `${a},${b}`).join('|');
      url += `&path=${encodeURIComponent(`color:0xf3d98fff|weight:3|fillcolor:0xe7cd9966|${ring}`)}`;
    }
    return url;
  }

  // GOOGLE MAPS: one script, loaded on first use with the Places and geometry libraries.
  function loadMaps() {
    if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
    if (!key()) return Promise.reject(new Error('No Google Maps key'));
    mapsReady ||= new Promise((resolve, reject) => {
      const callback = '__techouseMapsReady';
      const timer = setTimeout(() => reject(new Error('Google Maps did not load')), 20000);
      window[callback] = () => {
        clearTimeout(timer);
        delete window[callback];
        resolve(window.google.maps);
      };
      // Google calls this when the key is rejected (wrong address, API not enabled, billing).
      window.gm_authFailure = () => {
        mapsFailed = true;
        const mode = sheet?.open ? sheet.dataset.mode : null;
        closeSheet();
        render();
        if (mode) openSheet(mode);
      };
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key())}&libraries=places,geometry&callback=${callback}&loading=async&v=weekly&region=PH&language=en`;
      script.async = true;
      script.onerror = () => {
        clearTimeout(timer);
        mapsReady = null;
        reject(new Error('Google Maps did not load'));
      };
      document.head.append(script);
    });
    return mapsReady;
  }

  // FREE FALLBACK: Leaflet with Esri World Imagery tiles, loaded on first use.
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const PIN_SVG =
    '<svg viewBox="-16 -44 32 48" aria-hidden="true"><ellipse cx="0" cy="2" rx="7" ry="3" opacity=".3"/><path d="M0 0C-4-8-14-14-14-26a14 14 0 1 1 28 0C14-14 4-8 0 0Z"/><circle cx="0" cy="-26" r="5"/></svg>';
  const OUTLINE = { color: '#f3d98f', weight: 3, fillColor: '#e7cd99', fillOpacity: 0.32 };
  let leafletReady = null;
  function loadLeaflet() {
    if (window.L?.map) return Promise.resolve(window.L);
    leafletReady ||= new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'vendor/leaflet/leaflet.css';
      document.head.append(css);
      const script = document.createElement('script');
      script.src = 'vendor/leaflet/leaflet.js';
      script.onload = () => resolve(window.L);
      script.onerror = () => {
        leafletReady = null;
        reject(new Error('The backup map did not load'));
      };
      document.head.append(script);
    });
    return leafletReady;
  }
  function freeMap(L, element, { centre, zoom, labels = false, interactive = true }) {
    const map = L.map(element, {
      center: [centre.lat, centre.lng],
      zoom,
      maxZoom: 21,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
      boxZoom: false,
    });
    map.attributionControl.setPrefix(false);
    L.tileLayer(`${ESRI}World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    }).addTo(map);
    if (labels)
      L.tileLayer(`${ESRI}Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`, {
        maxNativeZoom: 19,
        maxZoom: 21,
      }).addTo(map);
    return map;
  }
  const pinIcon = (L) =>
    L.divIcon({ className: 'pin-marker', html: PIN_SVG, iconSize: [32, 48], iconAnchor: [16, 48] });
  /** Which map to use now: Google while a key is set and Google has not failed, else the free one. */
  const engine = () => (key() && !mapsFailed ? 'google' : 'free');

  /** Draws a pin (and roof outline) preview into element: a Google static image or a small free map. */
  async function preview(element, pin) {
    if (!element) return;
    const label = `Satellite view of the pinned property${pin.roof?.length ? ' with the roof outline' : ''}`;
    if (engine() === 'google') {
      element.innerHTML = `<img src="${esc(staticMap(pin, 640, 400))}" alt="${esc(label)}" width="640" height="400" loading="lazy">`;
      return;
    }
    try {
      const L = await loadLeaflet();
      if (!element.isConnected) return;
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', label);
      const map = freeMap(L, element, { centre: pin, zoom: 19, interactive: false });
      if (pin.roof?.length) {
        const shape = L.polygon(pin.roof, { ...OUTLINE, interactive: false }).addTo(map);
        map.fitBounds(shape.getBounds(), { padding: [24, 24], maxZoom: 20 });
      }
      L.marker([pin.lat, pin.lng], { icon: pinIcon(L), interactive: false, keyboard: false }).addTo(map);
    } catch {
      element.outerHTML = `<a class="pin-preview pin-preview-link" href="${esc(mapsLink(pin.lat, pin.lng))}" target="_blank" rel="noopener">${icon('map')}<span>View the pin on Google Maps</span>${icon('arrow_outward')}</a>`;
    }
  }

  // CARD IN THE FORM
  function render(message = '') {
    if (!host) return;
    const note = message ? `<p class="pin-message" role="status">${esc(message)}</p>` : '';
    const privacy = '<p class="pin-privacy">Shared only with the Techouse solar team for your quote.</p>';
    if (!state) {
      host.innerHTML = `<div class="pin-card"><div class="pin-head"><strong>${icon('pin_drop')}Pin your property <span class="pin-tag">Optional</span></strong><p>A pin on your roof lets our team check sun and space before we call you.</p></div><div class="pin-actions"><button type="button" class="pin-choice" data-pin-gps>${icon('my_location')}<span><b>I’m at the property</b><small>Use my phone’s location</small></span></button><button type="button" class="pin-choice" data-pin-map>${icon('map')}<span><b>Find it on the map</b><small>Drop a pin on your roof</small></span></button></div>${note}</div>${privacy}`;
      return;
    }
    const where = `${fixed(state.lat)}, ${fixed(state.lng)}`;
    const accuracy =
      state.source === 'gps' && state.accuracy ? ` · ±${Math.round(state.accuracy)} m` : '';
    const roofRow = state.roof?.length
      ? `<div class="pin-status">${icon('check')}<span class="pin-status-text"><b>Roof outlined</b><span>≈ ${Math.round(state.roofArea)} m² · about ${panels(state.roofArea)} panels</span></span><button type="button" data-pin-outline>Edit</button></div>`
      : `<div class="pin-offer"><span class="pin-badge">${icon('polyline')}</span><div><strong>Outline your roof</strong><p>Optional. Tap the corners of your roof and your quote comes back faster and closer to final.</p><button type="button" class="pin-outline-button" data-pin-outline>Outline my roof ${icon('arrow_outward')}</button></div></div>`;
    host.innerHTML = `<div class="pin-card"><div class="pin-preview" data-pin-preview></div><div class="pin-status">${icon('check')}<span class="pin-status-text"><b>Pinned</b><span>${esc(where)}${accuracy}</span></span><button type="button" data-pin-map>Move pin</button></div>${roofRow}<div class="pin-remove"><button type="button" data-pin-remove>Remove pin</button></div>${note}</div>${privacy}`;
    preview(host.querySelector('[data-pin-preview]'), state);
  }

  function useGps(button) {
    if (!navigator.geolocation || !window.isSecureContext) {
      render('Location is not available in this browser. Use the map or describe the address in the form.');
      return;
    }
    if (button) {
      button.disabled = true;
      button.querySelector('b').textContent = 'Finding your location…';
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!inPH(coords.latitude, coords.longitude)) {
          render('Your location does not look like it is in the Philippines. Use the map to pin the property instead.');
          return;
        }
        state = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          source: 'gps',
          roof: [],
          roofArea: null,
        };
        render(
          coords.accuracy > 100
            ? `Your location is approximate (±${Math.round(coords.accuracy)} m). Move the pin onto your roof for a closer match.`
            : '',
        );
      },
      (error) =>
        render(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was not allowed. Use the map instead, or skip this step.'
            : 'We could not get your location. Use the map instead, or skip this step.',
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  // FULL-SCREEN MAP SHEET: pin mode (the pin stays centred while the map moves) and outline mode.
  let sheet = null;
  function closeSheet() {
    if (sheet?.open) sheet.close();
  }
  async function startCentre() {
    if (state) return { centre: { lat: state.lat, lng: state.lng }, zoom: 20 };
    // Start on the town typed in the form when it matches a known Philippine place.
    const typed = host?.closest('form')?.elements.location?.value.split('·')[0].trim().toLowerCase();
    if (typed) {
      try {
        const data = await (await fetch('assets/data/ph-places.json')).json();
        const index = data.municipalities.findIndex(([town]) => town.toLowerCase() === typed);
        if (index >= 0)
          for (let i = 0; i < data.points.length; i += 3)
            if (data.points[i + 2] === index)
              return { centre: { lat: data.points[i] / 1000, lng: data.points[i + 1] / 1000 }, zoom: 16 };
      } catch {}
    }
    return { centre: MANILA, zoom: 12 };
  }

  async function openSheet(mode) {
    const opener = document.activeElement;
    sheet?.remove();
    sheet = document.createElement('dialog');
    sheet.className = `pin-sheet is-${mode}`;
    sheet.dataset.mode = mode;
    sheet.setAttribute('aria-labelledby', 'pin-sheet-title');
    sheet.innerHTML = `<div class="pin-map" aria-label="Satellite map"></div>${mode === 'pin' ? `<div class="pin-centre" aria-hidden="true"><svg viewBox="-16 -44 32 48"><ellipse cx="0" cy="2" rx="7" ry="3" opacity=".3"/><path d="M0 0C-4-8-14-14-14-26a14 14 0 1 1 28 0C14-14 4-8 0 0Z"/><circle cx="0" cy="-26" r="5"/></svg></div>` : ''}<div class="pin-sheet-top"><div class="pin-sheet-title"><button type="button" class="pin-icon-button" data-pin-close aria-label="Close map">${icon('arrow_back')}</button><h2 id="pin-sheet-title">${mode === 'pin' ? 'Pin your roof' : 'Outline your roof'}</h2></div>${mode === 'pin' ? '<div class="pin-search" data-pin-search></div>' : '<p class="pin-sheet-hint">Tap each corner of the roof. Drag a corner to adjust it.</p>'}</div>${mode === 'outline' ? '<p class="pin-chip" role="status" aria-live="polite" data-pin-chip></p>' : `<button type="button" class="pin-fab" data-pin-here aria-label="Go to my location">${icon('my_location')}</button>`}<div class="pin-sheet-bottom">${mode === 'pin' ? `<p>Move the map until the pin sits on your roof</p><small data-pin-coords>Loading the map…</small><button type="button" class="pin-primary" data-pin-confirm disabled>Confirm pin ${icon('check')}</button>` : `<p class="pin-sheet-hint">Press Done when the outline matches your roof.</p><div class="pin-tools"><button type="button" class="pin-secondary" data-pin-undo>${icon('undo')}Undo</button><button type="button" class="pin-secondary" data-pin-clear>Clear</button><button type="button" class="pin-primary" data-pin-done disabled>Done ${icon('check')}</button></div>`}</div>`;
    document.body.append(sheet);
    sheet.addEventListener('close', () => {
      sheet.remove();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    sheet.addEventListener('click', (e) => e.target.closest('[data-pin-close]') && closeSheet());
    sheet.showModal();
    if (!reduced()) sheet.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' });
    const { centre, zoom } = await startCentre();
    if (engine() === 'google') {
      try {
        const maps = await loadMaps();
        if (!sheet.open) return;
        googleSheet(maps, mode, centre, zoom);
        return;
      } catch {
        mapsFailed = true; // Google unavailable: use the free map from now on.
      }
    }
    try {
      const L = await loadLeaflet();
      if (!sheet.open) return;
      sheet.dataset.engine = 'free';
      const map = freeMap(L, sheet.querySelector('.pin-map'), {
        centre,
        zoom: mode === 'outline' ? 20 : Math.min(zoom, 19),
        labels: mode === 'pin',
      });
      if (mode === 'pin') freePinMode(L, map);
      else freeOutlineMode(L, map);
    } catch {
      closeSheet();
      render('The map could not load. Use your location instead, or describe the address in the form.');
    }
  }

  function googleSheet(maps, mode, centre, zoom) {
    sheet.dataset.engine = 'google';
    const map = new maps.Map(sheet.querySelector('.pin-map'), {
      center: centre,
      zoom: mode === 'outline' ? 20 : zoom,
      mapTypeId: mode === 'outline' ? 'satellite' : 'hybrid',
      tilt: 0,
      heading: 0,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
      draggableCursor: mode === 'outline' ? 'crosshair' : undefined,
    });
    if (mode === 'pin') pinMode(maps, map);
    else outlineMode(maps, map);
  }

  function pinMode(maps, map) {
    const coords = sheet.querySelector('[data-pin-coords]');
    const confirm = sheet.querySelector('[data-pin-confirm]');
    const show = () => {
      const c = map.getCenter();
      if (!c) return;
      coords.textContent = `${fixed(c.lat(), 5)}° N, ${fixed(c.lng(), 5)}° E`;
      confirm.disabled = !inPH(c.lat(), c.lng());
      if (confirm.disabled) coords.textContent += ' · outside the Philippines';
    };
    map.addListener('idle', show);
    map.addListener('center_changed', show);
    // Address search: Places (New) autocomplete, limited to the Philippines.
    const slot = sheet.querySelector('[data-pin-search]');
    try {
      const search = new maps.places.PlaceAutocompleteElement({ includedRegionCodes: ['ph'] });
      search.setAttribute('placeholder', 'Search an address or place');
      const go = async (place) => {
        await place.fetchFields({ fields: ['location', 'viewport'] });
        if (place.viewport) map.fitBounds(place.viewport);
        else if (place.location) map.setCenter(place.location);
        if (map.getZoom() < 18) map.setZoom(18);
      };
      search.addEventListener('gmp-select', ({ placePrediction }) => go(placePrediction.toPlace()));
      search.addEventListener('gmp-placeselect', ({ place }) => go(place));
      slot.append(search);
    } catch {
      slot.remove();
    }
    sheet.querySelector('[data-pin-here]').addEventListener('click', () =>
      navigator.geolocation?.getCurrentPosition(
        ({ coords: c }) => {
          map.setCenter({ lat: c.latitude, lng: c.longitude });
          map.setZoom(20);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000 },
      ),
    );
    confirm.addEventListener('click', () => {
      const c = map.getCenter();
      confirmPin(c.lat(), c.lng());
    });
    show();
  }

  function outlineMode(maps, map) {
    const path = new maps.MVCArray((state.roof || []).map(([lat, lng]) => new maps.LatLng(lat, lng)));
    new maps.Polygon({
      map,
      paths: path,
      editable: true,
      clickable: false,
      strokeColor: '#f3d98f',
      strokeWeight: 3,
      fillColor: '#e7cd99',
      fillOpacity: 0.32,
    });
    const chip = sheet.querySelector('[data-pin-chip]');
    const done = sheet.querySelector('[data-pin-done]');
    const corners = () => path.getArray().map((p) => [p.lat(), p.lng()]);
    const update = () => outlineStatus(chip, done, corners());
    ['insert_at', 'remove_at', 'set_at'].forEach((name) => maps.event.addListener(path, name, update));
    map.addListener('click', (e) => {
      if (path.getLength() < 24) path.push(e.latLng);
    });
    sheet.querySelector('[data-pin-undo]').addEventListener('click', () => path.getLength() && path.pop());
    sheet.querySelector('[data-pin-clear]').addEventListener('click', () => path.clear());
    done.addEventListener('click', () => finishOutline(corners()));
    update();
  }

  // FREE MAP MODES: same chrome and behaviour as the Google ones.
  function confirmPin(lat, lng) {
    const moved = state && Math.hypot(lat - state.lat, lng - state.lng) > 0.0005;
    state = {
      lat,
      lng,
      accuracy: null,
      source: 'map',
      // A pin moved to another building no longer matches the outline drawn before.
      roof: moved ? [] : state?.roof || [],
      roofArea: moved ? null : (state?.roofArea ?? null),
    };
    closeSheet();
    render();
  }
  function freePinMode(L, map) {
    const coords = sheet.querySelector('[data-pin-coords]');
    const confirm = sheet.querySelector('[data-pin-confirm]');
    const show = () => {
      const c = map.getCenter();
      coords.textContent = `${fixed(c.lat, 5)}° N, ${fixed(c.lng, 5)}° E`;
      confirm.disabled = !inPH(c.lat, c.lng);
      if (confirm.disabled) coords.textContent += ' · outside the Philippines';
    };
    map.on('move', show);
    // Address search: OpenStreetMap Nominatim, on submit only (its usage policy forbids
    // search-as-you-type), limited to the Philippines.
    const slot = sheet.querySelector('[data-pin-search]');
    slot.innerHTML = `<form class="pin-free-search" role="search"><input type="search" name="q" placeholder="Search an address or place" aria-label="Search an address or place" autocomplete="off" maxlength="160"><button type="submit" class="pin-secondary">Search</button></form><ul class="pin-results" hidden></ul><small class="pin-search-credit">Search © OpenStreetMap contributors</small>`;
    const results = slot.querySelector('.pin-results');
    slot.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = e.target.elements.q.value.trim();
      if (q.length < 3) return;
      results.hidden = false;
      results.innerHTML = '<li class="pin-results-note">Searching…</li>';
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ph&limit=5&accept-language=en&q=${encodeURIComponent(q)}`;
        const found = await (await fetch(url, { referrerPolicy: 'strict-origin-when-cross-origin' })).json();
        results.innerHTML = found.length
          ? found
              .map(
                (place) =>
                  `<li><button type="button" data-lat="${esc(place.lat)}" data-lng="${esc(place.lon)}">${esc(place.display_name)}</button></li>`,
              )
              .join('')
          : '<li class="pin-results-note">No places found. Try a nearby landmark or the town name.</li>';
      } catch {
        results.innerHTML = '<li class="pin-results-note">Search is not available right now. Move the map by hand.</li>';
      }
    });
    results.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-lat]');
      if (!pick) return;
      map.setView([Number(pick.dataset.lat), Number(pick.dataset.lng)], 18);
      results.hidden = true;
    });
    sheet.querySelector('[data-pin-here]').addEventListener('click', () =>
      navigator.geolocation?.getCurrentPosition(
        ({ coords: c }) => map.setView([c.latitude, c.longitude], 20),
        () => {},
        { enableHighAccuracy: true, timeout: 15000 },
      ),
    );
    confirm.addEventListener('click', () => {
      const c = map.getCenter();
      confirmPin(c.lat, c.lng);
    });
    show();
  }
  function freeOutlineMode(L, map) {
    const shape = L.polygon([], { ...OUTLINE, interactive: false }).addTo(map);
    const handles = [];
    const chip = sheet.querySelector('[data-pin-chip]');
    const done = sheet.querySelector('[data-pin-done]');
    const corners = () => handles.map((h) => [h.getLatLng().lat, h.getLatLng().lng]);
    const update = () => {
      const points = corners();
      shape.setLatLngs(points);
      outlineStatus(chip, done, points);
    };
    const addCorner = (latlng) => {
      if (handles.length >= 24) return;
      const handle = L.marker(latlng, {
        draggable: true,
        keyboard: false,
        icon: L.divIcon({ className: 'pin-vertex', iconSize: [20, 20] }),
      }).addTo(map);
      handle.on('drag', update);
      handles.push(handle);
      update();
    };
    (state.roof || []).forEach(([lat, lng]) => addCorner([lat, lng]));
    map.on('click', (e) => addCorner(e.latlng));
    sheet.querySelector('[data-pin-undo]').addEventListener('click', () => {
      handles.pop()?.remove();
      update();
    });
    sheet.querySelector('[data-pin-clear]').addEventListener('click', () => {
      while (handles.length) handles.pop().remove();
      update();
    });
    done.addEventListener('click', () => finishOutline(corners()));
    if (handles.length >= 3) map.fitBounds(shape.getBounds(), { padding: [80, 80], maxZoom: 20 });
    update();
  }
  function outlineStatus(chip, done, points) {
    const n = points.length;
    const m2 = Math.round(area(points));
    chip.innerHTML =
      n === 0
        ? `${icon('polyline')}<span>Tap the first corner of your roof</span>`
        : n < 3
          ? `${icon('polyline')}<span>${n} corner${n > 1 ? 's' : ''} · keep tapping around the roof</span>`
          : `${icon('polyline')}<span>${n} corners · <b>≈ ${m2} m²</b> · room for about ${panels(m2)} panels</span>`;
    done.disabled = n < 3;
  }
  function finishOutline(roof) {
    state = { ...state, roof, roofArea: area(roof) };
    closeSheet();
    render();
  }

  // MOUNT: one card under "Project location", shown only for solar inquiries.
  function mount(form) {
    if (!form) return;
    state = null;
    const location = form.elements.location?.closest('.field');
    if (!location) return;
    host = document.createElement('div');
    host.className = 'field full property-pin';
    location.after(host);
    const sync = () => (host.hidden = form.elements.division?.value !== 'solar');
    form.elements.division?.addEventListener('change', sync);
    sync();
    render();
    host.addEventListener('click', (e) => {
      const gps = e.target.closest('[data-pin-gps]');
      if (gps) useGps(gps.matches('.pin-choice') ? gps : null);
      else if (e.target.closest('[data-pin-map]')) openSheet('pin');
      else if (e.target.closest('[data-pin-outline]')) openSheet('outline');
      else if (e.target.closest('[data-pin-remove]')) {
        state = null;
        render();
      }
    });
  }

  /** The pin for the inquiry, or null when none was set or the inquiry is not for solar. */
  function value(form) {
    if (!state || form?.elements.division?.value !== 'solar') return null;
    const round = (n) => Math.round(n * 1e6) / 1e6;
    return {
      lat: round(state.lat),
      lng: round(state.lng),
      accuracy: state.accuracy ? Math.round(state.accuracy) : null,
      source: state.source,
      ...(state.roof?.length >= 3
        ? { roof: state.roof.map(([a, b]) => [round(a), round(b)]), roofArea: Math.round(state.roofArea) }
        : {}),
    };
  }

  return { mount, value, preview, staticMap, mapsLink, panels, area };
})();
