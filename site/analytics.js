/** Cookieless visit counting for the hosted website (platform mode only).
 * Sends the page route, where the visit came from and a few actions (call, email, inquiry start).
 * No cookies or personal details are sent; staff pages and draft previews are never counted.
 */
window.TechouseAnalytics = (() => {
  const enabled =
    window.TechousePlatformMode &&
    !window.TechouseAdmin &&
    !new URLSearchParams(location.search).has('office-preview') &&
    location.pathname !== '/office.html';
  const visitKey = 'techouse.visit.v1';
  let lastPath = '',
    errors = 0;
  const once = new Set();
  const route = () => (location.hash.slice(1) || '/').split('?')[0].replace(/\/$/, '') || '/';
  function send(data) {
    if (!enabled) return;
    try {
      fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
        credentials: 'same-origin',
      }).catch(() => {});
    } catch {}
  }
  // First touch of this browser tab: the referring site, campaign tags and landing page.
  function attribution() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(visitKey) || 'null');
      if (saved) return { ...saved, entry: false };
    } catch {}
    const tags = new URLSearchParams(location.search);
    new URLSearchParams(location.hash.split('?')[1] || '').forEach((value, key) => {
      if (!tags.has(key)) tags.set(key, value);
    });
    // fbclid is added to every link shared on Facebook; gclid only to Google Ads clicks.
    const click = tags.has('gclid')
      ? ['google', 'cpc']
      : tags.has('fbclid')
        ? ['facebook', 'social']
        : ['', ''];
    const visit = {
      referrer: document.referrer || '',
      source: tags.get('utm_source') || click[0],
      medium: tags.get('utm_medium') || click[1],
      campaign: tags.get('utm_campaign') || '',
      landing: route(),
    };
    try {
      sessionStorage.setItem(visitKey, JSON.stringify(visit));
    } catch {}
    return { ...visit, entry: true };
  }
  function view() {
    const path = route();
    if (path === lastPath || path.startsWith('/office')) return;
    lastPath = path;
    once.clear();
    send({ type: 'view', path, ...attribution() });
  }
  function event(name, detail = '', key = name) {
    if (once.has(key)) return;
    once.add(key);
    send({ type: 'event', name, path: route(), detail: String(detail).slice(0, 160) });
  }
  if (enabled) {
    // Count after app.js has rendered the first route.
    addEventListener('DOMContentLoaded', () => setTimeout(view, 0));
    addEventListener('hashchange', () => setTimeout(view, 0));
    document.addEventListener(
      'click',
      (e) => {
        const link = e.target.closest?.('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href.startsWith('tel:')) event('call');
        else if (href.startsWith('mailto:')) event('email');
        else if (href.startsWith('viber:')) event('viber');
        else if (/\.pdf($|\?)/i.test(href))
          event('datasheet', decodeURIComponent(href.split('/').pop()), href);
        else if (/facebook\.com|tiktok\.com|linkedin\.com/.test(href))
          event('social', new URL(link.href).hostname.replace(/^www\./, ''), href);
      },
      true,
    );
    document.addEventListener('input', (e) => {
      if (e.target.closest?.('#inquiry-form')) event('inquiry_start');
    });
    addEventListener('error', (e) => {
      if (errors++ < 5 && e.message) event('error', e.message, 'error:' + e.message);
    });
    addEventListener('unhandledrejection', (e) => {
      const message = String(e.reason?.message || e.reason || 'Unhandled rejection');
      if (errors++ < 5) event('error', message, 'error:' + message);
    });
  }
  return { event, attribution: () => (enabled ? attribution() : null), enabled };
})();
