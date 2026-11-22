/**
 * Be a partner: the solar sales partner page (#/partnership), its interactions and the promo
 * banners shown on other pages. Terms come from the Solar Sales Agency Agreement; keep them in
 * step with the signed agreement. Applications use the inquiry form with topic=partnership.
 */
window.TechousePartner = (() => {
  const icon = (name, extra) => window.TechouseIcons.icon(name, extra);
  const applyLink = '#/inquiry?topic=partnership';
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
    // Solar page: a worked example in pesos.
    return `<section class="partner-promo partner-promo-figure-led" aria-label="Partner program"><img src="assets/reference-projects/reference-residential-02.jpg" alt="" loading="lazy" width="1440" height="948"><div class="partner-promo-figure"><strong>${peso(25000)}</strong><span>your 5% of a ${peso(500000)} system (example)</span></div><div class="partner-promo-copy"><h2>Know someone going solar?</h2><p>Introduce them to Techouse. You’re paid within 7 days of their final payment.</p><a class="button" href="#/partnership">Become a partner ${arrow}</a></div></section>`;
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

  function mount(path) {
    mountPromos(path);
    if (path !== '/partnership') return;
    mountCalc();
    mountSlides();
  }

  // Prefill the inquiry form for a partner application.
  function prepareInquiry() {
    const form = document.querySelector('#inquiry-form');
    if (!form) return;
    document.body.classList.add('partner-inquiry');
    const hero = document.querySelector('.page-hero');
    hero.querySelector('.eyebrow')?.remove();
    hero.querySelector('h1').innerHTML = 'Become a<br>Techouse partner.';
    hero.querySelector('p').textContent =
      'Tell us about yourself and the people you could introduce. Nothing is binding until both sides sign the agreement.';
    document.querySelector('.breadcrumb span:last-child').textContent = 'Become a partner';
    document.querySelector('#inquiry-form-area h2').textContent = 'Tell us about yourself.';
    form.elements.division.value = 'solar';
    document.querySelector('label[for="inquiry-company"]').innerHTML = 'Work or company <small>(optional)</small>';
    form.elements.company.placeholder = 'e.g. Real-estate agent, electrician';
    document.querySelector('label[for="inquiry-location"]').textContent = 'Your location *';
    form.elements.capacity.closest('.field').style.display = 'none';
    document.querySelector('label[for="inquiry-requirements"]').textContent = 'Who could you introduce? *';
    form.elements.requirements.placeholder = 'Homes, businesses or factories you know, and where they are.';
    form.elements.requirements.value = 'Partner application\nWho I could introduce:\nWhere they are:\n';
    form.elements.requirements.rows = 6;
    form.elements.requirements.style.minHeight = '190px';
    const aside = document.querySelector('.contact-aside');
    if (aside) {
      aside.querySelector('h3').textContent = 'Prefer to talk first?';
      aside.querySelector(':scope > p').textContent = 'Call or email us with questions about the partner program.';
      const ready = aside.querySelectorAll('.contact-item')[2];
      if (ready) {
        ready.querySelector('span').textContent = 'HELPFUL TO SHARE';
        ready.querySelector('p').textContent =
          'What you do, the areas you cover and the kinds of homes or businesses you know.';
      }
    }
  }

  return { page, promo, mount, prepareInquiry, applyLink };
})();
