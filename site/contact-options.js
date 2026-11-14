/* Keep mobile calls direct; offer a phone handoff on desktop. */
(() => {
  function qrMarkup(value) {
    const qr = qrcodegen.QrCode.encodeText(value, qrcodegen.QrCode.Ecc.MEDIUM);
    const cells = [];
    for (let y = 0; y < qr.size; y++)
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) cells.push(`M${x + 4},${y + 4}h1v1h-1z`);
      }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qr.size + 8} ${qr.size + 8}" role="img" aria-label="Scan to connect with Techouse" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="${cells.join('')}" fill="#14291e"/></svg>`;
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="tel:"]');
    if (
      !link ||
      link.closest('#contact-options-dialog') ||
      !matchMedia('(min-width: 900px) and (pointer: fine)').matches ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    document.querySelector('#contact-options-dialog')?.remove();
    const phone = link.getAttribute('href');
    const number = phone.slice(4).replace(/[^+\d]/g, '');
    const viber = `viber://chat?number=${encodeURIComponent(number)}`;
    const dialog = document.createElement('dialog');
    dialog.id = 'contact-options-dialog';
    dialog.setAttribute('aria-labelledby', 'contact-options-title');
    dialog.innerHTML = `<button class="contact-options-close" type="button" aria-label="Close contact options">${window.TechouseIcons.icon('close')}</button><h2 id="contact-options-title">Let’s Talk</h2><p>Use your phone, or open an app on this computer.</p><p class="contact-options-number">${number.replace(/^\+63(\d{3})(\d{3})(\d{4})$/, '+63 $1 $2 $3')}</p><div class="contact-options-tabs" role="group" aria-label="Choose a QR code"><button type="button" data-contact-kind="phone" aria-pressed="true">Phone QR</button><button type="button" data-contact-kind="viber" aria-pressed="false">Viber QR</button></div><div class="contact-options-qr">${qrMarkup(phone)}</div><a class="button" data-contact-app href="${phone}">Open calling app ${window.TechouseIcons.icon('arrow_outward')}</a>`;
    document.body.append(dialog);
    dialog.querySelector('.contact-options-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-contact-kind]');
      if (!choice) return;
      const isViber = choice.dataset.contactKind === 'viber';
      dialog
        .querySelectorAll('[data-contact-kind]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === choice)));
      dialog.querySelector('.contact-options-qr').innerHTML = qrMarkup(isViber ? viber : phone);
      const app = dialog.querySelector('[data-contact-app]');
      app.href = isViber ? viber : phone;
      app.innerHTML = `${isViber ? 'Open Viber' : 'Open calling app'} ${window.TechouseIcons.icon('arrow_outward')}`;
    });
    dialog.addEventListener(
      'close',
      () => {
        document.documentElement.classList.remove('contact-dialog-open');
        dialog.remove();
      },
      { once: true },
    );
    document.documentElement.classList.add('contact-dialog-open');
    dialog.showModal();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.animate(
        [
          { opacity: 0, transform: 'translateY(16px) scale(.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
    }
  });
  window.addEventListener('hashchange', () =>
    document.querySelector('#contact-options-dialog')?.close(),
  );
})();
