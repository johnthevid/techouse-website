/**
 * Application entry point. Owns shared division data, hash routes, page templates, and browser-only demo records.
 * Read README.md first; edit banner copy in banner.js and solar questions in solar-journey.js.
 */
'use strict';

const $ = (s, root = document) => root.querySelector(s);
const esc = (v = '') =>
  String(v).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const arrow = window.TechouseIcons.icon('arrow_outward', 'arrow');
const brand = `<span class="brand"><img class="brand-logo" src="assets/techouse-logo-horizontal.png" alt="Techouse" width="2172" height="724"></span>`;
const officeIcon = window.TechouseIcons.icon('dashboard');
const elevatorArt =
  '<div class="icon-scene"><svg viewBox="0 0 320 300" aria-hidden="true"><path d="M55 270V30h210v240M45 270h230M75 50h170v200H75Z"/><path d="M160 80v170M90 80h140v170H90ZM125 60l10-7 10 7M175 53l10 7 10-7M105 95h40v100h-40ZM175 95h40v100h-40Z"/><path d="M20 270h280M20 290h280M265 100h20v35h-20"/><circle cx="275" cy="110" r="2"/><circle cx="275" cy="125" r="2"/><path d="M75 270v15M245 270v15" stroke="#bc6e3a"/></svg></div>';

