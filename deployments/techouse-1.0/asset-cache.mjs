/** Only content-versioned static files are safe to reuse without revalidation. */
export function assetCacheControl(request, response) {
  if (![200, 304].includes(response.status)) return null;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.html') || response.headers.get('content-type')?.includes('text/html'))
    return 'no-cache';
  const versionedCode =
    /\.(?:js|css)$/.test(url.pathname) && /^[a-f0-9]{12}$/.test(url.searchParams.get('v') || '');
  const fingerprintedFile = /[.-][a-f0-9]{12}\.(?:woff2|jpg|jpeg|png|webp)$/.test(url.pathname);
  return versionedCode || fingerprintedFile
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate';
}
