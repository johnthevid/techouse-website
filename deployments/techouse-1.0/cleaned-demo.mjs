/** Isolated public presentation demo; no database, staff accounts or live submissions. */
import { assetCacheControl } from './asset-cache.mjs';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.pathname.startsWith('/api/') ||
      /^\/(admin|office(?:\.html)?|bootstrap(?:\.html)?)(?:\/|$)/.test(url.pathname)
    ) {
      return new Response('Staff access is not available on this presentation demo.', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    if (!['GET', 'HEAD'].includes(request.method))
      return new Response('Method not allowed', { status: 405 });
    if (url.pathname === '/') url.pathname = '/index.html';
    const assetRequest = new Request(url, request);
    const response = await env.ASSETS.fetch(assetRequest);
    const headers = new Headers(response.headers);
    const policy = assetCacheControl(assetRequest, response);
    if (policy) headers.set('Cache-Control', policy);
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(response.body, { status: response.status, headers });
  },
};
