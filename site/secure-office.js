/** Same back-office UI; the server session, CSRF token and content version authorize every save. */
document.documentElement.classList.add('platform-office');
window.TechousePlatform = (() => {
  let pending = false;
  async function saveContent(next) {
    if (pending) throw Error('A save is already in progress. Please wait.');
    pending = true;
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.TechouseAdmin.csrf },
        body: JSON.stringify({
          content: {
            ...next,
            pages: next.pages ?? window.TechouseBoot.pages,
            posts: window.TechouseBoot.posts,
          },
          version: window.TechouseAdmin.version,
        }),
      });
      const value = await response.json();
      if (!response.ok) throw Error(value.error || 'Could not save online.');
      window.TechouseAdmin.version = value.version;
      window.TechouseBoot = structuredClone(value.content);
      return value.content;
    } finally {
      pending = false;
    }
  }
  async function savePosts(posts) {
    const old = window.TechouseBoot.posts;
    window.TechouseBoot.posts = posts;
    try {
      await saveContent(window.TechouseContent.snapshot());
    } catch (error) {
      window.TechouseBoot.posts = old;
      throw error;
    }
  }
  document.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-secure-signout]')) return;
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.TechouseAdmin.csrf },
      body: '{}',
    });
    if (response.ok) location.href = '/admin';
  });
  return { saveContent, savePosts };
})();
