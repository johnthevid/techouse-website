/**
 * Inquiry verification: a 6-digit code by SMS, or by email when SMS is unavailable or fails.
 * confirm(form, contact) resolves with { token } once verified, { unverified: true } when no code
 * could be sent (the inquiry still goes through and staff see it as not verified), { skipped: true }
 * when verification is off, or null when the visitor closes the dialog.
 */
window.TechouseVerify = (() => {
  const icon = (name) => window.TechouseIcons.icon(name);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const post = async (path, data) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const value = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(value.error || 'Something went wrong. Please try again.');
    return value;
  };

  async function confirm(form, { phone, email }) {
    let sent;
    try {
      sent = await post('/api/verify/send', { phone, email });
    } catch (error) {
      // Rate limits and bad input are worth showing; a server or network failure is not a reason
      // to lose the inquiry.
      if (/Too many|Add a mobile/.test(error.message)) throw error;
      return { unverified: true };
    }
    if (sent.skipped) return { skipped: true };
    if (sent.failed) return { unverified: true };
    return new Promise((resolve) => dialog(sent, { phone, email }, resolve));
  }

  function dialog(first, contact, resolve) {
    let sent = first;
    let result = null;
    let timer;
    const box = document.createElement('dialog');
    box.className = 'verify-dialog';
    box.setAttribute('aria-labelledby', 'verify-title');
    document.body.append(box);
    const draw = (message = '') => {
      const via = sent.channel === 'sms' ? 'by SMS' : 'by email';
      const lead = sent.fallback
        ? `We couldn’t send a text, so we emailed a 6-digit code to <b>${esc(sent.to)}</b>.`
        : `We sent a 6-digit code ${via} to <b>${esc(sent.to)}</b>.`;
      box.innerHTML = `<form method="dialog" class="verify-form" novalidate><button type="button" class="verify-close" data-verify-close aria-label="Close">${icon('close')}</button><h2 id="verify-title">Confirm it’s you</h2><p>${lead} It expires in 10 minutes.</p><label for="verify-code">Verification code</label><input id="verify-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><p class="verify-error" role="alert"${message ? '' : ' hidden'}>${esc(message)}</p><button type="submit" class="button verify-submit">Verify and send inquiry ${icon('arrow_forward')}</button><div class="verify-again" aria-live="polite"><span data-verify-wait>Didn’t get it? You can ask again in <b>30</b> s.</span><button type="button" class="text-link" data-verify-resend hidden>Send again</button>${sent.other ? `<button type="button" class="text-link" data-verify-switch hidden>Send by ${sent.channel === 'sms' ? 'email' : 'SMS'} instead</button>` : ''}</div></form>`;
      let left = 30;
      clearInterval(timer);
      timer = setInterval(() => {
        left -= 1;
        const wait = box.querySelector('[data-verify-wait] b');
        if (wait) wait.textContent = String(left);
        if (left <= 0) {
          clearInterval(timer);
          box.querySelector('[data-verify-wait]')?.remove();
          box.querySelectorAll('[data-verify-resend], [data-verify-switch]').forEach((b) => (b.hidden = false));
        }
      }, 1000);
      box.querySelector('input').focus();
    };
    const resend = async (channel) => {
      try {
        const next = await post('/api/verify/send', { ...contact, channel });
        if (next.failed || next.skipped) return draw('We could not send a new code. Close this to send your inquiry without one.');
        sent = next;
        draw();
      } catch (error) {
        draw(error.message);
      }
    };
    box.addEventListener('click', (e) => {
      if (e.target.closest('[data-verify-close]')) box.close();
      else if (e.target.closest('[data-verify-resend]')) resend(sent.channel);
      else if (e.target.closest('[data-verify-switch]')) resend(sent.channel === 'sms' ? 'email' : 'sms');
    });
    box.addEventListener('input', (e) => {
      if (e.target.name !== 'code') return;
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
    box.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = box.querySelector('input');
      const button = box.querySelector('.verify-submit');
      if (!/^\d{6}$/.test(input.value)) {
        const error = box.querySelector('.verify-error');
        error.textContent = 'Enter the 6 digits from the message.';
        error.hidden = false;
        input.focus();
        return;
      }
      button.disabled = true;
      try {
        const { token } = await post('/api/verify/check', { id: sent.id, code: input.value });
        result = { token, channel: sent.channel };
        box.close();
      } catch (error) {
        button.disabled = false;
        const message = box.querySelector('.verify-error');
        message.textContent = error.message;
        message.hidden = false;
        input.select();
      }
    });
    box.addEventListener('close', () => {
      clearInterval(timer);
      box.remove();
      resolve(result);
    });
    draw();
    box.showModal();
  }

  return { confirm };
})();
