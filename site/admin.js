/** Protected CMS client: no credentials or session tokens are written to browser storage. */
(() => {
  const $ = (s) => document.querySelector(s);
  let csrf = '';
  const notice = (s) => ($('#notice').textContent = s);
  async function api(path, options = {}) {
    const response = await fetch('/api/' + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        ...options.headers,
      },
    });
    const value = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path.startsWith('admin/')) {
        $('#cms').hidden = true;
        $('#auth').hidden = false;
        $('#login').hidden = false;
        $('#mfa').hidden = true;
      }
      throw Error(value.error || 'Request failed');
    }
    return value;
  }
  function busy(form, value) {
    form.querySelectorAll('button').forEach((b) => (b.disabled = value));
  }
  const setupToken = new URLSearchParams(location.hash.slice(1)).get('setup');
  if (setupToken) {
    history.replaceState(null, '', location.pathname);
    $('#setup').hidden = false;
    $('#login').hidden = true;
  }
  $('#setup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target));
    if (fields.password !== fields.confirmation) {
      notice('Passwords do not match.');
      return;
    }
    busy(e.target, true);
    try {
      const result = await api('auth/setup', {
        method: 'POST',
        body: JSON.stringify({ token: setupToken, password: fields.password }),
      });
      $('#setup').reset();
      $('#setup').hidden = true;
      $('#login').hidden = false;
      $('#login [name=email]').value = result.email;
      notice('Password set. Sign in to enroll your authenticator.');
    } catch (error) {
      notice(error.message);
    } finally {
      busy(e.target, false);
    }
  });
  function animateAuth() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    requestAnimationFrame(() => {
      document.querySelectorAll('.auth-context, .auth-form-panel').forEach((el, index) => {
        el.getAnimations().forEach((animation) => animation.cancel());
        el.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 450,
            delay: index * 60,
            easing: 'cubic-bezier(.2,.7,.2,1)',
            fill: 'backwards',
          },
        );
      });
    });
  }
  animateAuth();
  function authStage(stage, email = '') {
    animateAuth();
    const mfa = stage !== 'login';
    $('#auth').dataset.step = stage;
    $('#auth-heading').textContent = mfa
      ? stage === 'enroll'
        ? 'Set up your protection.'
        : 'One more step.'
      : 'Welcome back.';
    $('#auth-description').textContent = mfa
      ? stage === 'enroll'
        ? 'Connect your authenticator to keep your workspace secure.'
        : 'Confirm it’s you before opening your workspace.'
      : 'Sign in to manage your website content, projects and inquiries.';
    $('#auth-step-label').textContent = mfa ? '02 / VERIFY YOUR IDENTITY' : '01 / YOUR ACCOUNT';
    document.querySelectorAll('[data-auth-step]').forEach((item) => {
      if (item.dataset.authStep === (mfa ? 'mfa' : 'login'))
        item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    $('#auth-email').textContent = email;
    $('#login-password').type = 'password';
    document.querySelector('.auth-password-toggle').textContent = 'Show';
    document.querySelector('.auth-password-toggle').setAttribute('aria-pressed', 'false');
    $('#use-recovery').hidden = stage === 'enroll';
    recoveryMode(false);
  }
  function recoveryMode(enabled) {
    const input = $('#auth-code');
    input.value = '';
    input.maxLength = enabled ? 64 : 6;
    input.inputMode = enabled ? 'text' : 'numeric';
    input.placeholder = enabled ? 'Paste your recovery code' : '000000';
    if (enabled) input.removeAttribute('pattern');
    else input.pattern = '[0-9]{6}';
    input.classList.toggle('is-recovery-code', enabled);
    $('#auth-code-label').textContent = enabled ? 'Recovery code' : 'Authenticator code';
    $('#auth-code-help').textContent = enabled
      ? 'Use one of the unused recovery codes you saved during setup.'
      : 'Enter the 6-digit code from your authenticator app.';
    $('#use-recovery').textContent = enabled
      ? 'Use my authenticator instead'
      : 'Use a recovery code instead';
    $('#use-recovery').setAttribute('aria-pressed', String(enabled));
  }
  $('#use-recovery').onclick = () => {
    recoveryMode($('#use-recovery').getAttribute('aria-pressed') !== 'true');
    $('#auth-code').focus();
  };
  document.querySelector('.auth-password-toggle').onclick = (event) => {
    const input = $('#login-password'),
      visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    event.currentTarget.textContent = visible ? 'Hide' : 'Show';
    event.currentTarget.setAttribute('aria-pressed', String(visible));
  };
  $('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    busy(e.target, true);
    notice('');
    try {
      const result = await api('auth/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      csrf = result.csrf;
      authStage(result.stage, $('#login [name=email]').value.trim());
      $('#login').reset();
      $('#login').hidden = true;
      $('#mfa').hidden = false;
      $('#enrollment').hidden = result.stage !== 'enroll';
      $('#secret').textContent = result.secret || '';
      const canvas = $('#mfa-qr');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result.secret) {
        const qr = qrcodegen.QrCode.encodeText(result.uri, qrcodegen.QrCode.Ecc.MEDIUM);
        const scale = 5,
          border = 4;
        canvas.width = canvas.height = (qr.size + border * 2) * scale;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        for (let y = 0; y < qr.size; y++)
          for (let x = 0; x < qr.size; x++)
            if (qr.getModule(x, y))
              ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }

      $('#mfa-title').textContent =
        result.stage === 'enroll' ? 'Scan. Connect. Confirm.' : 'Verify your sign-in';
      $('#mfa input').focus();
    } catch (error) {
      notice(error.message);
    } finally {
      busy(e.target, false);
    }
  });
  $('#restart').onclick = () => {
    csrf = '';
    notice('');
    authStage('login');
    $('#mfa').hidden = true;
    $('#secret').textContent = '';
    $('#mfa-qr').getContext('2d').clearRect(0, 0, $('#mfa-qr').width, $('#mfa-qr').height);
    $('#login').hidden = false;
    $('#mfa').reset();
  };
  $('#mfa').addEventListener('submit', async (e) => {
    e.preventDefault();
    busy(e.target, true);
    notice('');
    try {
      const result = await api('auth/verify', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      csrf = result.csrf;
      $('#mfa').reset();
      $('#secret').textContent = '';
      $('#mfa-qr').getContext('2d').clearRect(0, 0, $('#mfa-qr').width, $('#mfa-qr').height);
      $('#auth').hidden = true;
      $('#logout').hidden = false;
      if (result.recoveryCodes) {
        $('#recovery').hidden = false;
        $('#recovery-codes').textContent = result.recoveryCodes.join('\n');
      } else await load();
    } catch (error) {
      notice(error.message);
    } finally {
      busy(e.target, false);
    }
  });
  $('#saved-codes').onclick = async () => {
    $('#recovery-codes').textContent = '';
    $('#recovery').hidden = true;
    await load().catch((e) => notice(e.message));
  };
  $('#logout').onclick = async () => {
    try {
      await api('auth/logout', { method: 'POST', body: '{}' });
      location.reload();
    } catch (e) {
      notice(e.message);
    }
  };
  async function load() {
    if (location.hash !== '#security') {
      location.replace('/office.html#/office');
      return;
    }
    $('#auth').hidden = true;
    $('#cms').hidden = true;
    $('#logout').hidden = false;
    $('#account-security').hidden = false;
    return;
  }
  for (const [id, path] of [
    ['change-password', 'auth/password'],
    ['remove-mfa', 'auth/mfa/remove'],
  ]) {
    $('#' + id).addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const values = Object.fromEntries(new FormData(form));
      if (id === 'change-password' && values.newPassword !== values.confirmation) {
        notice('New passwords do not match.');
        return;
      }
      busy(form, true);
      try {
        await api(path, { method: 'POST', body: JSON.stringify(values) });
        form.reset();
        csrf = '';
        authStage('login');
        $('#account-security').hidden = true;
        $('#logout').hidden = true;
        $('#auth').hidden = false;
        $('#login').hidden = false;
        $('#mfa').hidden = true;
        history.replaceState(null, '', '/admin');
        notice(
          id === 'remove-mfa'
            ? 'Authenticator removed. Sign in and enroll a new authenticator.'
            : 'Password changed. Sign in with your new password.',
        );
      } catch (error) {
        notice(error.message);
      } finally {
        busy(form, false);
      }
    });
  }
  if (!setupToken)
    api('auth/session')
      .then(async (s) => {
        csrf = s.csrf;
        await load();
      })
      .catch(() => {});
})();
