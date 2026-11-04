/** Back-office presentation, draft review and isolated previews using the real website renderer. */
window.TechouseOfficeUI = (() => {
  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  let form,
    baseline,
    dirty = false,
    changes = [],
    iframe,
    previewTimer,
    resize,
    controller,
    allowedURL = location.href,
    pendingURL;
  let projectSector = 'all',
    projectPage = 0,
    projectQuery = '',
    projectStatus = 'all',
    selectedDivision = 'solar',
    frameHeight = 900,
    fitPreview = () => {};
  let previewRevision = 0,
    lastPreview = '';
  const ids = ['solar', 'construction', 'prefabrication', 'development', 'elevators'];
  function draft() {
    const value = window.TechouseContent.customizationSnapshot();
    for (const input of form.querySelectorAll('textarea[name]')) {
      const text = input.value.trim();
      value.text[input.name] = text || input.dataset.default || '';
    }
    for (const id of ids) {
      const input = form.querySelector(`[data-banner-upload="${id}"]`);
      value.images[id] = input.closest('.content-field').querySelector('img').getAttribute('src');
    }
    return { text: value.text, images: value.images };
  }
  function fingerprint() {
    return {
      text: [...form.querySelectorAll('textarea[name]')].map((input) => ({
        name: input.name,
        value: input.value.trim(),
        label: input.labels?.[0]?.textContent || input.name,
        group: input.closest('[data-customizer-group]').dataset.customizerGroup,
      })),
      images: ids.map((id) => ({
        id,
        src: form
          .querySelector(`[data-banner-upload="${id}"]`)
          .closest('.content-field')
          .querySelector('img')
          .getAttribute('src'),
      })),
    };
  }
  function sendPreview(animate = false) {
    if (!iframe?.contentWindow || !form?.isConnected) return;
    const payload = {
      type: 'techouse-draft-preview',
      draft: draft(),
      animate,
      view: form.querySelector('.customizer-panel:not([hidden])').dataset.customizerGroup,
      division: selectedDivision,
    };
    const fingerprint = JSON.stringify({ ...payload, animate: false });
    if (!animate && fingerprint === lastPreview) return;
    lastPreview = fingerprint;
    iframe.contentWindow.postMessage(
      { ...payload, revision: ++previewRevision },
      location.origin === 'null' ? '*' : location.origin,
    );
  }
  function refresh() {
    if (!form?.isConnected || !baseline) return;
    const current = fingerprint();
    changes = [];
    current.text.forEach((field, i) => {
      const changed = field.value !== baseline.text[i].value;
      form.elements
        .namedItem(field.name)
        .closest('.content-field')
        .classList.toggle('field-changed', changed);
      if (changed) changes.push({ ...field, before: baseline.text[i].value, after: field.value });
    });
    current.images.forEach((image, i) => {
      const changed = image.src !== baseline.images[i].src;
      form
        .querySelector(`[data-banner-upload="${image.id}"]`)
        .closest('.content-field')
        .classList.toggle('field-changed', changed);
      if (changed)
        changes.push({
          name: image.id,
          label: image.id + ' banner image',
          group: 'banners',
          image: true,
          before: 'Saved image',
          after: 'New image or restored original',
        });
    });
    dirty = changes.length > 0;
    form.querySelector('#customizer-save-state').textContent = dirty
      ? `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}`
      : 'All changes saved';
    const notice = form.querySelector('.draft-notice');
    notice.hidden = !dirty;
    notice.querySelector('strong').textContent =
      `${changes.length} ${changes.length === 1 ? 'change has' : 'changes have'} not been saved yet.`;
    form.querySelectorAll('[data-customizer-section]').forEach((button) => {
      const count = changes.filter(
        (change) => change.group === button.dataset.customizerSection,
      ).length;
      button.querySelector('.change-count')?.remove();
      if (count)
        button.insertAdjacentHTML('beforeend', `<small class="change-count">${count}</small>`);
    });
    const group = form.querySelector('.customizer-panel:not([hidden])').dataset.customizerGroup;
    form.querySelector('.banner-preview-panel').hidden = false;
    form.querySelector('.customizer-panels').classList.add('with-banner-preview');
    form.querySelector('.customizer-live-preview').hidden = true;
    const about = group === 'about',
      company = group === 'landing-about';
    frameHeight = about ? 1500 : company ? 1000 : 900;
    iframe.style.height = frameHeight + 'px';
    form.querySelector('.preview-panel-heading h3').textContent = about
      ? 'Detailed About — live view'
      : company
        ? 'Landing About — live view'
        : group === 'banners'
          ? `${selectedDivision.charAt(0).toUpperCase() + selectedDivision.slice(1)} division — live view`
          : 'Your banners, as visitors see them';
    const replay = form.querySelector('[data-replay-preview]');
    replay.hidden = about || group === 'banners';
    replay.textContent = company ? 'Replay About entrance' : 'Replay intro animation';
    fitPreview();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => sendPreview(false), 220);
  }
  function markSaved() {
    if (!form?.isConnected) return;
    baseline = fingerprint();
    refresh();
  }
  function dialog() {
    let modal = document.querySelector('#draft-review-dialog');
    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'draft-review-dialog';
      modal.className = 'office-dialog';
      document.body.append(modal);
    }
    return modal;
  }
  function review(leaving = false) {
    refresh();
    if (!dirty) return;
    const modal = dialog();
    modal.innerHTML = `<div class="office-dialog-heading"><div><span class="eyebrow">UNSAVED CHANGES</span><h2>${leaving ? 'Save your changes before leaving?' : 'Review your draft changes'}</h2></div><button type="button" data-close-review aria-label="Close changes review">${window.TechouseIcons.icon('close')}</button></div><p>Your website still shows the saved version. Select a change to find it in the editor.</p><div class="draft-change-list">${changes.map((change, i) => `<button type="button" data-find-change="${i}"><strong>${esc(change.label)}</strong><span><small>Saved</small>${esc(change.before.slice(0, 180) || '(default / empty)')}</span><span><small>Draft</small>${esc(change.after.slice(0, 180) || '(default / empty)')}</span><em>Show in editor ↗</em></button>`).join('')}</div><div class="office-dialog-actions"><button type="button" class="button outline" data-close-review>Keep editing</button>${leaving ? '<button type="button" class="button outline" data-discard-leave>Discard & leave</button><button type="button" class="button" data-save-leave>Save & leave</button>' : '<button type="button" class="button outline" data-cancel-editing>Cancel editing</button><button type="button" class="button" data-save-review>Save changes</button>'}</div>`;
    modal.onclick = async (event) => {
      const find = event.target.closest('[data-find-change]');
      if (find) {
        const change = changes[Number(find.dataset.findChange)];
        modal.close();
        form.querySelector(`[data-customizer-section="${change.group}"]`).click();
        const division = change.image
          ? change.name
          : change.name.match(/data-banner="([^"]+)/)?.[1];
        if (division) form.querySelector(`[data-image-select="${division}"]`)?.click();
        const target = change.image
          ? form.querySelector(`[data-banner-upload="${change.name}"]`)
          : form.elements.namedItem(change.name);
        target.closest('.content-field').scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'center',
        });
        target.focus({ preventScroll: true });
        return;
      }
      if (event.target.closest('[data-close-review]')) modal.close();
      if (event.target.closest('[data-cancel-editing]')) {
        modal.close();
        dirty = false;
        render();
      }
      if (event.target.closest('[data-save-review],[data-save-leave]')) {
        const button = event.target.closest('[data-save-review],[data-save-leave]');
        if (button.disabled || !form.reportValidity()) return;
        const leaving = button.hasAttribute('data-save-leave');
        const editor = form;
        const saved = new Promise((resolve) => {
          editor.addEventListener(
            'techouse:customizer-saved',
            (event) => {
              resolve(event.detail.saved);
            },
            { once: true },
          );
        });
        button.disabled = true;
        editor.requestSubmit(editor.querySelector('button[type="submit"]'));
        const succeeded = await saved;
        button.disabled = false;
        if (succeeded && editor.isConnected && modal.open) {
          modal.close();
          if (leaving) leave();
        }
      }
      if (event.target.closest('[data-discard-leave]')) {
        modal.close();
        dirty = false;
        leave();
      }
    };
    if (!modal.open) modal.showModal();
  }
  function leave() {
    const url = pendingURL;
    pendingURL = null;
    dirty = false;
    if (url) location.href = url;
  }
  function mountCustomizer() {
    form = document.querySelector('#website-customizer');
    baseline = fingerprint();
    const notice = document.createElement('aside');
    notice.className = 'draft-notice';
    notice.hidden = true;
    notice.innerHTML =
      '<div><strong></strong><p>Review the highlighted differences, save them, or cancel editing.</p></div><button type="button" class="button outline" data-review-draft>Review changes</button><button type="button" class="text-link" data-cancel-draft>Cancel editing</button>';
    form.prepend(notice);
    const panel = document.createElement('aside');
    panel.className = 'banner-preview-panel';
    panel.innerHTML =
      '<div class="preview-panel-heading"><div><span>LIVE WEBSITE PREVIEW</span><h3>Your banners, as visitors see them</h3></div><span class="preview-draft-label">Draft preview</span></div><div class="preview-toolbar"><button type="button" class="button small" data-replay-preview>Replay intro animation</button><button type="button" class="button outline small" data-final-preview>Show final view</button><button type="button" class="text-link" data-expand-preview>Full screen ↗</button></div><div class="banner-preview-viewport"><iframe title="Draft website preview" width="1440" height="900" tabindex="-1"></iframe></div><p class="preview-help">Uses your unsaved copy and images with the actual website layout. Previewing does not save changes.</p>';
    form.querySelector('.customizer-live-preview').before(panel);
    iframe = panel.querySelector('iframe');
    const url = new URL(location.href);
    url.searchParams.set('office-preview', '1');
    url.hash = '/';
    iframe.addEventListener(
      'load',
      () => {
        lastPreview = '';
        sendPreview(false);
      },
      { signal: controller.signal },
    );
    iframe.src = url.href;
    const viewport = panel.querySelector('.banner-preview-viewport');
    function fit() {
      const expanded = viewport.closest('dialog');
      const availableHeight = expanded
        ? Math.max(
            120,
            innerHeight * 0.94 -
              expanded.querySelector('.preview-fullscreen-heading').offsetHeight -
              4,
          )
        : Infinity;
      const width = Math.min(viewport.clientWidth, (availableHeight * 1440) / frameHeight);
      if (width) {
        iframe.style.transform = `scale(${width / 1440})`;
        iframe.style.left = expanded ? `calc(50% - ${width / 2}px)` : '0';
        viewport.style.height = (width * frameHeight) / 1440 + 'px';
      }
    }
    fitPreview = fit;
    resize = new ResizeObserver(fit);
    resize.observe(viewport);
    window.addEventListener('resize', fit, { signal: controller.signal });
    fit();
    const imageGrid = form.querySelector('#customizer-images .image-editor-grid');
    const bannerPanel = form.querySelector('#customizer-banners');
    bannerPanel.querySelector('.customizer-section-heading p').textContent =
      'Choose a division to edit its image, headline and supporting copy together.';
    const nav = document.createElement('div');
    nav.className = 'banner-image-selector division-edit-tabs';
    nav.setAttribute('aria-label', 'Division to customize');
    nav.innerHTML = ids
      .map(
        (id) =>
          `<button type="button" data-image-select="${id}" aria-pressed="${id === selectedDivision}">${id.charAt(0).toUpperCase() + id.slice(1)}</button>`,
      )
      .join('');
    bannerPanel.querySelector('.customizer-section-heading').after(nav);
    for (const id of ids) {
      const editor = document.createElement('section');
      editor.className = 'division-editor-group';
      editor.dataset.divisionEditor = id;
      editor.hidden = id !== selectedDivision;
      editor.innerHTML = `<h3>${id.charAt(0).toUpperCase() + id.slice(1)} division</h3><p class="division-editor-hint">The selected division is highlighted in the live preview.</p>`;
      const imageField = imageGrid
        .querySelector(`[data-banner-upload="${id}"]`)
        .closest('.content-field');
      imageField.hidden = false;
      imageField.classList.add('banner-image-edit-card');
      editor.append(imageField);
      for (const input of [...bannerPanel.querySelectorAll('textarea')])
        if (input.name.startsWith(`[data-banner="${id}"]`))
          editor.append(input.closest('.content-field'));
      bannerPanel.append(editor);
    }
    for (const [name, label] of [
      ['.page-hero h1', 'Page introduction'],
      ['.content-columns h2', 'Company story'],
      ['.scope-panel .scope-label', 'Supporting information'],
    ]) {
      const input = form.elements.namedItem(name);
      if (input)
        input
          .closest('.content-field')
          .insertAdjacentHTML('beforebegin', `<h3 class="about-editor-section">${label}</h3>`);
    }
    form.querySelector('[data-customizer-section="images"]').remove();
    form.querySelector('#customizer-images').remove();
    // Short fields are easier to scan as headings; paragraphs get room to breathe.
    for (const input of form.querySelectorAll(
      '#customizer-about textarea,#customizer-landing-about textarea',
    )) {
      const label = input.labels?.[0]?.textContent || '';
      input.rows = /paragraph|introduction/i.test(label) ? 5 : 2;
      input
        .closest('.content-field')
        .classList.add(
          /paragraph|introduction/i.test(label) ? 'about-body-field' : 'about-title-field',
        );
    }
    form.addEventListener(
      'click',
      (event) => {
        if (event.target.closest('[data-review-draft]')) review();
        if (event.target.closest('[data-cancel-draft]')) {
          dirty = false;
          render();
        }
        if (event.target.closest('[data-replay-preview]')) {
          clearTimeout(previewTimer);
          sendPreview(true);
          return;
        }
        if (event.target.closest('[data-final-preview]')) {
          clearTimeout(previewTimer);
          sendPreview(false);
          return;
        }
        const imageTab = event.target.closest('[data-image-select]');
        if (imageTab) {
          selectedDivision = imageTab.dataset.imageSelect;
          nav
            .querySelectorAll('button')
            .forEach((button) => button.setAttribute('aria-pressed', String(button === imageTab)));
          bannerPanel
            .querySelectorAll('[data-division-editor]')
            .forEach(
              (editor) => (editor.hidden = editor.dataset.divisionEditor !== selectedDivision),
            );
        }
        if (event.target.closest('[data-expand-preview]')) {
          const modal = document.createElement('dialog');
          modal.className = 'office-preview-dialog';
          modal.innerHTML =
            '<div class="preview-fullscreen-heading"><strong>Draft website preview</strong><div class="fullscreen-preview-actions"><button type="button" class="button outline small" data-full-replay>Replay intro</button><button type="button" class="button outline small" data-full-final>Final view</button><button type="button" class="button outline small" data-full-close>Close preview</button></div></div>';
          const group = form.querySelector('.customizer-panel:not([hidden])').dataset
            .customizerGroup;
          modal.querySelector('[data-full-replay]').hidden = ['about', 'banners'].includes(group);
          modal.querySelector('[data-full-replay]').textContent =
            group === 'landing-about' ? 'Replay entrance' : 'Replay intro';
          modal.append(viewport);
          document.body.append(modal);
          modal.querySelector('[data-full-close]').onclick = () => modal.close();
          modal.querySelector('[data-full-replay]').onclick = () => {
            clearTimeout(previewTimer);
            sendPreview(true);
          };
          modal.querySelector('[data-full-final]').onclick = () => {
            clearTimeout(previewTimer);
            sendPreview(false);
          };
          modal.addEventListener('close', () => {
            panel.querySelector('.preview-toolbar').after(viewport);
            modal.remove();
            fit();
          });
          modal.showModal();
          fit();
          return;
        }
        queueMicrotask(refresh);
      },
      { signal: controller.signal },
    );
    form.addEventListener('input', () => queueMicrotask(refresh), { signal: controller.signal });
    form.addEventListener('change', () => queueMicrotask(refresh), { signal: controller.signal });
    refresh();
  }
  function projectPhotos(editor) {
    if (editor.dataset.gallery !== undefined) return JSON.parse(editor.dataset.gallery);
    const project = window.TechouseContent.snapshot().projects.find(
      (item) => item.id === editor.elements.projectId.value,
    );
    return project
      ? project.gallery?.length
        ? project.gallery
        : project.image
          ? [{ src: project.image, caption: project.title }]
          : []
      : [];
  }
  function drawProjectPhotos(editor) {
    const photos = projectPhotos(editor),
      list = editor.querySelector('.project-photo-manager');
    if (!list) return;
    list.innerHTML = `<div class="project-photo-manager-heading"><strong>Project images</strong><span>${photos.length} / 3</span></div>${photos.length ? `<div class="project-photo-thumbnails">${photos.map((photo, i) => `<article><img src="${esc(photo.src)}" alt="${esc(photo.caption || 'Project photo ' + (i + 1))}"><span>${i === 0 ? 'Cover image' : 'Image ' + (i + 1)}</span><div>${i ? `<button type="button" data-photo-cover="${i}">Make cover</button>` : ''}<button type="button" data-photo-remove="${i}" aria-label="Remove project image ${i + 1}">Remove</button></div></article>`).join('')}</div>` : '<p>No images yet. Add up to three photos for this project.</p>'}`;
    const preview = editor.querySelector('#project-image-preview');
    preview.hidden = true;
    const upload = editor.querySelector('[data-project-upload]');
    upload.disabled = photos.length >= 3;
    const hint = upload.parentElement.querySelector('small');
    hint.textContent =
      photos.length >= 3
        ? 'Image limit reached. Remove an image to add another.'
        : 'Add images to this list. Up to 3 images per project; the first is the cover.';
  }
  function addProjectPhotos(editor, images) {
    editor.dataset.unsaved = 'true';
    const photos = projectPhotos(editor);
    if (photos.length + images.length > 3) throw Error('Each project can have up to 3 images.');
    photos.push(
      ...images.map((src, i) => ({ src, caption: 'Project photo ' + (photos.length + i + 1) })),
    );
    editor.dataset.gallery = JSON.stringify(photos);
    editor.dataset.image = photos[0]?.src || '';
    editor.querySelector('[data-project-upload]').value = '';
    drawProjectPhotos(editor);
    editor.querySelector('#project-status').textContent =
      'Photos added. Save this project to apply the gallery changes.';
  }
  function editorMode(editor, animate = true) {
    editor.dataset.revision = String(Number(editor.dataset.revision || 0) + 1);
    editor.querySelector('#project-status').textContent = '';
    const editing = !!editor.elements.projectId.value;
    editor.dataset.mode = editing ? 'edit' : 'new';
    const badge = editor.querySelector('.project-mode-badge');
    badge.textContent = editing ? 'EDITING EXISTING PROJECT' : 'CREATING A NEW PROJECT';
    editor.querySelector('.project-editor-help').textContent = editing
      ? 'Update this project’s details, gallery and publishing status.'
      : 'Start a separate project story. Save a draft while details are still being prepared.';
    editor.querySelector('[data-new-project]').textContent = editing
      ? 'Cancel editing'
      : 'Clear new project';
    editor.querySelector('button[type="submit"]').textContent = editing
      ? 'Update project'
      : 'Create project';
    if (!editing && projectStatus === 'draft') editor.elements.status.value = 'draft';
    document
      .querySelectorAll('.managed-project-row')
      .forEach((row) =>
        row.classList.toggle(
          'project-being-edited',
          row.querySelector('[data-edit-project]').dataset.editProject ===
            editor.elements.projectId.value,
        ),
      );
    drawProjectPhotos(editor);
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      editor.animate(
        [
          { opacity: 0.4, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 300, easing: 'ease-out' },
      );
  }
  function renderProjects() {
    const browser = document.querySelector('.project-manager-browser');
    if (!browser) return;
    const records = window.TechouseContent.snapshot().projects;
    const all = records.filter(
      (project) => projectStatus === 'all' || project.status === projectStatus,
    );
    browser.querySelectorAll('[data-office-status]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.officeStatus === projectStatus));
      button.querySelector('span').textContent = records.filter(
        (project) =>
          button.dataset.officeStatus === 'all' || project.status === button.dataset.officeStatus,
      ).length;
    });
    const matches = all.filter(
      (project) =>
        (projectSector === 'all' || (project.sector || 'residential') === projectSector) &&
        `${project.title} ${project.location} ${project.capacity}`
          .toLowerCase()
          .includes(projectQuery.toLowerCase()),
    );
    const pages = Math.max(1, Math.ceil(matches.length / 5));
    projectPage = Math.min(projectPage, pages - 1);
    browser.querySelectorAll('[data-office-sector]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.officeSector === projectSector));
      button.querySelector('span').textContent = all.filter(
        (p) =>
          button.dataset.officeSector === 'all' ||
          (p.sector || 'residential') === button.dataset.officeSector,
      ).length;
    });
    browser.querySelector('.managed-project-list').innerHTML =
      matches
        .slice(projectPage * 5, projectPage * 5 + 5)
        .map(
          (project) =>
            `<article class="managed-project-row"><img src="${esc(project.image || 'assets/solar.jpg')}" alt="" loading="lazy"><div><span class="managed-project-meta">${esc(project.sector || 'residential')} · ${esc(project.status)}${project.sample ? ' · Sample' : ''}</span><h3>${esc(project.title)}</h3><p>${esc(project.location)} · ${esc(project.capacity)}</p></div><div class="managed-project-actions"><button type="button" data-edit-project="${esc(project.id)}" aria-label="Edit ${esc(project.title)}">${window.TechouseIcons.icon('dashboard')} Edit</button><button type="button" data-delete-project="${esc(project.id)}" aria-label="Remove ${esc(project.title)}">Remove</button></div></article>`,
        )
        .join('') ||
      (projectStatus === 'draft' && !projectQuery && projectSector === 'all'
        ? '<div class="empty-state"><h3>No drafts yet</h3><p>Choose Add project, then Save draft to prepare a story without publishing it.</p></div>'
        : '<div class="empty-state"><h3>No matching projects</h3><p>Try a different category or search.</p></div>');
    browser.querySelector('[data-office-page="-1"]').disabled = projectPage === 0;
    browser.querySelector('[data-office-page="1"]').disabled = projectPage >= pages - 1;
    browser.querySelector('.managed-page-status').textContent =
      `${matches.length ? projectPage * 5 + 1 : 0}–${Math.min(projectPage * 5 + 5, matches.length)} of ${matches.length} · Page ${projectPage + 1} of ${pages}`;
  }
  function mountProjects() {
    const editor = document.querySelector('#project-editor');
    if (!editor) return;
    const grid = editor.parentElement;
    grid.classList.add('project-manager-layout');
    const browser = editor.nextElementSibling;
    browser.className = 'project-manager-browser';
    browser.innerHTML = `<div class="project-browser-heading"><div><h2>Project library</h2><p>Find a project, then choose Edit to update its details and photos.</p></div><button class="button small" type="button" data-new-project>+ Add project</button></div><div class="office-status-tabs" aria-label="Project publication status">${[
      ['all', 'All projects'],
      ['published', 'Published'],
      ['draft', 'Drafts'],
    ]
      .map(
        ([status, label]) =>
          `<button type="button" data-office-status="${status}" aria-pressed="false">${label} <span></span></button>`,
      )
      .join(
        '',
      )}</div><div class="office-sector-tabs" aria-label="Filter projects by sector">${['all', 'residential', 'commercial', 'industrial'].map((sector) => `<button type="button" data-office-sector="${sector}" aria-pressed="false">${sector.charAt(0).toUpperCase() + sector.slice(1)} <span></span></button>`).join('')}</div><label class="project-search-label">Search projects<input type="search" class="search-input" placeholder="Search title, location or capacity" aria-label="Search projects" value="${esc(projectQuery)}"></label><div class="managed-project-list"></div><div class="managed-project-pagination"><button type="button" class="button outline small" data-office-page="-1" aria-label="Previous five projects">← Previous</button><span class="managed-page-status" role="status" aria-live="polite"></span><button type="button" class="button outline small" data-office-page="1" aria-label="Next five projects">Next →</button></div>`;
    grid.prepend(browser);
    editor.classList.add('compact-project-editor');
    editor.insertAdjacentHTML(
      'afterbegin',
      '<div class="project-mode-header"><span class="project-mode-badge"></span></div>',
    );
    editor
      .querySelector('#project-image-preview')
      .insertAdjacentHTML('afterend', '<div class="project-photo-manager"></div>');
    editor
      .querySelector('button[type="submit"]')
      .insertAdjacentHTML(
        'afterend',
        '<button class="button outline" type="button" data-save-project-draft>Save draft</button>',
      );
    editor.addEventListener(
      'click',
      (event) => {
        const remove = event.target.closest('[data-photo-remove]'),
          cover = event.target.closest('[data-photo-cover]');
        if (remove || cover) {
          editor.dataset.unsaved = 'true';
          const photos = projectPhotos(editor),
            index = Number((remove || cover).dataset[remove ? 'photoRemove' : 'photoCover']);
          if (remove) photos.splice(index, 1);
          else photos.unshift(photos.splice(index, 1)[0]);
          editor.dataset.gallery = JSON.stringify(photos);
          editor.dataset.image = photos[0]?.src || '';
          drawProjectPhotos(editor);
          editor.querySelector('#project-status').textContent =
            'Photo list updated. Save this project to apply the changes.';
        }
        if (event.target.closest('[data-save-project-draft]')) {
          editor.elements.status.value = 'draft';
          editor.requestSubmit(editor.querySelector('button[type="submit"]'));
        }
      },
      { signal: controller.signal },
    );
    document.addEventListener(
      'click',
      (event) => {
        if (event.target.closest('[data-edit-project],[data-new-project]'))
          queueMicrotask(() => {
            if (editor.isConnected) editorMode(editor);
          });
      },
      { signal: controller.signal },
    );
    editor
      .querySelector('h2')
      .insertAdjacentHTML(
        'afterend',
        '<p class="project-editor-help">Create a new story or select Edit from the library.</p>',
      );
    browser.addEventListener(
      'input',
      (event) => {
        if (event.target.matches('input[type="search"]')) {
          projectQuery = event.target.value;
          projectPage = 0;
          renderProjects();
        }
      },
      { signal: controller.signal },
    );
    browser.addEventListener(
      'click',
      (event) => {
        const status = event.target.closest('[data-office-status]');
        if (status) {
          projectStatus = status.dataset.officeStatus;
          projectPage = 0;
          renderProjects();
        }
        const sector = event.target.closest('[data-office-sector]'),
          page = event.target.closest('[data-office-page]');
        if (sector) {
          projectSector = sector.dataset.officeSector;
          projectPage = 0;
          renderProjects();
        }
        if (page) {
          projectPage += Number(page.dataset.officePage);
          renderProjects();
        }
      },
      { signal: controller.signal },
    );
    renderProjects();
    editorMode(editor, false);
  }
  function mount() {
    controller?.abort();
    resize?.disconnect();
    clearTimeout(previewTimer);
    lastPreview = '';
    form = null;
    baseline = null;
    dirty = false;
    iframe = null;
    allowedURL = location.href;
    document.querySelector('#draft-review-dialog')?.remove();
    controller = new AbortController();
    if (document.querySelector('#website-customizer')) mountCustomizer();
    mountProjects();
  }
  window.addEventListener('message', (event) => {
    if (
      event.source === iframe?.contentWindow &&
      event.origin === location.origin &&
      event.data?.type === 'techouse-preview-ready'
    ) {
      lastPreview = '';
      sendPreview(false);
    }
  });
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href]');
      if (
        !dirty ||
        !form?.isConnected ||
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      )
        return;
      const url = new URL(link.href);
      if (url.href === location.href) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      pendingURL = url.href;
      review(true);
    },
    true,
  );
  window.addEventListener('hashchange', (event) => {
    if (!dirty || !form?.isConnected) return;
    pendingURL = location.href;
    history.replaceState(null, '', allowedURL);
    event.stopImmediatePropagation();
    review(true);
  });
  window.addEventListener('beforeunload', (event) => {
    if (dirty && form?.isConnected) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  return { mount, refresh, markSaved, projectPhotos, addProjectPhotos };
})();