// CONTENT: shared division identities and descriptions. Keep id values stable; routes and forms depend on them.
const divisions = [
  {
    id: 'solar',
    number: '01',
    short: 'Solar energy',
    name: 'Solar energy solutions',
    image: 'solar.c391b72bc407.jpg',
    alt: 'Illustrative residential rooftop solar panels surrounded by trees',
    tagline: 'A clearer path to your solar project.',
    description:
      'Explore the solar energy division and share your site, energy needs, and project requirements.',
    overview:
      'Solar Energy Solution is listed on the existing Techouse website. This sample brings solar inquiries into a dedicated space, with the details needed to begin a conversation.',
    prompts: [
      'Project location and property type',
      'Electricity usage or a recent monthly bill',
      'Roof or available installation area',
      'Target capacity, if already known',
    ],
    note: 'Equipment availability, system design, pricing, certifications, warranties, and partner arrangements require confirmation from Techouse.',
  },
  {
    id: 'construction',
    number: '02',
    short: 'Construction',
    name: 'Construction',
    image: 'construction.5154dbc7c67d.jpg',
    alt: 'Illustrative building site with workers and concrete structural work',
    tagline: 'Start with the vision. Define the details.',
    description:
      'Tell us about the building you have in mind, your site, and the stage of your project.',
    overview:
      'The existing company profile describes Techouse’s work in construction technology and prefabricated building systems. Explore the construction division and discuss your building requirements.',
    prompts: [
      'Building type and intended use',
      'Site location and approximate floor area',
      'Available drawings or project brief',
      'Expected schedule and budget range',
    ],
    note: 'General contracting packages, engineering services, project coverage, and delivery timelines are subject to scope confirmation.',
  },
  {
    id: 'prefabrication',
    number: '03',
    short: 'Prefabrication',
    name: 'Prefabrication',
    image: 'architecture.26e250a22279.jpg',
    alt: 'Illustrative contemporary modular-style residence with geometric building volumes',
    tagline: 'Explore a different way to build.',
    description:
      'Discover the prefabricated building division and discuss the requirements for your next space.',
    overview:
      'Techouse’s existing website lists prefab concrete buildings and describes prefabricated modular buildings and assemblies. This sample provides a dedicated place to explore that offering.',
    prompts: [
      'Intended use and number of units',
      'Preferred layout and approximate floor area',
      'Site access and installation location',
      'Required finishes and target schedule',
    ],
    note: 'The photograph is illustrative. Available models, materials, engineering specifications, prices, and installation lead times must be confirmed.',
  },
  {
    id: 'development',
    number: '04',
    short: 'Real estate development',
    name: 'Real estate development',
    image: 'development.c87084358595.jpg',
    alt: 'Illustrative contemporary building facade viewed from below',
    tagline: 'A place to begin the bigger conversation.',
    description:
      'Share your property concept, location, and development goals with the relevant team.',
    overview:
      'Real Estate Development is listed as a service on the existing Techouse website. The reference page does not specify the detailed development services currently available.',
    prompts: [
      'Property location and approximate land area',
      'Current site condition and intended use',
      'Concept plans or available documents',
      'Your development goals and inquiry',
    ],
    note: 'Land development, subdivision works, permits, and specific development capabilities are not confirmed. They are inquiry topics in this prototype, not advertised services.',
  },
  {
    id: 'elevators',
    number: '05',
    short: 'Elevator engineering',
    name: 'Elevator engineering',
    image: 'Techouse Images/Elevator.b55adcb70afa.webp',
    alt: 'Glass panoramic elevators against a contemporary tower',
    tagline: 'Connect the floors. Start the conversation.',
    description:
      'A dedicated inquiry route for the elevator engineering service listed by Techouse.',
    overview:
      'Elevator Engineering appears in the service navigation of the existing Techouse website. This sample includes it so the confirmed service areas remain accessible in one place.',
    prompts: [
      'Building location and intended use',
      'Number of floors and approximate travel height',
      'New installation or existing building',
      'Available plans and specific requirements',
    ],
    note: 'Product range, installation scope, maintenance options, technical requirements, and pricing need confirmation.',
  },
];
const getDivision = (id) => divisions.find((d) => d.id === id);
const divisionOptions = (selected = '', includeGeneral = false) =>
  `<option value="">Select a division</option>${includeGeneral ? `<option value="general" ${selected === 'general' ? 'selected' : ''}>Company updates</option>` : ''}${divisions.map((d) => `<option value="${d.id}" ${selected === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}`;
const category = (id) =>
  id === 'general' ? 'Company updates' : getDivision(id)?.short || 'Company updates';
const covers = ['architecture.jpg', 'solar.jpg', 'construction.jpg', 'development.jpg'];
const coverURL = (name) =>
  /^(data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|assets\/[a-zA-Z0-9_./ -]+)$/.test(
    name || '',
  )
    ? name
    : `assets/${covers.includes(name) ? name : 'architecture.jpg'}`;
const dateText = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? 'Saved recently'
    : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};
const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
// DEMO CONTENT: initial example posts, used only when this browser has no saved records.
const seeds = [
  {
    id: 'sample-welcome',
    title: 'One place to explore Techouse',
    summary: 'A sample update showing how approved company news can appear on the website.',
    body: 'This is example content for the private website presentation. It is not a company announcement.\n\nThe proposed website brings the company’s divisions, inquiries, and news together in one place. Use the Back office to create a new post, edit this example, or remove it.\n\nIn this prototype, a published post appears immediately in Updates. Changes are saved in the current browser only.',
    division: 'general',
    cover: 'architecture.jpg',
    status: 'published',
    sample: true,
    createdAt: '2026-10-22T00:00:00+08:00',
    updatedAt: '2026-10-22T00:00:00+08:00',
  },
  {
    id: 'sample-solar',
    title: 'Preparing your solar project inquiry',
    summary: 'A sample guide to the information you can include when discussing a solar project.',
    body: 'This is an example editorial post for the presentation.\n\nStart with your project location and property type. A recent electricity bill or a description of energy use can help frame the discussion.\n\nIf you already have a target capacity or available roof area, add it to your inquiry. Technical design, product availability, and pricing require review by the company.\n\nThe inquiry form in this sample is a demo. It saves the inquiry in this browser and does not send it to Techouse.',
    division: 'solar',
    cover: 'solar.jpg',
    status: 'published',
    sample: true,
    createdAt: '2026-10-22T00:00:00+08:00',
    updatedAt: '2026-10-22T00:00:00+08:00',
  },
  {
    id: 'sample-draft',
    title: 'Your next project update',
    summary: 'An example draft, ready for the team to replace with approved project details.',
    body: 'Replace this draft with verified project information and approved imagery before publishing.',
    division: 'construction',
    cover: 'construction.jpg',
    status: 'draft',
    sample: true,
    createdAt: '2026-10-22T00:00:00+08:00',
    updatedAt: '2026-10-22T00:00:00+08:00',
  },
];
// STORAGE: localStorage is per browser/origin, not a shared backend or protected staff account.
const postKey = 'techouse.sample.posts.v1',
  inquiryKey = 'techouse.sample.inquiries.v1';
let storageAvailable = true;
function readStore(key, fallback) {
  if (window.TechouseBoot && key === postKey) return structuredClone(window.TechouseBoot.posts);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw Error('Invalid data');
    return parsed.filter((x) => x && typeof x.id === 'string');
  } catch {
    storageAvailable = false;
    return structuredClone(fallback);
  }
}
let posts = readStore(postKey, seeds),
  inquiries = readStore(inquiryKey, []);
async function saveStore(key, data) {
  if (window.TechouseAdmin && key === postKey) {
    try {
      await window.TechousePlatform.savePosts(data);
      return true;
    } catch (error) {
      showToast(error.message);
      return false;
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    storageAvailable = true;
    return true;
  } catch {
    showToast('Could not save. Browser storage may be blocked or full.');
    return false;
  }
}
function publishedPosts() {
  return posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
function showToast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.classList.remove('show'), 4000);
}
// ROUTING: #/ paths are handled in the browser; no server-rendered pages are created.
function routeInfo() {
  const raw = location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/', params: new URLSearchParams(query) };
}
// SHARED LAYOUT: header and footer are regenerated for each route.
let inquiryCtaObserver;
function syncInquiryCta() {
  inquiryCtaObserver?.disconnect();
  const headerCta = document.querySelector(
    '#header .nav-actions > a.button, #header .banner-global-quote',
  );
  if (!headerCta || document.body.classList.contains('office-page')) return;
  const candidates = [
    ...document.querySelectorAll('#main a.button[href*="/inquiry"], #footer a[href*="/inquiry"]'),
  ];
  const visible = new Set();
  inquiryCtaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting && entry.intersectionRatio >= 0.5
          ? visible.add(entry.target)
          : visible.delete(entry.target),
      );
      const hidden = visible.size > 0;
      headerCta.classList.toggle('inquiry-cta-suppressed', hidden);
      headerCta.parentElement.classList.toggle('inquiry-cta-replaced', hidden);
      headerCta.inert = hidden;
      headerCta.setAttribute('aria-hidden', String(hidden));
    },
    { threshold: [0, 0.5, 1], rootMargin: '-100px 0px 0px' },
  );
  candidates.forEach((element) => inquiryCtaObserver.observe(element));
}
function renderHeader(path) {
  if (path === '/office' || path.startsWith('/office/')) {
    $('#header').innerHTML =
      `<div class="container office-header-bar"><a href="#/office" aria-label="Techouse back office">${brand}</a><span class="office-header-title">Back office</span><div class="office-header-controls"><a class="button outline small" href="/" target="_blank" rel="noopener">View website ↗</a><div class="office-theme-switch" role="group" aria-label="Back office theme"><button type="button" data-theme-choice="light" aria-pressed="true">Light</button><button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button><button type="button" data-theme-choice="grey" aria-pressed="false">Grey</button></div>${window.TechouseAdmin ? '<button class="office-signout" type="button" data-secure-signout>Sign out</button>' : ''}</div></div>`;
    return;
  }
  if (path === '/') {
    $('#header').innerHTML = window.TechouseBanner.header(brand, arrow);
    return;
  }
  const solarPage = /^\/divisions\/solar(?:\/|$)/.test(path);
  const inquiryLink = solarPage ? '#/inquiry?division=solar' : '#/inquiry';
  const inquiryLabel = solarPage ? 'Request a solar quote' : 'Start a project';
  $('#header').innerHTML =
    `<div class="container nav"><a href="#/" aria-label="Techouse home">${brand}</a><nav class="nav-links" id="site-nav" aria-label="Main navigation"><a class="${path.startsWith('/division') ? 'active' : ''}" href="#/divisions">Our divisions</a><a class="${path === '/about' ? 'active' : ''}" href="#/about">About Techouse</a><a class="${path === '/updates' ? 'active' : ''}" href="#/updates">Updates</a><a class="mobile-inquiry" href="${inquiryLink}">${inquiryLabel} ${arrow}</a></nav><div class="nav-actions"><a class="header-call" href="tel:+639855626888" aria-label="Call Techouse at +63 985 562 6888">${window.TechouseIcons.icon('call')}<span>Call us</span></a><a class="button small" href="${inquiryLink}">${inquiryLabel} ${arrow}</a><button class="menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${window.TechouseIcons.icon('menu')}</button></div></div>`;
}
function renderFooter(path) {
  const office = path === '/office' || path.startsWith('/office/');
  $('#footer').classList.toggle('office-footer', office);
  if (office) {
    $('#footer').innerHTML =
      `<div class="container office-footer-bar"><div><strong>Techouse · Back office</strong><p>Website content management</p></div><span>${window.TechouseAdmin ? 'Staff workspace · Sign out when you’re finished.' : 'Local workspace · Changes stay in this browser.'}</span></div>`;
    return;
  }
  $('#footer').innerHTML =
    `<div class="container"><div class="footer-top"><div><a href="#/" aria-label="Techouse home">${brand}</a><p>Construction. Energy. New possibilities.<br>Building your next possibility.</p></div><div class="footer-col"><span>EXPLORE</span><a href="#/divisions">Our divisions</a><a href="#/about">About Techouse</a><a href="#/updates">Company updates</a><a href="#/office">Employee back office</a></div><div class="footer-col"><span>LET’S TALK</span><a href="mailto:techouse889@gmail.com">techouse889@gmail.com</a><a href="tel:+639855626888">+63 985 562 6888</a><a href="#/inquiry">Start a project ${arrow}</a></div></div><div class="footer-bottom"><span>Techouse Technology Construction Corp</span></div></div>`;
}
const breadcrumb = (title) =>
  `<div class="container breadcrumb"><a href="#/">Home</a><span>/</span><span>${esc(title)}</span></div>`;
