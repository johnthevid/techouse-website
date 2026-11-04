/** Fetch initial homepage photography before the app builds its banner markup. */
(() => {
  const home = !location.hash || /^#\/(?:\?|$)/.test(location.hash);
  if (
    !home ||
    !['/', '/index.html'].includes(location.pathname) ||
    new URLSearchParams(location.search).has('office-preview')
  )
    return;
  const images = [
    {
      id: 'solar',
      href: 'assets/solar.c391b72bc407.jpg',
    },
    {
      id: 'construction',
      href: 'assets/construction.5154dbc7c67d.jpg',
    },
    {
      id: 'prefabrication',
      href: 'assets/architecture.26e250a22279.jpg',
    },
    {
      id: 'development',
      href: 'assets/development.c87084358595.jpg',
    },
    {
      id: 'elevators',
      href: 'assets/Techouse Images/Elevator.b55adcb70afa.webp',
    },
  ];
  for (const image of images) {
    if (window.TechouseBoot?.images?.[image.id]) continue;
    const hint = document.createElement('link');
    hint.rel = 'preload';
    hint.as = 'image';
    hint.href = image.href;
    hint.fetchPriority = image.id === 'solar' ? 'high' : 'low';
    document.head.append(hint);
  }
})();
