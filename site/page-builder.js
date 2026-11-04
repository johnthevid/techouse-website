/** Construction-only section builder. Drafts and publication use the existing protected CMS. */
window.TechousePageBuilder = (() => {
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const names = {
    hero: 'Hero banner',
    'text-image': 'Text and image',
    cta: 'Call to action',
    spacer: 'Spacing',
    projects: 'Project highlights',
    'project-tabs': 'Project tabs',
  };
  const destinations = {
    '#/inquiry?division=construction': 'Construction inquiry',
    '#/divisions': 'Our divisions',
    '#/about': 'About Techouse',
  };
  let sections,
    selected,
    dirty = false,
    busy = false,
    dragged;
  const starter = (type) => ({
    id: crypto.randomUUID(),
    type,
    hidden: false,
    tone: type === 'text-image' ? 'light' : 'green',
    layout: 'right',
    title:
      type === 'hero'
        ? 'Build your next chapter.'
        : type === 'cta'
          ? 'Have a building project in mind?'
          : 'A clearer starting point for your project.',
    body:
      type === 'hero'
        ? 'Explore construction possibilities with Techouse.'
        : type === 'cta'
          ? 'Tell us about your plans. Let’s discuss the next step.'
          : 'Share your site, priorities and the space you want to create. Our team can help you explore the possibilities.',
    image: type === 'cta' ? '' : 'assets/construction.5154dbc7c67d.jpg',
    alt: 'Construction site reference image',
    label: 'Start a conversation',
    link: '#/inquiry?division=construction',
    space: 48,
    sector: 'all',
    count: 3,
  });
  let baseHTML = '';
  const baseDocument = () => new DOMParser().parseFromString(baseHTML, 'text/html');
  function defaults() {
    const doc = baseDocument(),
      hero = starter('hero'),
      intro = starter('text-image');
    const cover = doc.querySelector('.division-cover');
    hero.title = cover?.querySelector('h1')?.textContent || 'Construction.';
    hero.body = cover?.querySelector('.cover-copy p')?.textContent || hero.body;
    hero.image = cover?.querySelector('img')?.getAttribute('src') || hero.image;
    hero.alt = cover?.querySelector('img')?.alt || hero.alt;
    hero.label =
      cover?.querySelector('.cover-copy .button')?.textContent.trim().replace(/↗$/, '').trim() ||
      'Let’s talk';
    const section = doc.querySelector('.basic-division');
    intro.title = section?.querySelector('h2')?.textContent || intro.title;
    intro.body = section?.querySelector('p')?.textContent || intro.body;
    intro.image = '';
    intro.label = 'Start a conversation';
    return [hero, intro];
  }
  function projectCards(s, sector = s.sector || 'all') {
    const projects = (window.TechouseContent.snapshot().projects || [])
      .filter((p) => p.status === 'published' && (sector === 'all' || p.sector === sector))
      .slice(0, s.count || 3);
    if (!projects.length)
      return '<p class="builder-project-empty">No published projects in this category yet. Add projects in the back-office library.</p>';
    return `<div class="builder-project-grid">${projects.map((p) => `<a class="builder-project-card" href="#/divisions/solar/projects/${encodeURIComponent(p.id)}">${p.image ? `<img src="${esc(window.TechouseContent.imageURL(p.image))}" alt="${esc(p.title)}" loading="lazy">` : ''}<div><small>${p.reference ? 'ONLINE REFERENCE · ' : p.sample ? 'ILLUSTRATIVE SAMPLE · ' : ''}${esc(p.sector || '')}</small><h3>${esc(p.title)}</h3><p>${esc(p.location || '')}${p.capacity ? ` · ${esc(p.capacity)}` : ''}</p>${p.provider ? `<p class="builder-project-credit">Reference credit: ${esc(p.provider)}</p>` : ''}<span>View project details ↗</span></div></a>`).join('')}</div>`;
  }
  function projectModule(s) {
    const groups = {
      all: 'All projects',
      residential: 'Residential',
      commercial: 'Commercial',
      industrial: 'Industrial',
    };
    return `<section class="builder-project-module builder-${s.tone}" data-project-module="${s.id}"><div class="container"><span class="eyebrow">PROJECT LIBRARY</span><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p><p class="builder-project-disclosure">Displays published entries from the existing library. Reference examples are credited demonstration content, not verified Techouse work.</p>${
      s.type === 'project-tabs'
        ? `<div class="builder-project-tabs" role="tablist" aria-label="Project categories">${Object.entries(
            groups,
          )
            .map(
              ([key, label]) =>
                `<button type="button" role="tab" id="builder-tab-${s.id}-${key}" data-project-sector="${key}" aria-selected="${key === (s.sector || 'all')}" tabindex="${key === (s.sector || 'all') ? 0 : -1}" aria-controls="builder-project-panel-${s.id}">${label}</button>`,
            )
            .join('')}</div>`
        : ''
    }<div id="builder-project-panel-${s.id}" ${s.type === 'project-tabs' ? `role="tabpanel" aria-labelledby="builder-tab-${s.id}-${s.sector || 'all'}"` : ''}>${projectCards(s)}</div></div></section>`;
  }
  function wireProjects(doc, list) {
    doc.querySelectorAll('[data-project-module]').forEach((node) => {
      const s = list.find((s) => s.id === node.dataset.projectModule);
      if (!s) return;
      node.querySelectorAll('[data-project-sector]').forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const panel = node.querySelector('[id^="builder-project-panel-"]');
          panel.innerHTML = projectCards(s, button.dataset.projectSector);
          panel.setAttribute('aria-labelledby', button.id);
          node.querySelectorAll('[data-project-sector]').forEach((tab) => {
            tab.setAttribute('aria-selected', tab === button);
            tab.tabIndex = tab === button ? 0 : -1;
          });
        });
        button.addEventListener('keydown', (e) => {
          const tabs = [...node.querySelectorAll('[data-project-sector]')],
            i = tabs.indexOf(button);
          const index =
            e.key === 'ArrowRight'
              ? (i + 1) % tabs.length
              : e.key === 'ArrowLeft'
                ? (i + tabs.length - 1) % tabs.length
                : e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? tabs.length - 1
                    : -1;
          if (index >= 0) {
            e.preventDefault();
            e.stopPropagation();
            tabs[index].click();
            tabs[index].focus();
          }
        });
      });
    });
  }
  function renderSection(s) {
    if (s.type === 'spacer')
      return `<div class="builder-spacer" style="height:${[24, 48, 96, 160].includes(s.space) ? s.space : 48}px" aria-hidden="true"></div>`;
    if (['projects', 'project-tabs'].includes(s.type)) return projectModule(s);
    if (s.type === 'hero') {
      const cover = baseDocument().querySelector('.division-cover');
      if (cover) {
        cover.querySelector('h1').textContent = s.title;
        cover.querySelector('.cover-copy p').textContent = s.body;
        const img = cover.querySelector('img');
        if (img) {
          img.src = s.image;
          img.alt = s.alt;
        }
        const link = cover.querySelector('.cover-copy .button');
        link.href = s.link;
        link.innerHTML = `${esc(s.label)} ${window.TechouseIcons.icon('arrow_outward')}`;
        link.hidden = !s.label;
        return cover.outerHTML;
      }
    }
    if (s.type === 'text-image' && !s.image) {
      const intro = baseDocument().querySelector('.basic-division');
      if (intro) {
        intro.querySelector('h2').textContent = s.title;
        intro.querySelector('p').textContent = s.body;
        const link = intro.querySelector('a');
        link.href = s.link;
        link.innerHTML = `${esc(s.label)} ${window.TechouseIcons.icon('arrow_outward')}`;
        link.hidden = !s.label;
        return `<div class="division-wrap">${intro.outerHTML}</div>`;
      }
    }
    return `<section class="builder-section builder-${s.type} builder-${s.tone} builder-image-${s.layout}">${s.image && s.type !== 'cta' ? `<img src="${esc(s.image)}" alt="${esc(s.alt)}">` : ''}<div class="builder-copy"><span class="eyebrow">${s.type === 'cta' ? 'YOUR NEXT STEP' : 'BUILD WITH POSSIBILITY'}</span><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p>${s.label ? `<a class="button" href="${esc(s.link)}">${esc(s.label)} ${window.TechouseIcons.icon('arrow_outward')}</a>` : ''}</div></section>`;
  }
  function render(list) {
    return `<article class="division-experience ${list.some((s) => s.type === 'hero' && !s.hidden) ? '' : 'builder-no-hero'}">${list
      .filter((s) => !s.hidden)
      .map(renderSection)
      .join('')}${baseDocument().querySelector('.division-next')?.outerHTML || ''}</article>`;
  }
  function published(original) {
    baseHTML = original;
    const list = window.TechouseBoot?.pages?.construction?.published;
    return list ? render(list) : '';
  }
  function editor(top, tabs, original) {
    baseHTML = original;
    return `<div class="builder-heading"><div><span class="eyebrow">WEBSITE / CONSTRUCTION</span><h1>Page builder</h1></div><a class="text-link" href="#/office">Back to overview</a></div>${tabs('builder')}<div id="page-builder"><div class="builder-toolbar"><div><strong>Construction page</strong><span id="builder-status" role="status">Draft preview · not published</span></div><div class="builder-viewport-controls" role="group" aria-label="Preview screen size"><button data-builder="desktop" aria-pressed="true">Desktop</button><button data-builder="mobile" aria-pressed="false">Mobile</button></div><div><button type="button" data-builder="fullscreen">${window.TechouseIcons.icon('arrow_outward')} Full screen</button><button type="button" data-builder="save">Save draft</button><button type="button" class="button" data-builder="publish">Publish page</button><a class="text-link" href="#/divisions/construction">View page ↗</a></div></div><div class="builder-workspace"><aside class="builder-sidebar"><span class="eyebrow">MODULE LIBRARY</span><h2>Add a module</h2><p>Drag onto the page, or click to insert.</p><div class="builder-palette">${Object.entries(
      names,
    )
      .map(
        ([type, name]) =>
          `<button type="button" class="builder-module" draggable="true" data-module="${type}"><span class="builder-module-preview module-preview-${type}" aria-hidden="true">${type === 'spacer' ? `<span class="mini-spacer">↕<b>Breathing room</b><small>24 · 48 · 96 · 160 px</small></span>` : ['projects', 'project-tabs'].includes(type) ? `<span class="mini-projects"><small>${type === 'project-tabs' ? 'ALL / RESIDENTIAL / COMMERCIAL' : 'PROJECT HIGHLIGHTS'}</small><span><i></i><i></i><i></i></span><b>Projects from your library</b></span>` : type === 'hero' ? `<img src="assets/construction.5154dbc7c67d.jpg" alt=""><span class="mini-cover"><small>TECHOUSE / CONSTRUCTION</small><b>Build your<br>next chapter.</b><em>Let’s talk ↗</em></span>` : type === 'text-image' ? `<span class="mini-copy"><small>BUILD WITH POSSIBILITY</small><b>A clearer<br>starting point.</b><i></i><i></i><em>Explore more ↗</em></span><img src="assets/construction.5154dbc7c67d.jpg" alt="">` : `<span class="mini-cta"><small>YOUR NEXT STEP</small><b>Have a project<br>in mind?</b><i></i><em>Start a conversation ↗</em></span>`}</span><strong>${name}</strong><small>${type === 'spacer' ? 'Adjustable vertical breathing room' : type === 'projects' ? 'Published project cards from the library' : type === 'project-tabs' ? 'Projects with working category filters' : type === 'hero' ? 'Full-width image, heading and button' : type === 'cta' ? 'A focused message and action button' : 'Side-by-side copy, image and link'}</small><span class="builder-module-add">${window.TechouseIcons.icon('add')} Add module</span></button>`,
      )
      .join(
        '',
      )}</div><label class="builder-quick-add">Quick add<select id="builder-add"><option value="">Choose a module…</option>${Object.entries(
      names,
    )
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join(
        '',
      )}</select></label><details class="builder-outline"><summary>Page outline <span id="builder-count"></span></summary><div id="builder-list"></div></details><p>Up to 10 sections · one hero banner.</p></aside><section class="builder-preview-panel" aria-label="Editable page canvas"><div class="builder-preview-tools" id="builder-selection-tools" aria-label="Selected section editor controls"></div><div class="builder-canvas-scroll"><div id="builder-preview"></div></div></section><aside class="builder-settings"><span class="eyebrow">SECTION SETTINGS</span><div id="builder-fields"></div></aside></div><dialog id="builder-fullscreen" aria-label="Construction page full-screen preview"><div class="builder-fullscreen-bar"><strong>Construction · draft preview</strong><button data-builder="close-preview" autofocus>Close preview ${window.TechouseIcons.icon('close')}</button></div><div class="builder-fullscreen-content"></div></dialog><div id="builder-context" class="builder-context" role="menu" aria-label="Module actions" hidden></div></div>`;
  }
  function mount() {
    const root = document.querySelector('#page-builder');
    if (!root) {
      wireProjects(document, window.TechouseBoot?.pages?.construction?.published || []);
      return;
    }
    sections = structuredClone(
      window.TechouseBoot?.pages?.construction?.draft ||
        window.TechouseBoot?.pages?.construction?.published ||
        defaults(),
    );
    selected = sections[0]?.id;
    dirty = false;
    busy = false;
    const status = (msg) => (root.querySelector('#builder-status').textContent = msg);
    const canvas = root.querySelector('#builder-preview');
    let frame,
      fullFrame,
      mode = 'desktop';
    let contextIndex;
    const contextMenu = root.querySelector('#builder-context');
    function closeContext() {
      contextMenu.hidden = true;
      contextIndex = undefined;
    }
    const canvasHandlers = [];
    const canvasDoc = () => frame?.contentDocument;
    function onCanvas(type, listener) {
      root.addEventListener(type, listener);
      canvasHandlers.push([type, listener]);
    }
    function fit() {
      if (!frame) return;
      const host = root.querySelector('.builder-canvas-scroll');
      const width = mode === 'mobile' ? 390 : 1440;
      const scale = Math.min(1, host.clientWidth / width);
      canvas.style.width = `${width * scale}px`;
      frame.style.width = `${width}px`;
      frame.style.height = `${Math.max(300, host.clientHeight / scale)}px`;
      frame.style.transform = `scale(${scale})`;
      canvas.style.height = `${host.clientHeight}px`;
    }
    function canvasHTML() {
      return `<article class="division-experience ${sections.some((s) => s.type === 'hero' && !s.hidden) ? '' : 'builder-no-hero'}">${sections.map((s, i) => `<button class="builder-dropzone" data-drop-index="${i}" aria-label="Insert module before section ${i + 1}"><span>Drop module here</span></button><div class="builder-canvas-section ${s.id === selected ? 'is-selected' : ''}" data-canvas-id="${s.id}" tabindex="0" aria-label="${esc(names[s.type])}: ${esc(s.title)}">${s.hidden ? `<div class="builder-hidden-placeholder">${esc(s.title)} · Hidden section</div>` : renderSection(s)}</div>`).join('')}<button class="builder-dropzone builder-drop-last" data-drop-index="${sections.length}" aria-label="Add module at end"><span>+ Drop a module here to extend your page</span></button>${baseDocument().querySelector('.division-next')?.outerHTML || ''}</article>`;
    }
    function paintFrame(target, editable) {
      const doc = target.contentDocument;
      if (!doc?.querySelector('#main')) return;
      const scroll = target.contentWindow.scrollY;
      doc.querySelector('#main').innerHTML = editable ? canvasHTML() : render(sections);
      wireProjects(doc, sections);
      target.contentWindow.scrollTo(0, scroll);
    }
    function createFrame(editable) {
      const iframe = document.createElement('iframe');
      iframe.title = editable
        ? 'Construction page live editing canvas'
        : 'Construction page full-screen preview';
      iframe.src = '/#/divisions/construction?builder-canvas=1';
      iframe.style.visibility = 'hidden';
      iframe.addEventListener('load', () => {
        const doc = iframe.contentDocument;
        doc.documentElement.classList.add(
          editable ? 'builder-canvas-document' : 'builder-preview-document',
        );
        doc.addEventListener(
          'click',
          (e) => {
            if (e.target.closest('a')) e.preventDefault();
          },
          true,
        );
        if (editable)
          for (const [type, listener] of canvasHandlers) doc.addEventListener(type, listener);
        paintFrame(iframe, editable);
        iframe.style.visibility = 'visible';
        if (editable) fit();
      });
      return iframe;
    }
    function preview() {
      if (!frame) {
        frame = createFrame(true);
        canvas.replaceChildren(frame);
        const observer = new ResizeObserver(fit);
        observer.observe(root.querySelector('.builder-canvas-scroll'));
        const cleanup = new MutationObserver(() => {
          if (!root.isConnected) {
            observer.disconnect();
            cleanup.disconnect();
          }
        });
        cleanup.observe(document.querySelector('#main'), { childList: true });
      } else paintFrame(frame, true);
    }
    function refresh() {
      root.querySelector('#builder-list').innerHTML = sections
        .map(
          (s, i) =>
            `<div class="builder-item ${selected === s.id ? 'selected' : ''}" draggable="true" data-section="${s.id}"><button data-select="${s.id}" aria-pressed="${selected === s.id}"><small>${String(i + 1).padStart(2, '0')} / ${names[s.type]}${s.hidden ? ' · Hidden' : ''}</small><strong>${esc(s.title || 'Untitled section')}</strong></button><div><button data-move="-1" data-id="${s.id}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${names[s.type]} up">${window.TechouseIcons.icon('arrow_upward')}</button><button data-move="1" data-id="${s.id}" ${i === sections.length - 1 ? 'disabled' : ''} aria-label="Move ${names[s.type]} down">${window.TechouseIcons.icon('arrow_downward')}</button></div></div>`,
        )
        .join('');
      root.querySelector('#builder-count').textContent = `(${sections.length})`;
      const s = sections.find((s) => s.id === selected);
      root.querySelector('#builder-fields').innerHTML = s
        ? `<h2>${names[s.type]}</h2>${[
            ['title', 'Heading'],
            ['body', 'Description'],
            ['label', 'Button label'],
            ['alt', 'Image description'],
          ]
            .filter(([key]) => s.type !== 'cta' || key !== 'alt')
            .map(
              ([key, label]) =>
                `<label>${label}${key === 'body' ? `<textarea data-field="${key}" rows="3" maxlength="2400">${esc(s[key])}</textarea>` : `<input data-field="${key}" maxlength="${key === 'title' ? 160 : key === 'label' ? 80 : 250}" value="${esc(s[key])}">`}</label>`,
            )
            .join('')}<label>Button destination<select data-field="link">${Object.entries(
            destinations,
          )
            .map(([k, v]) => `<option value="${k}" ${s.link === k ? 'selected' : ''}>${v}</option>`)
            .join(
              '',
            )}</select></label><label>Background<select data-field="tone"><option value="light" ${s.tone === 'light' ? 'selected' : ''}>Warm white</option><option value="green" ${s.tone === 'green' ? 'selected' : ''}>Techouse green</option></select></label>${s.type !== 'cta' ? `<label>Image position<select data-field="layout"><option value="right" ${s.layout === 'right' ? 'selected' : ''}>Right</option><option value="left" ${s.layout === 'left' ? 'selected' : ''}>Left</option></select></label><label>Replace image<input type="file" id="builder-image" accept="image/jpeg,image/png,image/webp"></label><p>JPEG, PNG or WebP, up to 1 MB. Reference imagery must be replaced with approved company photos.</p>` : ''}<label class="builder-check"><input type="checkbox" data-field="hidden" ${s.hidden ? 'checked' : ''}> Hide this section</label><button data-builder="remove">Remove section</button>`
        : '<p>Add a section to begin.</p>';
      if (s && (s.type === 'hero' || (s.type === 'text-image' && !s.image))) {
        for (const key of ['tone', 'layout'])
          root.querySelector(`[data-field="${key}"]`)?.closest('label').setAttribute('hidden', '');
        root
          .querySelector('#builder-fields h2')
          .insertAdjacentHTML(
            'afterend',
            '<p class="builder-layout-note">Original page layout · edits preview live.</p>',
          );
      }
      if (s && ['spacer', 'projects', 'project-tabs'].includes(s.type)) {
        const project = s.type !== 'spacer';
        root.querySelector('#builder-fields').innerHTML =
          `<h2>${names[s.type]}</h2>${project ? `<label>Heading<input data-field="title" maxlength="160" value="${esc(s.title)}"></label><label>Description<textarea data-field="body" maxlength="2400" rows="3">${esc(s.body)}</textarea></label><label>${s.type === 'project-tabs' ? 'Starting category' : 'Category'}<select data-field="sector">${['all', 'residential', 'commercial', 'industrial'].map((key) => `<option value="${key}" ${key === (s.sector || 'all') ? 'selected' : ''}>${key === 'all' ? 'All projects' : key[0].toUpperCase() + key.slice(1)}</option>`).join('')}</select></label><label>Project cards<select data-field="count">${[3, 6].map((n) => `<option ${n === (s.count || 3) ? 'selected' : ''}>${n}</option>`).join('')}</select></label><p>Uses published library entries. Manage titles, photos and publication in the Projects tab.</p>` : `<label>Vertical space<select data-field="space">${[24, 48, 96, 160].map((n) => `<option value="${n}" ${n === (s.space || 48) ? 'selected' : ''}>${n}px · ${n === 24 ? 'Small' : n === 48 ? 'Medium' : n === 96 ? 'Large' : 'Extra large'}</option>`).join('')}</select></label><p>Spacing is blank on the published website. Its outline is visible only while editing.</p>`}<label class="builder-check"><input type="checkbox" data-field="hidden" ${s.hidden ? 'checked' : ''}> Hide this section</label><button data-builder="remove">Remove section</button>`;
      }
      const tools = root.querySelector('#builder-selection-tools');
      const index = sections.findIndex((section) => section.id === selected);
      tools.innerHTML = s
        ? `<div class="builder-selected-label"><span class="builder-editor-badge">EDITING</span><strong>${names[s.type]}</strong><span id="builder-hover-label" aria-live="polite"></span></div><div class="builder-section-actions"><button type="button" draggable="true" data-drag-section="${s.id}" aria-label="Drag ${names[s.type]} to reorder">Drag</button><button type="button" data-move="-1" data-id="${s.id}" ${index === 0 ? 'disabled' : ''} aria-label="Move selected section up">${window.TechouseIcons.icon('arrow_upward')}</button><button type="button" data-move="1" data-id="${s.id}" ${index === sections.length - 1 ? 'disabled' : ''} aria-label="Move selected section down">${window.TechouseIcons.icon('arrow_downward')}</button><button type="button" data-builder="more" aria-label="More section actions" aria-haspopup="menu">Actions</button><button type="button" data-builder="remove" aria-label="Remove selected section">${window.TechouseIcons.icon('close')}</button></div>`
        : '<span>No section selected · add a module or right-click the canvas.</span><span id="builder-hover-label"></span>';
      preview();
    }
    const changed = () => {
      dirty = true;
      status('Unsaved changes');
    };
    root.addEventListener('input', (e) => {
      const key = e.target.dataset.field;
      if (!key) return;
      const s = sections.find((s) => s.id === selected);
      s[key] =
        key === 'hidden'
          ? e.target.checked
          : ['space', 'count'].includes(key)
            ? Number(e.target.value)
            : e.target.value;
      changed();
      preview();
      if (key === 'title')
        root.querySelector(`[data-select="${s.id}"] strong`).textContent =
          s.title || 'Untitled section';
    });
    root.addEventListener('change', async (e) => {
      if (e.target.id === 'builder-add' && e.target.value) {
        const type = e.target.value;
        e.target.value = '';
        addModule(type);
      }
      if (e.target.id === 'builder-image' && e.target.files[0]) {
        const file = e.target.files[0],
          id = selected;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1000000) {
          status('Choose a JPEG, PNG or WebP under 1 MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const s = sections.find((s) => s.id === id);
          if (root.isConnected && s) {
            s.image = reader.result;
            changed();
            refresh();
          }
        };
        reader.readAsDataURL(file);
      }
    });
    function addModule(type, index = sections.findIndex((s) => s.id === selected) + 1) {
      if (!names[type]) return;
      if (sections.length >= 10 || (type === 'hero' && sections.some((s) => s.type === 'hero'))) {
        status('Use up to 10 sections and one hero banner.');
        return;
      }
      const section = starter(type);
      if (['projects', 'project-tabs'].includes(type)) {
        section.title = 'Explore project examples.';
        section.body = 'Browse published projects from our library.';
        section.image = '';
        section.label = '';
        section.tone = 'light';
      }
      if (type === 'spacer') {
        section.title = 'Spacing';
        section.body = '';
        section.image = '';
        section.label = '';
      }
      sections.splice(index, 0, section);
      selected = section.id;
      changed();
      refresh();
      canvasDoc()
        ?.querySelector(`[data-canvas-id="${section.id}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    function clearDrop() {
      root.classList.remove('is-dragging');
      canvasDoc()?.documentElement.classList.remove('is-dragging');
      canvasDoc()
        ?.querySelectorAll('.drop-active')
        .forEach((el) => el.classList.remove('drop-active'));
    }
    function showContext(x, y, index) {
      contextIndex = index;
      const s = sections.find((s) => s.id === selected),
        position = sections.findIndex((s) => s.id === selected);
      contextMenu.innerHTML = `<div class="builder-context-title">${s ? names[s.type] : 'Insert a module'}</div>${s ? `<button role="menuitem" data-move="-1" data-id="${s.id}" ${position === 0 ? 'disabled' : ''}>Move up</button><button role="menuitem" data-move="1" data-id="${s.id}" ${position === sections.length - 1 ? 'disabled' : ''}>Move down</button><button role="menuitem" data-builder="duplicate" ${s.type === 'hero' || sections.length >= 10 ? 'disabled' : ''}>Duplicate</button><button role="menuitem" data-builder="toggle-hidden">${s.hidden ? 'Show on website' : 'Hide on website'}</button><button role="menuitem" data-builder="remove" class="builder-context-danger">Remove section</button>` : ''}<div class="builder-context-title">Insert ${s ? 'after this section' : 'here'}</div>${Object.entries(
        names,
      )
        .map(
          ([type, label]) =>
            `<button role="menuitem" data-module="${type}" ${sections.length >= 10 || (type === 'hero' && sections.some((s) => s.type === 'hero')) ? 'disabled' : ''}>${label}</button>`,
        )
        .join('')}`;
      contextMenu.hidden = false;
      const box = contextMenu.getBoundingClientRect();
      contextMenu.style.left = `${Math.max(8, Math.min(x, innerWidth - box.width - 8))}px`;
      contextMenu.style.top = `${Math.max(8, Math.min(y, innerHeight - box.height - 8))}px`;
      contextMenu.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
    }
    onCanvas('contextmenu', (e) => {
      if (busy || e.target.ownerDocument !== canvasDoc()) return;
      const element = e.target.closest('[data-canvas-id]'),
        gap = e.target.closest('[data-drop-index]');
      if (!element && !gap && !e.target.closest('#main')) return;
      e.preventDefault();
      const bounds = frame.getBoundingClientRect(),
        scale = bounds.width / frame.clientWidth;
      const x = bounds.left + e.clientX * scale,
        y = bounds.top + e.clientY * scale;
      selected = element?.dataset.canvasId;
      const index = gap
        ? Number(gap.dataset.dropIndex)
        : element
          ? sections.findIndex((s) => s.id === selected) + 1
          : sections.length;
      refresh();
      showContext(x, y, index);
    });
    onCanvas('pointerover', (e) => {
      const s = sections.find(
        (s) => s.id === e.target.closest('[data-canvas-id]')?.dataset.canvasId,
      );
      const label = root.querySelector('#builder-hover-label');
      if (label) label.textContent = s ? `Hover: ${names[s.type]}` : '';
    });
    onCanvas('pointerdown', (e) => {
      if (!e.target.closest('#builder-context') && !e.target.closest('[data-builder="more"]'))
        closeContext();
    });
    onCanvas('dragstart', (e) => {
      closeContext();
      const module = e.target.closest('[data-module]');
      const handle = e.target.closest('[data-drag-section]');
      const outline = e.target.closest('[data-section]');
      dragged = module
        ? { type: module.dataset.module }
        : { id: handle?.dataset.dragSection || outline?.dataset.section };
      if (busy || (!dragged.type && !dragged.id)) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('text/plain', JSON.stringify(dragged));
      e.dataTransfer.effectAllowed = dragged.type ? 'copy' : 'move';
      root.classList.add('is-dragging');
      canvasDoc()?.documentElement.classList.add('is-dragging');
    });
    onCanvas('dragover', (e) => {
      const zone = e.target.closest('[data-drop-index]');
      const section = e.target.closest('[data-canvas-id]');
      if (busy || !dragged || (!zone && !section)) return;
      e.preventDefault();
      canvasDoc()
        ?.querySelectorAll('.drop-active')
        .forEach((el) => el.classList.remove('drop-active'));
      const index = zone
        ? Number(zone.dataset.dropIndex)
        : sections.findIndex((s) => s.id === section.dataset.canvasId) +
          (e.clientY > section.getBoundingClientRect().top + section.offsetHeight / 2 ? 1 : 0);
      canvasDoc()?.querySelector(`[data-drop-index="${index}"]`)?.classList.add('drop-active');
      root.dataset.dropIndex = index;
      e.dataTransfer.dropEffect = dragged.type ? 'copy' : 'move';
    });
    onCanvas('drop', (e) => {
      if (e.target.ownerDocument !== canvasDoc() || !dragged || busy) return;
      e.preventDefault();
      const index = Number(
        e.target.closest('[data-drop-index]')?.dataset.dropIndex ?? root.dataset.dropIndex,
      );
      const item = dragged;
      dragged = null;
      clearDrop();
      if (!Number.isInteger(index) || index < 0 || index > sections.length) return;
      if (item.type) {
        addModule(item.type, index);
        return;
      }
      const from = sections.findIndex((s) => s.id === item.id);
      if (from < 0) return;
      const [section] = sections.splice(from, 1);
      sections.splice(index > from ? index - 1 : index, 0, section);
      selected = section.id;
      changed();
      refresh();
    });
    onCanvas('dragend', () => {
      dragged = null;
      clearDrop();
    });
    onCanvas('keydown', (e) => {
      if (!contextMenu.hidden && e.key === 'Escape') {
        e.preventDefault();
        closeContext();
        root.querySelector('[data-builder="more"]')?.focus();
        return;
      }
      if (!contextMenu.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const buttons = [...contextMenu.querySelectorAll('button:not(:disabled)')],
          i = buttons.indexOf(document.activeElement);
        const index =
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? buttons.length - 1
              : (i + (e.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length;
        buttons[index]?.focus();
        return;
      }
      const section = e.target.closest('[data-canvas-id]');
      if (section && e.target === section && ['Enter', ' '].includes(e.key)) {
        e.preventDefault();
        selected = section.dataset.canvasId;
        refresh();
        canvasDoc()
          ?.querySelector(`[data-canvas-id="${selected}"]`)
          ?.focus({ preventScroll: true });
      }
    });
    onCanvas('click', async (e) => {
      const button = e.target.closest('button');
      if (busy) return;
      const insertIndex = contextIndex;
      if (button?.closest('#builder-context')) closeContext();
      if (button?.dataset.module) {
        addModule(button.dataset.module, insertIndex);
        return;
      }
      const canvasSection = e.target.closest('[data-canvas-id]');
      if (canvasSection && !e.target.closest('[data-drag-section]')) {
        e.preventDefault();
        selected = canvasSection.dataset.canvasId;
        refresh();
        return;
      }
      if (!button) return;
      if (button.dataset.select) {
        selected = button.dataset.select;
        refresh();
        return;
      }
      if (button.dataset.move) {
        const i = sections.findIndex((s) => s.id === button.dataset.id),
          j = i + Number(button.dataset.move);
        if (j >= 0 && j < sections.length) {
          [sections[i], sections[j]] = [sections[j], sections[i]];
          changed();
          refresh();
        }
        return;
      }
      const action = button.dataset.builder;
      const dialog = root.querySelector('#builder-fullscreen');
      if (action === 'fullscreen') {
        fullFrame = createFrame(false);
        dialog.querySelector('.builder-fullscreen-content').replaceChildren(fullFrame);
        dialog.showModal();
        return;
      }
      if (action === 'close-preview') {
        dialog.close();
        return;
      }
      if (['mobile', 'desktop'].includes(action)) {
        mode = action;
        root.querySelector('#builder-preview').classList.toggle('mobile', action === 'mobile');
        fit();
        root
          .querySelectorAll('[data-builder="mobile"],[data-builder="desktop"]')
          .forEach((b) => b.setAttribute('aria-pressed', b.dataset.builder === action));
        return;
      }
      if (action === 'more') {
        const box = button.getBoundingClientRect();
        showContext(box.left, box.bottom + 4, sections.findIndex((s) => s.id === selected) + 1);
        return;
      }
      if (action === 'duplicate') {
        const s = sections.find((s) => s.id === selected);
        if (!s || s.type === 'hero' || sections.length >= 10) return;
        const copy = { ...structuredClone(s), id: crypto.randomUUID() };
        sections.splice(sections.findIndex((s) => s.id === selected) + 1, 0, copy);
        selected = copy.id;
        changed();
        refresh();
        return;
      }
      if (action === 'toggle-hidden') {
        const s = sections.find((s) => s.id === selected);
        if (s) {
          s.hidden = !s.hidden;
          changed();
          refresh();
        }
        return;
      }
      if (action === 'remove') {
        const index = sections.findIndex((s) => s.id === selected);
        sections = sections.filter((s) => s.id !== selected);
        selected = sections[Math.min(index, sections.length - 1)]?.id;
        changed();
        refresh();
        return;
      }
      if (!['save', 'publish'].includes(action)) return;
      if (!window.TechousePlatform) {
        status('Sign in through /admin to save this page securely.');
        return;
      }
      if (action === 'publish' && !sections.some((s) => !s.hidden)) {
        status('Keep at least one visible section.');
        return;
      }
      if (
        action === 'publish' &&
        !confirm(
          'Publish this Construction page? It will replace the current Construction layout on this local website.',
        )
      )
        return;
      busy = true;
      root.querySelectorAll('button,input,textarea,select').forEach((el) => (el.disabled = true));
      try {
        const next = window.TechouseContent.snapshot();
        next.pages = structuredClone(window.TechouseBoot.pages || {});
        next.pages.construction ||= {};
        next.pages.construction.draft = structuredClone(sections);
        if (action === 'publish') next.pages.construction.published = structuredClone(sections);
        await window.TechousePlatform.saveContent(next);
        dirty = false;
        status(
          action === 'publish'
            ? 'Published · Construction page updated'
            : 'Draft saved · public page unchanged',
        );
      } catch (error) {
        status(error.message);
      } finally {
        busy = false;
        root
          .querySelectorAll('button,input,textarea,select')
          .forEach((el) => (el.disabled = false));
        refresh();
      }
    });
    refresh();
  }
  window.addEventListener('beforeunload', (e) => {
    if (dirty && document.querySelector('#page-builder')) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  // Preserve unsaved drafts when navigating within the back office.
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href]');
      if (
        dirty &&
        document.querySelector('#page-builder') &&
        a &&
        !a.closest('#builder-preview, #builder-fullscreen') &&
        !confirm('Leave without saving your page changes?')
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  return { editor, mount, published };
})();