const cta = (
  title = 'What are you planning next?',
  body = 'Share your project and find the right division to begin with.',
) =>
  `<section class="cta-band"><div class="container cta-inner"><div><h2>${title}</h2><p>${body}</p></div><a class="button" href="#/inquiry">Start a project ${arrow}</a></div></section>`;
function divisionCard(d) {
  return `<a class="division-card" href="#/divisions/${d.id}"><div class="card-image"><img src="assets/${d.image}" alt="${d.alt}" loading="lazy" width="600" height="500"><span class="card-index">${d.number} / ${d.id === 'solar' ? 'ENERGY' : d.id === 'development' ? 'DEVELOPMENT' : 'BUILDING'}</span></div><h3>${d.short}${arrow}</h3><p>${esc(d.description)}</p></a>`;
}
function divisionDirectory() {
  const copy = {
    solar: [
      'Power your tomorrow.',
      'Explore how sunlight could help lower your electricity bills.',
    ],
    construction: ['Build your next chapter.', 'Bring your building plans to the conversation.'],
    prefabrication: ['Rethink your space.', 'Explore another way to create the space you need.'],
    development: [
      'Shape your next address.',
      'Discover possibilities for your property’s next chapter.',
    ],
    elevators: ['Rise to new possibilities.', 'Connect the floors of your building.'],
  };
  const images = window.TechouseContent?.snapshot().images || {};
  return `<section class="division-directory container" aria-label="Explore our five divisions">${divisions
    .map((d) => {
      const [heading, description] = copy[d.id];
      const image = images[d.id]
        ? window.TechouseContent.imageURL(images[d.id])
        : d.image
          ? 'assets/' + d.image
          : '';
      return `<a class="directory-card" href="#/divisions/${d.id}"><div class="directory-image">${image ? `<img src="${esc(image)}" alt="${esc(d.alt || d.short)}" loading="lazy" width="900" height="600">` : elevatorArt}<span>${d.number} / ${esc(d.short)}</span></div><div class="directory-copy"><h2>${heading}</h2><p>${description}</p><span class="directory-link">Explore ${esc(d.short.toLowerCase())} ${arrow}</span></div></a>`;
    })
    .join(
      '',
    )}<a class="directory-card directory-projects" href="#/divisions/solar?section=projects"><div class="directory-projects-intro"><span class="eyebrow">BEYOND THE POSSIBILITIES</span>${window.TechouseIcons.icon('solar_power')}<span class="directory-projects-caption">From the idea<br>to the rooftop.</span></div><div class="directory-copy"><h2>See solar in action.</h2><p>Explore the solar portfolio for project details, images and estimated savings. Approved project stories appear as they’re published.</p><span class="directory-link">Explore project stories ${arrow}</span></div></a><p class="visual-note">Illustrative imagery · photographs are not presented as completed Techouse projects.</p></section>`;
}
function divisionSection(withTitle = true) {
  return `<section class="section" id="divisions"><div class="container">${withTitle ? '<div class="section-head"><div><div class="eyebrow">01 / Our divisions</div><h2>Different expertise.<br>A connected destination.</h2></div><p>Find the right starting point for your building, energy, or property inquiry.</p></div>' : ''}<div class="division-grid">${divisions.slice(0, 4).map(divisionCard).join('')}</div><a class="additional-division" href="#/divisions/elevators"><span><small>05 / ALSO EXPLORE</small><h3>Elevator engineering</h3></span>${arrow}</a><p class="visual-note">Reference imagery only. The photographs shown are not Techouse projects.</p></div></section>`;
}
function postCard(p) {
  return `<a class="post-card" href="#/updates/${encodeURIComponent(p.id)}"><img src="${coverURL(p.cover)}" alt="Illustrative ${esc(category(p.division).toLowerCase())} cover image" loading="lazy" width="400" height="400"><div class="post-card-content"><div class="post-meta"><span>${esc(category(p.division))}</span>${p.sample ? '<span class="pill">EXAMPLE POST</span>' : ''}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="text-link">Read update ${arrow}</span></div></a>`;
}
function divisionPage(id) {
  const d = getDivision(id);
  return d ? window.TechouseDivisions.page(d, divisions, elevatorArt, arrow) : notFound();
}
function about() {
  return `${breadcrumb('About Techouse')}<section class="container page-hero about-introduction"><div class="eyebrow">GET TO KNOW TECHOUSE</div><h1>New ways to build.<br>More ways forward.</h1><p>Techouse brings construction technologies and solar energy solutions to the Philippines—connecting your plans with possibilities for the spaces you build and the energy you use.</p></section><div class="container content-columns about-company"><div><span class="eyebrow">CONSTRUCTION. ENERGY. POSSIBILITY.</span><h2>One company.<br>Five ways to move forward.</h2><p>Techouse Technology Construction Corp brings together construction, solar energy, prefabricated buildings, real estate development and elevator engineering. Each division offers a different starting point for your project.</p><p>Whether you’re exploring rooftop solar, planning a building or considering a new use for your property, start with what you want to achieve. Explore the relevant division, share your requirements, and discuss the next step with our team.</p><a class="text-link" href="#/divisions">Find your division ${arrow}</a></div>${window.TechouseAbout.panel()}</div><section class="container about-pathways"><div class="section-heading"><span>WHAT ARE YOU PLANNING?</span><h2>Start with your next step.</h2></div><div>${divisions.map((d) => `<a href="#/divisions/${d.id}"><span>${d.number}</span><strong>${esc(d.short)}</strong>${arrow}</a>`).join('')}</div></section>${cta('Have a project in mind?', 'Tell us what you’re planning. We’ll help you find the right conversation to start.')}`;
}

