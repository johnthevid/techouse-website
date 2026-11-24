/**
 * Be a partner: the solar sales partner page (#/partnership), its interactions and the promo
 * banners shown on other pages. Terms come from the Solar Sales Agency Agreement; keep them in
 * step with the signed agreement. Applications use the inquiry form with topic=partnership.
 */
window.TechousePartner = (() => {
  const icon = (name, extra) => window.TechouseIcons.icon(name, extra);
  const applyLink = '#/partnership/apply';
  const peso = (n) => '₱' + Math.round(n).toLocaleString('en-PH');
  const rate = 0.05;

  // CONTENT: the partner journey. Photos are illustrative; see assets/solar-story/SOURCES.md.
  const steps = [
    ['Apply', 'Tell us who you are and who you know. It takes about five minutes.', 'solar-story/lower-bills.jpg', 'A bright home desk with a laptop'],
    ['Meet our team', 'We get to know you, talk through your network and answer your questions.', 'biglite-building-interior.webp', 'Office corridor in the Biglite building, Makati'],
    ['Sign the agreement', 'Review the Solar Sales Agency Agreement together and sign before a notary.', 'solar-story/electricity-bill.jpg', 'Documents and a calculator on a desk'],
    ['Get briefed', 'Receive our pricing, warranty and product details so you can present them accurately.', 'solar-story/lesson-equipment.jpg', 'A solar inverter and battery mounted on a wall'],
    ['Refer clients', 'Introduce homes and businesses in your network to our solar team.', 'reference-projects/reference-residential-02.jpg', 'Aerial view of a house with rooftop solar panels'],
    ['We deliver', 'Techouse surveys, designs, installs and finances the system. The client pays in full.', 'reference-projects/reference-residential-04.jpg', 'Solar panels installed on a city rooftop'],
    ['You get paid', 'Your 5% arrives within 7 days of the client’s final payment.', 'solar-story/daytime.jpg', 'Rooftop solar panels at sunset'],
  ];
  const terms = [
    ['Commission', '5%', 'of every closed, signed and paid solar project'],
    ['Payout', '7 days', 'after the client’s final payment'],
    ['Term', '6 months', 'renews automatically'],
    ['Leaving', '15 days', 'written notice, either side'],
    ['Your status', 'Independent', 'a contractor, not an employee'],
    ['Appointment', 'Non-exclusive', 'refer homes and businesses anywhere'],
  ];
  const fine = [
    ['Chargebacks', 'If a client cancels within their legal cancellation period, or defaults before installation because of misrepresentation, commission already paid is deducted from future payouts.'],
    ['Confidentiality', 'Client lists, contact details, utility bills and pricing sheets belong to Techouse. Keep them private during and after your term.'],
    ['Responsibility', 'You answer for claims caused by your own gross negligence, fraud or promises Techouse did not authorise.'],
    ['Ending early', 'Either side may end the agreement immediately if the other breaches a material term.'],
    ['Governing law', 'Philippine law, with Makati City as the venue. The agreement is notarised when both sides sign.'],
  ];
  const yours = [
    ['Find and refer clients', 'Pitch professionally and pass on qualified leads.'],
    ['Represent us accurately', 'Our prices, warranties and specs, as they are.'],
    ['Follow the rules', 'Consumer-protection and telemarketing laws.'],
    ['Keep it confidential', 'Client details and pricing stay private.'],
  ];
  const ours = [
    ['Deliver the system', 'Survey, design, installation and financing.'],
    ['Equip you to sell', 'Current pricing, warranty terms and product details.'],
    ['Pay on time', '5% within 7 days of each final payment.'],
  ];
  const questions = [
    ['Do I need to know about solar?', 'No. Your part is the introduction. We give you the product information, and our engineers handle the design.'],
    ['Is this a job with Techouse?', 'No. Partners are independent contractors paid by commission. There’s no salary, and you set your own time.'],
    ['When exactly do I get paid?', 'Within 7 days after your client’s project reaches final payment.'],
    ['What if a client cancels?', 'If they cancel within their legal cancellation period, or default before installation because of misrepresentation, paid commission is deducted from future payouts.'],
    ['Can I stop being a partner?', 'Yes. Give 15 days’ written notice at any time.'],
  ];

  function page() {
    const arrow = icon('arrow_outward', 'arrow');
    return `<article class="division-experience partner-page">
<section class="division-cover partner-cover"><img src="assets/reference-projects/reference-residential-01.jpg" alt="Solar panels on a house roof overlooking a Philippine city" fetchpriority="high" width="1440" height="948"><div class="cover-shade"></div><div class="cover-copy"><a href="#/" class="back-divisions">← Home</a><h1>Refer solar.<br>Earn 5%.</h1><p>Know a home or business ready for solar? Introduce them. We handle the rest.</p><a class="button" href="${applyLink}">${icon('handshake')}Become a partner</a></div></section>
<nav class="division-subnav partner-subnav" aria-label="Partner sections"><a href="#partner-earn" data-scroll="partner-earn">Earnings</a><a href="#partner-journey" data-scroll="partner-journey">How it works</a><a href="#partner-terms" data-scroll="partner-terms">The terms</a><a href="#partner-questions" data-scroll="partner-questions">Questions</a></nav>
<div class="division-wrap partner-content">
<section id="partner-earn" class="division-section partner-earn"><div class="section-heading"><h2>One introduction.<br>One clear payout.</h2><p>You earn 5% of every solar project you bring in, once the client has paid in full.</p></div>
<div class="partner-calc" data-partner-calc><div class="partner-calc-result"><span>You could earn</span><output id="partner-total" aria-live="polite">${peso(500000 * rate * 2)}</output><p id="partner-sum">5% of 2 projects at ${peso(500000)}</p></div>
<div class="partner-calc-controls"><div class="partner-range"><div><label for="partner-value">Project value</label><output for="partner-value" id="partner-value-out">${peso(500000)}</output></div><input id="partner-value" type="range" min="100000" max="5000000" step="50000" value="500000"><div class="partner-range-scale" aria-hidden="true"><span>₱100k</span><span>₱5M</span></div></div>
<div class="partner-range"><div><label for="partner-count">Projects referred</label><output for="partner-count" id="partner-count-out">2</output></div><input id="partner-count" type="range" min="1" max="10" step="1" value="2"><div class="partner-range-scale" aria-hidden="true"><span>1</span><span>10</span></div></div>
<p class="partner-note">Illustration only. Project values vary by property, and your signed agreement sets how commission is calculated.</p></div></div></section>
<section id="partner-journey" class="division-section partner-journey"><div class="section-heading"><h2>From hello<br>to payout.</h2><p>Seven steps. You make the introduction; our solar team does the rest.</p></div>
<div class="partner-slides" role="region" aria-roledescription="carousel" aria-label="Partner journey, ${steps.length} steps" data-partner-slides>
<div class="partner-slide-media">${steps.map(([title, , img, alt], i) => `<img src="assets/${img}" alt="${alt}" loading="lazy" width="1200" height="800" data-slide-image="${i}"${i ? ' hidden' : ''}>`).join('')}<span class="partner-photo-note">Illustrative photo</span></div>
<div class="partner-slide-copy"><p class="partner-count"><strong data-slide-number>1</strong><span>/ ${steps.length}</span></p><div class="partner-progress" role="group" aria-label="Choose a step">${steps.map(([title], i) => `<button type="button" data-slide-go="${i}" aria-label="Step ${i + 1}: ${title}"${i ? '' : ' aria-current="step"'}><span></span></button>`).join('')}</div>
<ol class="partner-slide-list" aria-live="polite">${steps.map(([title, text], i) => `<li data-slide="${i}"${i ? ' hidden' : ''}><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>
<div class="partner-slide-nav"><button type="button" class="partner-prev" data-slide-prev aria-label="Previous step">${icon('arrow_back')}</button><button type="button" class="button partner-next" data-slide-next><span data-next-label>Next step</span>${icon('arrow_forward')}</button></div></div></div></section>
<section id="partner-terms" class="division-section partner-terms"><div class="section-heading"><h2>The deal,<br>in plain words.</h2><p>Every partner signs the Solar Sales Agency Agreement. These are its key terms.</p></div>
<dl class="partner-termsheet">${terms.map(([label, value, note]) => `<div><dt>${label}</dt><dd><strong>${value}</strong><span>${note}</span></dd></div>`).join('')}</dl>
<details class="partner-fine"><summary>Read the fine print ${icon('expand_more')}</summary><dl>${fine.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl><p>This summary is a guide. The signed agreement is what applies.</p></details></section>
<section id="partner-roles" class="division-section partner-roles"><div class="section-heading"><h2>Clear on<br>both sides.</h2><p>What we expect from you, and what you can expect from us.</p></div>
<div class="partner-roles-grid"><div class="partner-role"><h3>You</h3><ul>${yours.map(([t, d]) => `<li>${icon('check')}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ul></div><div class="partner-role partner-role-ours"><h3>Techouse</h3><ul>${ours.map(([t, d]) => `<li>${icon('check')}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ul></div></div></section>
<section id="partner-questions" class="division-section construction-questions partner-questions"><div class="section-heading"><h2>Questions<br>partners ask.</h2></div>${questions.map(([q, a]) => `<details><summary>${q}${icon('expand_more')}</summary><p>${a}</p></details>`).join('')}</section>
</div>
<section class="partner-close" aria-labelledby="partner-close-title"><div><h2 id="partner-close-title">Your network could be<br>powering rooftops.</h2><p>Tell us about yourself. Nothing is binding until both sides sign.</p><a class="button partner-close-button" href="${applyLink}">Become a partner ${arrow}</a><a class="partner-close-call" href="tel:+639855626888">${icon('call')}Or call +63 985 562 6888</a></div></section>
</article>`;
  }

  // CONTENT: promo banners shown on other pages. Each placement has its own hook.
  function promo(place) {
    const arrow = icon('arrow_outward', 'arrow');
    const strips = {
      directory: ['Know someone going solar?', 'Refer them and earn 5% when their project is paid.'],
      strip: ['Turn introductions into income.', 'Earn 5% on every paid solar project you refer.'],
    };
    if (strips[place]) {
      const [lead, text] = strips[place];
      return `<aside class="partner-strip partner-strip-${place} container" aria-label="Partner program"><p><strong>${lead}</strong> ${text}</p><a class="text-link" href="#/partnership">Become a partner ${arrow}</a></aside>`;
    }
    if (place === 'about')
      return `<section class="partner-promo partner-promo-steps" aria-label="Partner program"><img src="assets/solar-story/daytime.jpg" alt="" loading="lazy" width="1100" height="744"><div class="partner-promo-copy"><h2>Grow with Techouse.</h2><p>Become a solar partner. You make the introduction; we do the rest.</p><a class="button" href="#/partnership">Become a partner ${arrow}</a></div><ol class="partner-promo-route"><li><strong>Introduce</strong><span>a home or business</span></li><li><strong>We install</strong><span>design, build, finance</span></li><li><strong>You earn 5%</strong><span>within 7 days of final payment</span></li></ol></section>`;
    // Solar page: the question, the worked payout, its terms, then one action; a neighbourhood photo beside it.
    return `<section class="partner-promo partner-promo-figure-led" aria-label="Partner program"><div class="partner-promo-copy"><h2>Know someone going solar?</h2><p class="partner-promo-amount"><span>You earn</span> <strong>${peso(25000)}</strong></p><p class="partner-promo-terms">Example: 5% of a ${peso(500000)} system, paid within 7 days of the final payment.</p><a class="button" href="#/partnership">Refer someone ${icon('arrow_forward', 'arrow')}</a></div><img src="assets/solar-story/neighborhood.jpg" alt="" loading="lazy" width="674" height="1200"></section>`;
  }

  function mountCalc() {
    const root = document.querySelector('[data-partner-calc]');
    if (!root) return;
    const value = root.querySelector('#partner-value'),
      count = root.querySelector('#partner-count'),
      total = root.querySelector('#partner-total'),
      sum = root.querySelector('#partner-sum'),
      valueOut = root.querySelector('#partner-value-out'),
      countOut = root.querySelector('#partner-count-out');
    const fill = (input) =>
      input.style.setProperty('--fill', ((input.value - input.min) / (input.max - input.min)) * 100 + '%');
    // The payout figure is the page's one authored motion: it runs to the new amount.
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let shown = v0(),
      frame = 0;
    function v0() {
      return +value.value * rate * +count.value;
    }
    const runTo = (target) => {
      cancelAnimationFrame(frame);
      if (still.matches) {
        shown = target;
        total.textContent = peso(target);
        return;
      }
      const from = shown,
        start = performance.now(),
        duration = 420;
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration),
          eased = 1 - Math.pow(2, -10 * t);
        shown = from + (target - from) * (t === 1 ? 1 : eased);
        total.textContent = peso(shown);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const update = () => {
      const v = +value.value,
        c = +count.value;
      valueOut.textContent = peso(v);
      countOut.textContent = String(c);
      runTo(v * rate * c);
      sum.textContent = `5% of ${c} project${c === 1 ? '' : 's'} at ${peso(v)}`;
      value.setAttribute('aria-valuetext', peso(v));
      fill(value);
      fill(count);
    };
    value.addEventListener('input', update);
    count.addEventListener('input', update);
    update();
  }

  function mountSlides() {
    const root = document.querySelector('[data-partner-slides]');
    if (!root) return;
    const images = [...root.querySelectorAll('[data-slide-image]')],
      items = [...root.querySelectorAll('[data-slide]')],
      dots = [...root.querySelectorAll('[data-slide-go]')],
      number = root.querySelector('[data-slide-number]'),
      nextLabel = root.querySelector('[data-next-label]'),
      still = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    const show = (index) => {
      const next = (index + steps.length) % steps.length;
      if (next === current) return;
      const previous = images[current];
      images[next].hidden = false;
      if (!still.matches) {
        images[next].animate([{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'scale(1)' }], {
          duration: 520,
          easing: 'cubic-bezier(.16,1,.3,1)',
        });
        items[next].animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
          duration: 380,
          easing: 'cubic-bezier(.16,1,.3,1)',
        });
      }
      previous.hidden = true;
      items[current].hidden = true;
      items[next].hidden = false;
      current = next;
      number.textContent = String(current + 1);
      nextLabel.textContent = current === steps.length - 1 ? 'Start again' : 'Next step';
      dots.forEach((dot, i) => {
        dot.classList.toggle('done', i < current);
        if (i === current) dot.setAttribute('aria-current', 'step');
        else dot.removeAttribute('aria-current');
      });
    };
    root.querySelector('[data-slide-next]').addEventListener('click', () => show(current + 1));
    root.querySelector('[data-slide-prev]').addEventListener('click', () => show(current - 1));
    dots.forEach((dot) => dot.addEventListener('click', () => show(+dot.dataset.slideGo)));
    root.addEventListener('keydown', (event) => {
      if (event.target.closest('input,textarea')) return;
      if (event.key === 'ArrowRight') show(current + 1);
      else if (event.key === 'ArrowLeft') show(current - 1);
    });
    // Swipe the photo on touch screens.
    const media = root.querySelector('.partner-slide-media');
    let startX = null;
    media.addEventListener('pointerdown', (event) => (startX = event.clientX));
    const resetSwipe = () => (startX = null);
    media.addEventListener('pointercancel', resetSwipe);
    media.addEventListener('pointerleave', resetSwipe);
    media.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) > 40) show(current + (delta < 0 ? 1 : -1));
    });
  }

  // Promo banners join pages whose markup comes from other modules.
  function mountPromos(path) {
    if (path === '/divisions/solar' && !document.querySelector('.partner-promo')) {
      const projects = document.querySelector('#projects');
      if (projects) projects.insertAdjacentHTML('afterend', promo('solar'));
      else
        document
          .querySelector('.division-next')
          ?.insertAdjacentHTML('beforebegin', `<div class="division-wrap">${promo('solar')}</div>`);
    }
  }

  // Floating "Become a partner" button, beside Back to top, on the partner page and the Solar page.
  // It shows once the cover's button has scrolled away and steps aside while the page's own
  // partner call to action (the closing section, or the Solar partner banner) is on screen.
  let floatObserver;
  const floatPages = {
    '/partnership': {
      href: applyLink,
      label: 'Become a partner',
      watch: ['.partner-cover .button', '.partner-close'],
    },
    // Solar visitors are mostly customers: open the partner page beside their solar research.
    '/divisions/solar': {
      href: '#/partnership',
      label: 'Refer &amp; Earn',
      newTab: true,
      watch: ['.division-cover .button', '.partner-promo'],
    },
  };
  function mountFloat(path) {
    floatObserver?.disconnect();
    document.querySelector('.partner-float')?.remove();
    const setup = floatPages[path];
    if (!setup) return;
    const watched = setup.watch.map((selector) => document.querySelector(selector)).filter(Boolean);
    if (!watched.length) return;
    const button = document.createElement('a');
    button.className = 'partner-float';
    button.href = setup.href;
    button.innerHTML = `${icon('handshake')}<span>${setup.label}</span>`;
    if (setup.newTab) {
      button.target = '_blank';
      button.rel = 'noopener';
      button.setAttribute('aria-label', 'Refer & Earn: partner program (opens in a new tab)');
    }
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    document.body.append(button);
    const onScreen = new Set();
    floatObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting ? onScreen.add(entry.target) : onScreen.delete(entry.target),
      );
      const visible = onScreen.size === 0;
      button.classList.toggle('is-visible', visible);
      button.tabIndex = visible ? 0 : -1;
      button.setAttribute('aria-hidden', String(!visible));
    });
    watched.forEach((element) => floatObserver.observe(element));
  }

  function mount(path) {
    mountPromos(path);
    mountFloat(path);
    if (path === '/partnership/apply') mountApply();
    if (path !== '/partnership') return;
    mountCalc();
    mountSlides();
  }

  // APPLICATION: #/partnership/apply. Sent to the team's inbox on the hosted site (topic: partnership);
  // the static demo keeps it with the browser-local demo inquiries.
  const roles = [
    'Property or real-estate agent',
    'Electrician or contractor',
    'Business owner',
    'Community or group leader',
    'Existing Techouse client',
    'Something else',
  ];
  const audiences = ['Homeowners', 'Businesses', 'Factories or warehouses'];
  const stages = ['About you', 'Your network', 'Review'];
  function applyPage() {
    const arrow = icon('arrow_forward');
    const field = (id, label, attrs, hint = '') =>
      `<div class="field"><label for="pa-${id}">${label}${hint ? ` <small>${hint}</small>` : ''}</label><input id="pa-${id}" name="${id}" ${attrs}></div>`;
    return `<div class="partner-page partner-apply-wrap"><div class="container breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/partnership">Be a partner</a><span>/</span><span>Apply</span></div>
<section class="container page-hero partner-apply-hero"><h1>Apply to be<br>a partner.</h1><p>Three short steps. Nothing is binding until both sides sign the agreement.</p></section>
<div class="container partner-apply">
<div class="form-card partner-apply-card" id="partner-apply-area">
<ol class="partner-apply-steps" aria-label="Application progress">${stages.map((name, i) => `<li data-stage="${i}"${i ? '' : ' aria-current="step"'}><span>${i + 1}</span>${name}</li>`).join('')}</ol>
<form id="partner-apply" novalidate>
<fieldset data-step="0"><legend tabindex="-1">About you</legend><div class="field-grid">
${field('name', 'Full name', 'autocomplete="name" required maxlength="100" placeholder="Your full name"')}
${field('phone', 'Mobile number', 'type="tel" autocomplete="tel" required maxlength="35" placeholder="09XX XXX XXXX"')}
${field('email', 'Email', 'type="email" autocomplete="email" maxlength="200" placeholder="you@example.com"', '(optional)')}
${field('location', 'City or province', 'required maxlength="200" placeholder="e.g. Lipa, Batangas"')}
</div></fieldset>
<fieldset data-step="1" hidden><legend tabindex="-1">Your network</legend>
<div class="partner-choice-group" role="radiogroup" aria-labelledby="pa-role-label"><p class="partner-choice-label" id="pa-role-label">What best describes you?</p><div class="partner-choices">${roles.map((r, i) => `<label class="partner-choice"><input type="radio" name="role" value="${r}" required${i ? '' : ' data-first'}><span>${r}</span></label>`).join('')}</div></div>
<fieldset class="partner-choice-group"><legend class="partner-choice-label">Who could you introduce? <small>(choose any)</small></legend><div class="partner-choices partner-choices-3">${audiences.map((a) => `<label class="partner-choice"><input type="checkbox" name="audience" value="${a}"><span>${a}</span></label>`).join('')}</div></fieldset>
<div class="field"><label for="pa-network">Tell us about your network <small>(optional)</small></label><textarea id="pa-network" name="network" maxlength="2000" rows="4" placeholder="Where are they, and what kind of properties do they have?"></textarea></div>
</fieldset>
<fieldset data-step="2" hidden><legend tabindex="-1">Review</legend>
<dl class="partner-review" data-review></dl>
<div class="partner-agree">
<label><input type="checkbox" name="agreeRole" required><span>I understand partners work as independent contractors paid by commission, not as Techouse employees.</span></label>
<label><input type="checkbox" name="agreeAccuracy" required><span>I will present Techouse pricing, warranties and terms accurately, without promises Techouse hasn’t made.</span></label>
<label><input type="checkbox" name="agreeContact" required><span>Techouse may contact me about this application.</span></label>
</div>
<p class="form-note">${window.TechousePlatformMode ? 'Your details go only to the Techouse solar team, who use them to review this application.' : 'Demo only. This application stays in your current browser and is not sent to Techouse.'}</p>
</fieldset>
<div class="partner-apply-actions"><button type="button" class="partner-apply-back" data-apply-back aria-label="Back" hidden>${icon('arrow_back')}<span>Back</span></button><button type="button" class="button" data-apply-next>Continue ${arrow}</button><button type="submit" class="button partner-apply-submit" hidden>${window.TechousePlatformMode ? 'Send application' : 'Save application'} ${arrow}</button></div>
</form></div>
<aside class="partner-apply-aside" aria-label="About the partner program">
<img src="assets/reference-projects/reference-residential-01.jpg" alt="" loading="lazy" width="1440" height="948">
<div><h2>What happens next</h2><ol><li><strong>We review your application</strong><span>Using the details you share here.</span></li><li><strong>We call you</strong><span>To get to know you and answer questions.</span></li><li><strong>We sign together</strong><span>The Solar Sales Agency Agreement, before a notary.</span></li></ol>
<dl><div><dt>Commission</dt><dd>5%</dd></div><div><dt>Paid within</dt><dd>7 days</dd></div></dl>
<p>Questions first? <a href="tel:+639855626888">Call +63 985 562 6888</a></p></div>
</aside>
</div></div>`;
  }

  function mountApply() {
    const form = document.querySelector('#partner-apply');
    if (!form) return;
    const steps = [...form.querySelectorAll(':scope > fieldset[data-step]')],
      marks = [...document.querySelectorAll('.partner-apply-steps li')],
      back = form.querySelector('[data-apply-back]'),
      next = form.querySelector('[data-apply-next]'),
      submit = form.querySelector('.partner-apply-submit'),
      review = form.querySelector('[data-review]');
    let current = 0;
    const valid = (step) =>
      [...steps[step].querySelectorAll('input,textarea,select')].every((el) => el.reportValidity());
    const fillReview = () => {
      const data = new FormData(form);
      const rows = [
        ['Name', data.get('name')],
        ['Mobile', data.get('phone')],
        ['Email', data.get('email') || 'Not given'],
        ['Location', data.get('location')],
        ['You are', data.get('role')],
        ['Could introduce', data.getAll('audience').join(', ') || 'Not chosen'],
      ];
      review.innerHTML = rows
        .map(([t, v]) => `<div><dt>${t}</dt><dd>${esc(String(v || '').trim())}</dd></div>`)
        .join('');
    };
    const go = (index) => {
      const direction = index > current ? 1 : -1;
      current = index;
      steps.forEach((step, i) => (step.hidden = i !== current));
      marks.forEach((mark, i) => {
        mark.classList.toggle('done', i < current);
        if (i === current) mark.setAttribute('aria-current', 'step');
        else mark.removeAttribute('aria-current');
      });
      back.hidden = current === 0;
      next.hidden = current === steps.length - 1;
      submit.hidden = current !== steps.length - 1;
      if (current === steps.length - 1) fillReview();
      document.querySelector('#partner-apply-area').scrollIntoView({ block: 'start', behavior: 'instant' });
      // Focus the step heading so keyboard and screen-reader users land on the new step.
      steps[current].querySelector(':scope > legend')?.focus({ preventScroll: true });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        steps[current].animate(
          [
            { opacity: 0, transform: `translateX(${direction * 16}px)` },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' },
        );
    };
    next.addEventListener('click', () => valid(current) && go(current + 1));
    back.addEventListener('click', () => go(current - 1));
    // Enter in a text field moves forward instead of submitting early.
    form.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.matches('input:not([type=checkbox]):not([type=radio])') && current < steps.length - 1) {
        event.preventDefault();
        next.click();
      }
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!valid(current)) return;
      const data = new FormData(form);
      const text = (k) => String(data.get(k) || '').trim();
      const audience = data.getAll('audience').join(', ');
      const record = {
        topic: 'partnership',
        name: text('name'),
        company: '',
        email: text('email'),
        phone: text('phone'),
        division: 'solar',
        location: text('location'),
        capacity: '',
        requirements: `Partner application\nRole: ${text('role')}\nCould introduce: ${audience || 'Not chosen'}${text('network') ? '\n\n' + text('network') : ''}`,
      };
      const saved = await window.TechouseInquiries?.add(record);
      if (!saved) return;
      const first = esc(record.name.split(/\s+/)[0]);
      const area = document.querySelector('#partner-apply-area');
      area.innerHTML = `<div class="success partner-apply-done" tabindex="-1"><div class="success-icon" aria-hidden="true">${icon('check')}</div><h2>Thank you, ${first}.</h2>${saved.token ? `<p>Your application has been sent to the Techouse solar team.</p><p><strong>Reference</strong><br><code>${esc(saved.id)}</code></p><p>We will call you on <strong>${esc(record.phone)}</strong> to talk it through.</p>` : `<p>Your demo application is saved in this browser. It has not been sent to Techouse.</p><p><strong>Demo reference</strong><br><code>${esc(saved.id)}</code></p><p>When applications go live, our solar team will call you on <strong>${esc(record.phone)}</strong> to talk it through.</p>`}<div class="partner-apply-done-links"><a class="button" href="#/partnership">Back to Be a partner ${icon('arrow_outward', 'arrow')}</a><a class="text-link" href="#/partnership" data-go-terms>Read the terms again</a></div></div>`;
      document.querySelector('.partner-apply-hero h1').innerHTML = saved.token ? 'Application<br>sent.' : 'Application<br>saved.';
      area.querySelector('.success').focus({ preventScroll: true });
      area.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  const esc = (v = '') =>
    String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  return { page, applyPage, promo, mount, applyLink };
})();
