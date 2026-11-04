/* Company profiles: replace empty entries with approved names, bios and local photos. */
window.TechouseAbout = (() => {
  const profiles = [
    { title: 'Leadership', role: 'Chief Executive Officer', name: '', bio: '', image: '' },
    { title: 'Our team', role: 'The people behind Techouse', name: '', bio: '', image: '' },
  ];
  const address =
    '9F Biglite International Bldg., 35 M. Llanera St., EDSA, Makati, Philippines 1233';
  const query = encodeURIComponent(address);
  const esc = (value) =>
    String(value || '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function panel() {
    return `<div class="about-people-panel"><span class="eyebrow">GET TO KNOW US</span><h2>People. Purpose.<br>A place to connect.</h2><div class="about-people-tabs" role="tablist" aria-label="People and office">${['Our team', 'Leadership', 'Our office'].map((name, i) => `<button type="button" role="tab" id="about-people-tab-${i}" aria-controls="about-people-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-about-tab="${i}">${name}</button>`).join('')}</div><section id="about-people-panel-0" role="tabpanel" aria-labelledby="about-people-tab-0"><div class="about-team-stage"><div class="about-team-placeholder">${window.TechouseIcons.icon('home_work')}<span>THE PEOPLE BEHIND TECHOUSE</span></div><div class="about-team-caption"><h3>Meet the team</h3><p>Get to know the people working across our construction and energy divisions.</p><p class="about-profile-pending">Team photographs will be added here.</p></div></div></section><section id="about-people-panel-1" role="tabpanel" aria-labelledby="about-people-tab-1" hidden><div class="about-leader"><div class="about-leader-portrait">${window.TechouseIcons.icon('dashboard')}</div><div><span class="scope-label">${esc(profiles[0].role)}</span><h3>${esc(profiles[0].name || 'Techouse leadership')}</h3><p>${esc(profiles[0].bio || 'Meet the leadership behind our vision for construction and energy in the Philippines.')}</p><p class="about-profile-pending">Leadership profile and portrait to follow.</p></div></div></section><section id="about-people-panel-2" role="tabpanel" aria-labelledby="about-people-tab-2" hidden><h3>Visit our Makati office</h3><address>${esc(address)}</address><div class="about-office-visuals"><iframe title="Google Maps: Biglite International Building, Makati" src="https://www.google.com/maps?q=${encodeURIComponent('Biglite International Lighting Inc 35 EDSA Makati Philippines')}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><figure><img src="assets/biglite-building-interior.webp" alt="Interior corridor of Biglite International Building in Makati" loading="lazy"><figcaption>Inside Biglite International Building · <a href="https://filipinohomes.com/biglite-international-lighting-inc-commercial-spaces-for-rent" target="_blank" rel="noopener">Photo: Filipino Homes listing</a></figcaption></figure><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noopener">Open Google Maps ${window.TechouseIcons.icon('arrow_outward')}</a></div><a class="text-link" href="tel:+639855626888">Call ahead to plan your visit ${window.TechouseIcons.icon('call')}</a></section></div>`;
  }
  function activate(button) {
    const host = button.closest('.about-people-panel');
    host.querySelectorAll('[role="tab"]').forEach((tab) => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      host.querySelector('#' + tab.getAttribute('aria-controls')).hidden = !active;
    });
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-about-tab]');
    if (button) activate(button);
  });
  document.addEventListener('keydown', (event) => {
    const button = event.target.closest('[data-about-tab]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...button.parentElement.children];
    const i =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (tabs.indexOf(button) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
            tabs.length;
    activate(tabs[i]);
    tabs[i].focus();
  });
  return { panel };
})();