function inquiryPage(selected) {
  return `${breadcrumb('Start a project')}<section class="container page-hero"><div class="eyebrow">Let’s start a conversation</div><h1>Your next project<br>starts here.</h1><p>Tell us what you have in mind. Choose a division and share the details that matter.</p></section><div class="container contact-grid"><div class="form-card" id="inquiry-form-area"><h2>Tell us about your project.</h2><p>Fields marked * are required.</p><form id="inquiry-form"><div class="field-grid"><div class="field"><label for="inquiry-name">Full name *</label><input id="inquiry-name" name="name" autocomplete="name" required maxlength="100" placeholder="Your full name"></div><div class="field"><label for="inquiry-company">Company <small>(optional)</small></label><input id="inquiry-company" name="company" autocomplete="organization" maxlength="150" placeholder="Company or organization"></div><div class="field"><label for="inquiry-email">Email address *</label><input id="inquiry-email" name="email" type="email" autocomplete="email" required maxlength="200" placeholder="you@example.com"></div><div class="field"><label for="inquiry-phone">Mobile number <small>(optional)</small></label><input id="inquiry-phone" name="phone" type="tel" autocomplete="tel" maxlength="35" placeholder="+63"></div><div class="field"><label for="inquiry-division">Division *</label><select id="inquiry-division" name="division" required>${divisionOptions(getDivision(selected) ? selected : '')}</select></div><div class="field"><label for="inquiry-location">Project location *</label><input id="inquiry-location" name="location" required maxlength="200" placeholder="City / province"></div><div class="field full"><label for="inquiry-capacity">Size or required capacity <small>(optional)</small></label><input id="inquiry-capacity" name="capacity" maxlength="150" placeholder="e.g. 100 sq m, 10 kW, or number of units"></div><div class="field full"><label for="inquiry-requirements">Project requirements *</label><textarea id="inquiry-requirements" name="requirements" required minlength="10" maxlength="5000" placeholder="Tell us about your project, timeline, and any specific requirements."></textarea></div></div><p class="form-note">Demo only. This inquiry stays in your current browser and is not sent to Techouse. Use example details for the presentation.</p><div class="form-actions"><button class="button" type="submit">Save demo inquiry ${arrow}</button><small>No message will be sent.</small></div></form></div><aside class="contact-aside"><h3>Prefer a direct conversation?</h3><p>Contact details from the existing Techouse website.</p><div class="contact-item"><span>EMAIL</span><a href="mailto:techouse889@gmail.com">techouse889@gmail.com</a></div><div class="contact-item"><span>PHONE</span><a href="tel:+639855626888">+63 985 562 6888</a></div><div class="contact-item"><span>HELPFUL TO HAVE READY</span><p>A project location, a short brief, and any available plans or site details.</p></div><p class="visual-note">Service scope and contact details should be confirmed with Techouse before a public launch.</p></aside></div>`;
}
function updatesPage() {
  const list = publishedPosts();
  return `${breadcrumb('Updates')}<section class="container page-hero"><div class="eyebrow">From the team</div><h1>Ideas to build on.<br>News to move you forward.</h1><p>Explore news from Techouse, project stories and ideas for the spaces you build and the energy you use.</p></section><section class="container all-updates"><div class="filter-buttons" aria-label="Filter updates"><button class="active" data-update-filter="all" aria-pressed="true">All updates</button>${divisions
    .filter((d) => list.some((p) => p.division === d.id))
    .map((d) => `<button data-update-filter="${d.id}" aria-pressed="false">${d.short}</button>`)
    .join(
      '',
    )}</div><div class="post-grid" id="updates-grid">${list.length ? list.map(postCard).join('') : '<div class="empty-state"><h3>More stories are on the way.</h3><p>Check back for news and ideas from Techouse. In the meantime, explore what’s possible for your next project.</p><a class="button small" href="#/divisions">Explore our divisions</a></div>'}</div></section>`;
}
function postPage(id) {
  const p = posts.find((x) => x.id === id && x.status === 'published');
  if (!p) return notFound();
  return `${breadcrumb('Updates')}<article class="container article"><a class="back-link" href="#/updates">← Back to all updates</a><h1>${esc(p.title)}</h1><div class="post-meta"><span>${esc(category(p.division))}</span><span>${dateText(p.updatedAt)}</span>${p.sample ? '<span class="pill">EXAMPLE CONTENT · NOT A COMPANY ANNOUNCEMENT</span>' : ''}</div><p class="article-lead">${esc(p.summary)}</p><img src="${coverURL(p.cover)}" alt="Illustrative article cover, not a Techouse project" width="1000" height="600"><div class="article-body">${String(
    p.body || '',
  )
    .split(/\n\s*\n/)
    .map((t) => `<p>${esc(t)}</p>`)
    .join(
      '',
    )}</div><p class="visual-note">Reference imagery only; not a Techouse project.</p></article>${cta('Have a project in mind?')}`;
}
// DEMO BACK OFFICE: presentation UI only. There is no authentication or production authorization.
function adminTop(title, description, action = '') {
  if (window.TechouseAdmin)
    return `<div class="admin-top"><div><div class="eyebrow">Employee back office</div><h1>${title}</h1><p>${description}</p></div>${action}</div><div class="admin-disclosure">${officeIcon}<span>Secure workspace · Changes publish to the shared website.</span><a href="/admin#security">Account security</a></div>`;
  return `<div class="admin-top"><div><div class="eyebrow">Employee back office</div><h1>${title}</h1><p>${description}</p></div>${action}</div><div class="admin-disclosure">${officeIcon}<span>Local workspace · Changes save in this browser only.</span></div>${!storageAvailable ? '<div class="save-error" role="alert">Browser storage is unavailable or contains unreadable data. Saving may fail; existing saved records will not be overwritten unless you save changes.</div>' : ''}`;
}
function adminTabs(active) {
  const items = [
    ['dashboard', 'Overview', '/office'],
    ['inquiries', 'Inquiries', '/office/inquiries'],
    ['projects', 'Projects', '/office/projects'],
    ['customizer', 'Website & company info', '/office/customizer'],
    ['posts', 'Updates', '/office/posts'],
  ];
  return `<nav class="admin-tabs" aria-label="Back office sections">${items.map(([id, label, path]) => `<a href="#${path}" class="${active === id ? 'active' : ''}">${label}${id === 'inquiries' ? ` <span class="tab-count">${inquiries.length}</span>` : ''}</a>`).join('')}</nav>`;
}
function postRow(p) {
  return `<div class="post-row"><div class="row-title"><strong>${esc(p.title)}</strong><small>${esc(category(p.division))}${p.sample ? ' · Example content' : ''}</small></div><span class="status ${p.status === 'draft' ? 'draft' : ''}">${p.status === 'published' ? 'Published' : 'Draft'}</span><span class="row-date">${dateText(p.updatedAt)}</span><div class="row-actions">${p.status === 'published' ? `<a href="#/updates/${encodeURIComponent(p.id)}" aria-label="View ${esc(p.title)}">View</a>` : ''}<a href="#/office/edit/${encodeURIComponent(p.id)}" aria-label="Edit ${esc(p.title)}">Edit</a><button class="danger" data-delete-post="${esc(p.id)}" aria-label="Delete ${esc(p.title)}">Delete</button></div></div>`;
}
function adminDashboard() {
  const projects = window.TechouseContent.snapshot().projects;
  const unread = inquiries.filter((q) => !q.reviewedAt).length;
  const recent = [...inquiries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  const tasks = [
    [
      'Inquiries',
      'Review requests and contact potential customers.',
      '/office/inquiries',
      'info',
      `${unread} awaiting review`,
    ],
    [
      'Projects',
      'Manage your division portfolios. Solar projects are available now; the other divisions are planned.',
      '/office/projects',
      'solar_power',
      `${projects.filter((p) => p.status === 'published').length} published`,
    ],
    [
      'Website & company info',
      'Edit website wording, banner images and the company information visitors see.',
      '/office/customizer',
      'dashboard',
      'Website text, banners and About pages',
    ],
  ];
  return `<section class="container admin-shell office-dashboard">${adminTop('Overview', 'Choose a task or review your latest inquiries.')}${adminTabs('dashboard')}<div class="office-overview-stats office-stats-four"><a href="#/office/inquiries"><span>Total inquiries</span><strong>${inquiries.length}</strong></a><a href="#/office/inquiries"><span>Awaiting review</span><strong>${unread}</strong></a><a href="#/office/projects"><span>Published projects</span><strong>${projects.filter((p) => p.status === 'published').length}</strong></a><a href="#/office/posts"><span>Draft updates</span><strong>${posts.filter((p) => p.status === 'draft').length}</strong></a></div><div class="office-delivery-note">Email delivery is not connected yet. Inquiry counts currently cover requests saved in this browser.</div><div class="office-tool-grid office-three-tasks">${tasks.map(([title, description, path, icon, detail]) => `<article class="office-tool-card">${window.TechouseIcons.icon(icon)}<h2>${title}</h2><p>${description}</p><small>${detail}</small><div class="office-task-actions"><a class="button outline" href="#${path}">Open ${title.toLowerCase()} ↗</a></div></article>`).join('')}</div><section class="office-recent-inquiries"><div class="office-section-heading"><h2>Latest inquiries</h2><a class="text-link" href="#/office/inquiries">View all ↗</a></div>${recent.length ? recent.map(inquiryCard).join('') : '<p class="office-empty-note">No inquiries saved yet. New requests will appear here.</p>'}</section></section>`;
}
function adminPosts() {
  return `<section class="container admin-shell">${adminTop('Website posts', 'Create a post, choose a division, and publish it to Updates. You can edit or remove it at any time.', `<a class="button" href="#/office/new">+ Create a post</a>`)}${adminTabs('posts')}<div class="admin-tools"><div class="filter-buttons" aria-label="Filter posts"><button class="active" data-post-filter="all" aria-pressed="true">All posts (${posts.length})</button><button data-post-filter="published" aria-pressed="false">Published (${publishedPosts().length})</button><button data-post-filter="draft" aria-pressed="false">Drafts (${posts.filter((p) => p.status === 'draft').length})</button></div><input class="search-input" id="post-search" type="search" placeholder="Search posts…" aria-label="Search posts"></div><div class="post-table"><div class="table-heading"><span>POST</span><span>STATUS</span><span>UPDATED</span><span style="text-align:right">ACTIONS</span></div><div id="post-rows">${
    posts.length
      ? [...posts]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .map(postRow)
          .join('')
      : '<div class="empty-state"><h3>Your first update starts here.</h3><p>Create a post to add news to the website.</p><a class="button small" href="#/office/new">Create a post</a></div>'
  }</div></div></section>`;
}
function editorPage(id) {
  const p = id ? posts.find((x) => x.id === id) : null;
  if (id && !p) return notFound();
  const draft = p || {
    title: '',
    summary: '',
    body: '',
    division: 'general',
    cover: 'architecture.jpg',
    status: 'draft',
    sample: false,
  };
  return `<section class="container admin-shell"><a class="back-link" href="#/office/posts">← Back to posts</a><div style="height:24px"></div>${adminTop(p ? 'Edit website post' : 'Create a website post', 'Write in plain text, choose a cover, and save a draft or publish to the website.')}<form id="post-form" data-id="${esc(id || '')}"><div class="editor-layout"><div class="form-card"><div class="field"><label for="post-title">Post title *</label><input id="post-title" name="title" required maxlength="120" placeholder="Give your update a clear title" value="${esc(draft.title)}"></div><div class="field"><label for="post-summary">Short introduction *</label><textarea id="post-summary" name="summary" required maxlength="220" rows="3" placeholder="A short summary for the Updates page">${esc(draft.summary)}</textarea></div><div class="field"><label for="post-body">Post content *</label><textarea class="editor-body" id="post-body" name="body" required maxlength="12000" placeholder="Write your update here. Separate paragraphs with a blank line.">${esc(draft.body)}</textarea></div><div class="field"><label for="post-example">Content label</label><select id="post-example" name="sample"><option value="false" ${!draft.sample ? 'selected' : ''}>Regular post</option><option value="true" ${draft.sample ? 'selected' : ''}>Example / presentation content</option></select></div></div><aside class="editor-aside"><h3>Post settings</h3><div class="field"><label for="post-division">Division *</label><select id="post-division" name="division" required>${divisionOptions(draft.division, true)}</select></div><div class="field"><label for="post-cover">Cover image</label><select id="post-cover" name="cover">${covers.map((name, i) => `<option value="${name}" ${draft.cover === name ? 'selected' : ''}>${['Architecture', 'Solar panels', 'Construction site', 'Building facade'][i]} · illustrative</option>`).join('')}</select></div><img class="editor-cover" id="cover-preview" src="${coverURL(draft.cover)}" alt="Selected illustrative cover"><button class="button" type="submit" name="action" value="published">${p?.status === 'published' ? 'Update published post' : 'Publish post'} ${arrow}</button><button class="button outline" type="submit" name="action" value="draft">Save as draft</button><p>Published posts appear in the website’s Updates section. A draft stays in this back office.<br><br>${window.TechouseAdmin ? 'Saved changes publish to the shared website.' : 'Changes save in this browser.'}</p></aside></div></form></section>`;
}
function inquiryCard(q) {
  return `<div class="inquiry-card" data-reviewed="${!!q.reviewedAt}" data-inquiry-search="${esc([q.name, q.email, q.location, q.company].join(' ').toLowerCase())}"><div class="post-meta"><span class="pill">${q.reviewedAt ? 'Reviewed' : 'New'}</span><span class="pill">${esc(category(q.division))}</span><span>${dateText(q.createdAt)}</span></div><h3>${esc(q.name)}</h3><p>${esc(q.location)}${q.company ? ' · ' + esc(q.company) : ''}</p><p>${esc(q.email)}</p><div class="row-actions"><button data-view-inquiry="${esc(q.id)}">View inquiry</button><button class="danger" data-delete-inquiry="${esc(q.id)}">Delete</button></div></div>`;
}
function adminInquiries() {
  return `<section class="container admin-shell">${adminTop('Inquiries', 'Review requests and prepare your follow-up.')} ${adminTabs('inquiries')}<div class="office-delivery-note">Email delivery is not connected yet. These requests are saved in this browser.</div><div class="admin-tools"><div class="filter-buttons"><button class="active" data-inquiry-filter="all">All (${inquiries.length})</button><button data-inquiry-filter="new">Awaiting review (${inquiries.filter((q) => !q.reviewedAt).length})</button></div><input id="inquiry-search" class="search-input" type="search" aria-label="Search inquiries" placeholder="Search name, email or location…"></div><div class="inquiry-list">${inquiries.length ? [...inquiries].reverse().map(inquiryCard).join('') : '<div class="empty-state"><h3>No inquiries yet.</h3><p>Requests saved through the inquiry form will appear here.</p><a class="button small" href="#/inquiry">Open inquiry form ' + arrow + '</a></div>'}</div></section>`;
}
function notFound() {
  return `<div class="container not-found"><div class="eyebrow" style="justify-content:center">Page unavailable</div><h1>Let’s find your next step.</h1><p>This page or post is not available. Drafts appear only in the back office.</p><a class="button" href="#/">Return home ${arrow}</a></div>`;
}
let activePostFilter = 'all';
// RENDER LIFECYCLE: select a template, inject it, then mount module interactions in dependency order.
function render() {
  const { path, params } = routeInfo();
  const returningHome = path === '/' && render.previousPath && render.previousPath !== '/';
  if (window.TechousePlatformMode && !window.TechouseAdmin && path.startsWith('/office')) {
    location.replace('/admin');
    return;
  }
  if (window.TechousePlatformMode && !window.TechouseBoot) {
    $('#main').textContent =
      'Website content is temporarily unavailable. Please reload in a moment.';
    return;
  }
  render.previousPath = path;
  window.TechouseBanner.destroy();
  if (path !== '/') window.TechouseDivisions.clearPreviousPage();
  document.body.classList.toggle('office-page', path === '/office' || path.startsWith('/office/'));
  if (returningHome) window.TechouseDivisions.preservePreviousPage();
  document.body.classList.toggle(
    'division-page',
    path.startsWith('/divisions/') &&
      !path.startsWith('/divisions/solar/products/') &&
      !path.startsWith('/divisions/solar/projects/'),
  );
  document.body.classList.toggle('landing', path === '/');
  activePostFilter = 'all';
  renderHeader(path);
  if (path === '/inquiry')
    document.querySelectorAll('#header a[href="#/inquiry"]').forEach((link) => link.remove());
  renderFooter(path);
  let html;
  let title = 'Building what comes next';
  if (path === '/') html = window.TechouseBanner.html(divisions, elevatorArt, arrow);
  else if (path === '/divisions') {
    title = 'Our divisions';
    html = `${breadcrumb('Our divisions')}<section class="container page-hero divisions-introduction"><div><div class="eyebrow">ONE TECHOUSE. MORE POSSIBILITIES.</div><h1>What are you<br>building next?</h1></div><p>A lower electricity bill. A new space. A building brought to life. Explore our five divisions and find the right place to begin.</p></section>${divisionDirectory()}${cta()}`;
  } else if (path.startsWith('/divisions/solar/projects/')) {
    title = 'Solar project portfolio';
    html = divisionPage('solar');
  } else if (path.startsWith('/divisions/solar/products/')) {
    const kind = path.split('/')[4];
    title =
      'Skyworth ' +
      ({ panels: 'Solar panels', inverters: 'Inverters', batteries: 'Battery storage' }[kind] ||
        'Products');
    html = window.TechouseCatalogue.page(kind);
  } else if (path.startsWith('/divisions/')) {
    const id = path.split('/')[2];
    title = getDivision(id)?.name || 'Page unavailable';
    html = divisionPage(id);
  } else if (path === '/about') {
    title = 'About Techouse';
    html = about();
  } else if (path === '/inquiry') {
    title = 'Start a project';
    html = inquiryPage(params.get('division'));
  } else if (path === '/updates') {
    title = 'Updates';
    html = updatesPage();
  } else if (path.startsWith('/updates/')) {
    const id = decodeSegment(path.split('/')[2]);
    title = posts.find((x) => x.id === id)?.title || 'Update unavailable';
    html = postPage(id);
  } else if (path === '/office') {
    title = 'Overview · Back office';
    html = adminDashboard();
  } else if (path === '/office/posts') {
    title = 'Website posts · Back office';
    html = adminPosts();
  } else if (path === '/office/customizer') {
    title = 'Website customizer';
    html = window.TechouseContent.page(
      window.TechouseBanner.html(divisions, elevatorArt, arrow),
      about(),
      adminTop,
      adminTabs,
    );
  } else if (path === '/office/projects') {
    title = 'Solar project stories';
    html = window.TechouseContent.projectsPage(adminTop, adminTabs);
  } else if (path === '/office/new') {
    title = 'Create a post · Back office';
    html = editorPage();
  } else if (path.startsWith('/office/edit/')) {
    title = 'Edit a post · Back office';
    html = editorPage(decodeSegment(path.split('/')[3]));
  } else if (path === '/office/inquiries') {
    title = 'Inquiries · Back office';
    html = adminInquiries();
  } else {
    title = 'Page unavailable';
    html = notFound();
  }
  $('#main').innerHTML = html;
  window.TechouseContent?.apply(path);
  if (path === '/') window.TechouseBanner.mount(returningHome);
  window.TechouseDivisions.mount();
  window.TechouseSolar?.prefill();
  window.TechouseReadability?.mount();
  window.TechouseExperience?.mount();
  window.TechouseSolarExtras?.mount();
  window.TechouseOfficeUI?.mount();
  syncInquiryCta();
  document.title = `${title} — Techouse`;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (path.startsWith('/divisions/solar/products/')) window.TechouseCatalogue.revealBanner();
  if (path.startsWith('/divisions/solar/projects/'))
    window.TechousePortfolio.openProject(path.split('/')[4] || '');
}
function decodeSegment(value = '') {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}
function filterPosts() {
  const query = ($('#post-search')?.value || '').toLowerCase();
  const matching = [...posts]
    .filter(
      (p) =>
        (activePostFilter === 'all' || p.status === activePostFilter) &&
        `${p.title} ${p.summary} ${category(p.division)}`.toLowerCase().includes(query),
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  $('#post-rows').innerHTML = matching.length
    ? matching.map(postRow).join('')
    : '<div class="empty-state"><h3>No matching posts.</h3><p>Try another search or filter.</p></div>';
}
function openModal(html) {
  const modal = $('#modal');
  modal.innerHTML = `<button class="modal-close" type="button" aria-label="Close dialog">×</button>${html}`;
  modal.showModal();
}
function confirmDelete(type, id) {
  const data = type === 'post' ? posts : inquiries;
  const item = data.find((x) => x.id === id);
  if (!item) return;
  openModal(
    `<h2 id="modal-title">Delete ${type === 'post' ? 'this post' : 'this inquiry'}?</h2><p>${esc(type === 'post' ? item.title : item.name)} will be removed from this browser’s sample.${type === 'post' && item.status === 'published' ? ' It will also disappear from the website’s Updates section.' : ''}</p><div class="modal-actions"><button class="button outline" data-close-modal>Keep ${type}</button><button class="button" id="confirm-delete">Delete ${type}</button></div>`,
  );
  $('#confirm-delete').addEventListener(
    'click',
    async () => {
      const next = data.filter((x) => x.id !== id);
      if (!(await saveStore(type === 'post' ? postKey : inquiryKey, next))) return;
      if (type === 'post') posts = next;
      else inquiries = next;
      $('#modal').close();
      render();
      showToast(type === 'post' ? 'Post deleted.' : 'Inquiry deleted.');
    },
    { once: true },
  );
}
async function viewInquiry(id) {
  const q = inquiries.find((x) => x.id === id);
  if (!q) return;
  if (!q.reviewedAt) {
    const next = inquiries.map((item) =>
      item.id === id ? { ...item, reviewedAt: new Date().toISOString() } : item,
    );
    if (await saveStore(inquiryKey, next)) {
      inquiries = next;
      render();
    }
  }
  const fields = [
    ['Reference', q.id],
    ['Division', category(q.division)],
    ['Name', q.name],
    ['Company', q.company || 'Not provided'],
    ['Email', q.email],
    ['Mobile', q.phone || 'Not provided'],
    ['Project location', q.location],
    ['Size / capacity', q.capacity || 'Not provided'],
    ['Requirements', q.requirements],
  ];
  openModal(
    `<h2 id="modal-title">Project inquiry</h2><p>Saved in this browser · email delivery not connected.</p><dl class="inquiry-detail">${fields.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="modal-actions"><button class="button outline" data-close-modal>Close inquiry</button></div>`,
  );
}
// DELEGATED EVENTS: handlers stay attached while route-specific markup is replaced.
document.addEventListener('click', (event) => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    $('#main').focus();
    $('#main').scrollIntoView({ block: 'start' });
    return;
  }
  const menu = event.target.closest('.menu-button');
  if (menu) {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('#site-nav').classList.toggle('open', open);
    return;
  }
  const deletePost = event.target.closest('[data-delete-post]');
  if (deletePost) {
    confirmDelete('post', deletePost.dataset.deletePost);
    return;
  }
  const deleteInquiry = event.target.closest('[data-delete-inquiry]');
  if (deleteInquiry) {
    confirmDelete('inquiry', deleteInquiry.dataset.deleteInquiry);
    return;
  }
  const view = event.target.closest('[data-view-inquiry]');
  if (view) {
    viewInquiry(view.dataset.viewInquiry);
    return;
  }
  if (event.target.closest('[data-close-modal],.modal-close')) {
    $('#modal').close();
    return;
  }
  const postFilter = event.target.closest('[data-post-filter]');
  if (postFilter) {
    activePostFilter = postFilter.dataset.postFilter;
    document.querySelectorAll('[data-post-filter]').forEach((b) => {
      b.classList.toggle('active', b === postFilter);
      b.setAttribute('aria-pressed', String(b === postFilter));
    });
    filterPosts();
    return;
  }
  const updateFilter = event.target.closest('[data-update-filter]');
  if (updateFilter) {
    document.querySelectorAll('[data-update-filter]').forEach((b) => {
      b.classList.toggle('active', b === updateFilter);
      b.setAttribute('aria-pressed', String(b === updateFilter));
    });
    const list = publishedPosts().filter(
      (p) =>
        updateFilter.dataset.updateFilter === 'all' ||
        p.division === updateFilter.dataset.updateFilter,
    );
    $('#updates-grid').innerHTML =
      list.map(postCard).join('') ||
      '<div class="empty-state"><p>No updates in this division yet.</p></div>';
  }
});
let inquiryFilter = 'all';
function filterInquiries() {
  const term = ($('#inquiry-search')?.value || '').trim().toLowerCase();
  document.querySelectorAll('.inquiry-list .inquiry-card').forEach((card) => {
    card.hidden = !(
      card.dataset.inquirySearch.includes(term) &&
      (inquiryFilter === 'all' || card.dataset.reviewed === 'false')
    );
  });
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-inquiry-filter]');
  if (!button) return;
  inquiryFilter = button.dataset.inquiryFilter;
  document
    .querySelectorAll('[data-inquiry-filter]')
    .forEach((b) => b.classList.toggle('active', b === button));
  filterInquiries();
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'post-search') filterPosts();
  if (event.target.id === 'inquiry-search') filterInquiries();
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'post-cover') $('#cover-preview').src = coverURL(event.target.value);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    $('#site-nav')?.classList.remove('open');
    const b = $('.menu-button');
    if (b) {
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', 'Open menu');
    }
  }
});
// DEMO SAVES: form validation happens here, but records stay in localStorage and no email is sent.
document.addEventListener('submit', async (event) => {
  if (event.target.id === 'post-form') {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    const title = String(f.get('title') || '').trim(),
      summary = String(f.get('summary') || '').trim(),
      body = String(f.get('body') || '').trim();
    if (!title || !summary || !body) {
      showToast('Add a title, introduction, and post content.');
      return;
    }
    const id = form.dataset.id;
    const previous = posts.find((x) => x.id === id);
    const status = event.submitter?.value === 'published' ? 'published' : 'draft';
    const now = new Date().toISOString();
    const post = {
      id: previous?.id || uid('post'),
      title,
      summary,
      body,
      division: f.get('division'),
      cover: f.get('cover'),
      status,
      sample: f.get('sample') === 'true',
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    const next = previous ? posts.map((p) => (p.id === id ? post : p)) : [post, ...posts];
    if (!(await saveStore(postKey, next))) return;
    posts = next;
    location.hash = '/office/posts';
    showToast(
      status === 'published' ? 'Post published. It is now visible in Updates.' : 'Draft saved.',
    );
  }
  if (event.target.id === 'inquiry-form') {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    for (const k of Object.keys(data)) data[k] = String(data[k]).trim();
    if (!data.name || !data.location || data.requirements.length < 10) {
      showToast('Add your name, location, and at least 10 characters of project details.');
      return;
    }
    const solarSavings = data.division === 'solar' ? Number(form.dataset.solarSavings) : NaN;
    const q = {
      ...data,
      ...(Number.isFinite(solarSavings) && solarSavings > 0 ? { solarSavings } : {}),
      id: uid('DEMO').toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    const next = [...inquiries, q];
    if (!(await saveStore(inquiryKey, next))) return;
    inquiries = next;
    window.TechouseVisits?.setInquiry(q);
    const button = (
      event.submitter || form.querySelector('[type="submit"]')
    ).getBoundingClientRect();
    const origin = { x: button.left + button.width / 2, y: button.top + button.height / 2 };
    const showConfirmation = () => {
      $('#inquiry-form-area').innerHTML =
        `<div class="success" tabindex="-1"><div class="success-icon" aria-hidden="true">✓</div><h2>Your demo inquiry is saved.</h2><p>Your request details are saved on this browser only.</p><p><strong>Demo reference</strong><br><code>${esc(q.id)}</code></p><p>No email was sent. Techouse has not received this inquiry.</p><p><a class="text-link" href="#/divisions">Continue exploring ${arrow}</a></p></div>`;
      if (data.division === 'solar' && window.TechouseSolarExtras) {
        $('.success').innerHTML = window.TechouseSolarExtras.confirmationMarkup(
          q.solarSavings,
          esc(q.id),
        );
      }
      $('.success').focus({ preventScroll: true });
      $('.success').scrollIntoView({ block: 'center', behavior: 'instant' });
      window.TechouseSolarExtras?.afterInquiry(data.division, q.solarSavings, esc(q.id));
    };
    if (data.division === 'solar' && window.TechouseSolarExtras) {
      window.TechouseSolarExtras.revealConfirmation(showConfirmation, origin);
    } else showConfirmation();
  }
});
// NAVIGATION: close any dialog and rebuild the page when the URL fragment changes.
window.addEventListener('hashchange', () => {
  if ($('#modal').open) $('#modal').close();
  render();
  $('#main').focus({ preventScroll: true });
});
window.addEventListener('storage', (event) => {
  if (event.key === postKey) posts = readStore(postKey, seeds);
  if (event.key === inquiryKey) inquiries = readStore(inquiryKey, []);
  if (!$('#post-form') && !$('#inquiry-form') && !$('#website-customizer') && !$('#project-editor'))
    render();
});
if (window.TechouseContent.previewFrame) window.TechouseContent.startPreview(render);
else render();
