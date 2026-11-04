/** Cloudflare adapter: serve exact HTML assets for the app's explicit page routes. */
import application from '../../platform/worker.mjs';
import { assetCacheControl } from './asset-cache.mjs';

export default {
  ...application,
  fetch(request, env, context) {
    const assets = {
      async fetch(assetRequest) {
        const url = new URL(assetRequest.url);
        // With automatic HTML redirects disabled, the root needs its exact index asset.
        if (url.pathname === '/') url.pathname = '/index.html';
        const request = new Request(url, assetRequest);
        const response = await env.ASSETS.fetch(request);
        const policy = assetCacheControl(request, response);
        if (!policy) return response;
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', policy);
        return new Response(response.body, { status: response.status, headers });
      },
    };
    return application.fetch(request, { ...env, ASSETS: assets }, context);
  },
};
