// The office opens at /office.html when signed in, and at #/office in the local workspace and the
// static demo. Theme styles only apply to body.office-page, so public pages keep their colors;
// the back office's preview frames are skipped.
if (!/[?&](office-preview|products-preview)\b/.test(location.search)) {
  // A personal workspace preference.
  (() => {
    const allowed = ['light', 'dark', 'grey'];
    let theme = 'light';
    try {
      const saved = localStorage.getItem('techouse.office.theme');
      if (allowed.includes(saved)) theme = saved;
    } catch {}
    function apply() {
      document.documentElement.dataset.officeTheme = theme;
      document.querySelectorAll('[data-theme-choice]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
      });
    }
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-theme-choice]');
      if (!button) return;
      theme = allowed.includes(button.dataset.themeChoice) ? button.dataset.themeChoice : 'light';
      try {
        localStorage.setItem('techouse.office.theme', theme);
      } catch {}
      apply();
    });
    new MutationObserver(apply).observe(document.querySelector('#header'), { childList: true });
    apply();
  })();
}
