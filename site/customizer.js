/** Browser-local content tools. Text is always rendered as text, never executable markup. */
window.TechouseContent = (() => {
  const key = 'techouse.content.v1';
  const projectDetailFields = [
    ['system', 'System / application', 'e.g. Grid-tied solar'],
    ['projectCost', 'Project cost (PHP)', 'e.g. ₱240,000'],
    ['roi', 'ROI / payback period', 'e.g. 5.5 years simple payback'],
    ['annualMaintenance', 'Estimated annual maintenance (PHP)', 'e.g. ₱3,000 / year'],
    ['roofType', 'Roofing type', 'e.g. Long-span metal roofing'],
  ];
  const projectStoryFields = [
    [
      'engineeringChallenges',
      'Engineering challenges & solutions',
      'Describe the site challenge, the solution and the outcome.',
    ],
    ['clientFeedback', 'Client feedback', 'Add an approved client quote or feedback.'],
  ];
  const escape = (v = '') =>
    String(v).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  let data;
  try {
    data = window.TechouseBoot
      ? structuredClone(window.TechouseBoot)
      : JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    data = {};
  }
  data.text ||= {};
  data.images ||= {};
  // Upgrade only the untouched starter concepts; keep client-created/edited project records.
  const oldTitles = [
    'Residential rooftop concept',
    'Commercial energy concept',
    'Industrial rooftop concept',
  ];
  data.projects ||= [];
  if (!data.portfolioVersion) {
    data.projects = data.projects.filter(
      (p) => !(oldTitles.includes(p.title) && /^sample-[0-2]$/.test(p.id) && p.sample),
    );
    const ids = new Set(data.projects.map((p) => p.id));
    data.projects.push(...window.TechousePortfolioSamples.filter((p) => !ids.has(p.id)));
    data.portfolioVersion = 2;
  }
  // Refresh only the original repeating reference galleries; uploaded client photos stay intact.
  for (const project of data.projects) {
    const reference = window.TechousePortfolioSamples.find(
      (item) => item.id === project.id && item.sector === 'residential',
    );
    if (
      reference &&
      project.reference &&
      project.gallery?.length === 2 &&
      project.gallery[1].caption?.startsWith('Related installation:') &&
      /^assets\/project-references\/res-(qc|paranaque|cavite)\.jpg$/.test(project.gallery[1].src)
    ) {
      project.gallery = structuredClone(reference.gallery);
    }
  }
  const fields = [
    ['home', '.landing-kicker', 'Company promise (intro only)'],
    ['home', '#landing-title', 'Main question'],
    ['home', '#company-title', 'Landing About heading'],
    ['home', '.company-story p:nth-of-type(1)', 'About story'],
    ['home', '.company-story-close', 'About closing line'],
    ['about', '.page-hero h1', 'Detailed About title'],
    ['about', '.page-hero p', 'Detailed About introduction'],
    ['about', '.content-columns h2', 'Company heading'],
    ['about', '.content-columns > div:first-child p:nth-of-type(1)', 'Company paragraph 1'],
    ['about', '.content-columns > div:first-child p:nth-of-type(2)', 'Company paragraph 2'],
    ['about', '.scope-panel .scope-label', 'Second panel heading'],
    ['about', '.scope-panel p:nth-of-type(1)', 'Second panel paragraph 1'],
    ['about', '.scope-panel p:nth-of-type(2)', 'Second panel paragraph 2'],
  ];
  const divisions = ['solar', 'construction', 'prefabrication', 'development', 'elevators'];
  for (const id of divisions)
    for (const [sel, label] of [
      ['h2', 'heading'],
      ['.banner-division-label', 'division label'],
    ])
      fields.push(['home', `[data-banner="${id}"] ${sel}`, `${id}: ${label}`]);
  async function persist(next) {
    if (window.TechouseAdmin) {
      try {
        const saved = await window.TechousePlatform.saveContent(next);
        data = saved;
        return true;
      } catch (error) {
        alert(error.message);
        return false;
      }
    }
    try {
      localStorage.setItem(key, JSON.stringify(next));
      data = next;
      return true;
    } catch {
      alert(
        'Could not save. Browser storage is full or unavailable. Try removing images or using smaller files.',
      );
      return false;
    }
  }
  function imageURL(v) {
    return /^(data:image\/(jpeg|png|webp);base64,|assets\/)/.test(v || '') ? v : 'assets/solar.jpg';
  }
  function apply(path) {
    const group = path === '/' ? 'home' : path === '/about' ? 'about' : '';
    for (const [page, selector] of fields)
      if (page === group && Object.hasOwn(data.text, selector))
        document
          .querySelector(selector)
          ?.replaceChildren(document.createTextNode(data.text[selector]));
    if (path === '/')
      for (const id of divisions)
        if (data.images[id]) {
          const host = document.querySelector(`[data-banner="${id}"] .banner-background`);
          if (host) host.innerHTML = `<img src="${imageURL(data.images[id])}" alt="">`;
        }
    window.TechousePortfolio.destroy();
    const section = document.querySelector('#projects');
    if (section)
      window.TechousePortfolio.mount(
        section,
        data.projects.filter((p) => p.status !== 'draft'),
        imageURL,
      );
    const customizer = document.querySelector('#website-customizer');
    if (customizer) updateCustomizer(customizer, '');
    const form = document.querySelector('#post-form');
    if (form) {
      const select = form.elements.cover;
      if (/^data:image\//.test(form.dataset.upload || '')) return;
      const previous = posts.find((p) => p.id === form.dataset.id);
      if (previous?.cover?.startsWith('data:image/')) {
        const opt = new Option('Uploaded image', previous.cover, true, true);
        select.add(opt);
      }
      const label = document.createElement('label');
      label.className = 'upload-field';
      label.innerHTML =
        'Upload a custom cover<input type="file" accept="image/jpeg,image/png,image/webp" data-post-upload><small>JPEG, PNG or WebP. Images are resized before saving.</small>';
      select.parentElement.after(label);
    }
  }
  function page(home, about, top, tabs) {
    const roots = {};
    for (const [name, html] of Object.entries({ home, about })) {
      roots[name] = document.createElement('div');
      roots[name].innerHTML = html;
      roots[name].querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    }
    const groups = [
      {
        id: 'opening',
        title: 'Opening message',
        note: 'Your company promise appears in the logo opening. The main question appears on the homepage.',
        filter: ([page, selector]) =>
          page === 'home' && !selector.startsWith('[data-banner') && !selector.includes('company'),
      },
      {
        id: 'banners',
        title: 'Division banners',
        note: 'Edit each headline and its division label.',
        filter: ([, selector]) => selector.startsWith('[data-banner'),
      },
      {
        id: 'landing-about',
        title: 'Landing About',
        note: 'The company introduction directly below the banners.',
        filter: ([page, selector]) => page === 'home' && selector.includes('company'),
      },
      {
        id: 'about',
        title: 'Detailed About',
        note: 'The complete company introduction on the About page.',
        filter: ([page]) => page === 'about',
      },
      {
        id: 'images',
        title: 'Banner images',
        note: 'Upload JPEG, PNG or WebP. Images are resized for the prototype.',
        filter: () => false,
      },
    ];
    const defaultImages = {
      solar: 'solar.c391b72bc407.jpg',
      construction: 'construction.5154dbc7c67d.jpg',
      prefabrication: 'architecture.26e250a22279.jpg',
      development: 'development.c87084358595.jpg',
      elevators: 'Techouse Images/Elevator.b55adcb70afa.webp',
    };
    return `<section class="container admin-shell">${top('Website customizer', 'Edit your website in focused sections. Review changes here, then save or save and preview. Resets are staged until you save.')}${tabs('customizer')}<form id="website-customizer"><div class="customizer-workspace"><nav class="customizer-sidebar" aria-label="Customizer sections">${groups.map((group, i) => `<button type="button" data-customizer-section="${group.id}" aria-pressed="${i === 0}" aria-controls="customizer-${group.id}"><span>0${i + 1}</span>${group.title}</button>`).join('')}<p>${window.TechouseAdmin ? 'Saved changes publish to your shared website.' : 'Changes stay in this browser.'}</p></nav><div class="customizer-panels">${groups
      .map(
        (group, i) =>
          `<section class="form-card customizer-panel" id="customizer-${group.id}" data-customizer-group="${group.id}" ${i ? 'hidden' : ''}><div class="customizer-section-heading"><div><h2>${group.title}</h2><p>${group.note}</p></div><button type="button" class="text-link" data-reset-section="${group.id}">Reset section</button></div>${
            group.id === 'images'
              ? `<div class="image-editor-grid">${divisions.map((id) => `<div class="content-field"><label for="banner-upload-${id}">${id.charAt(0).toUpperCase() + id.slice(1)}</label><img class="upload-preview" src="${imageURL(data.images[id] || 'assets/' + defaultImages[id])}" data-default-image="${escape('assets/' + defaultImages[id])}" alt="${id} banner preview"><input id="banner-upload-${id}" type="file" accept="image/jpeg,image/png,image/webp" data-banner-upload="${id}"><label class="restore-image"><input type="checkbox" name="remove-${id}"> Use original image</label></div>`).join('')}</div>`
              : fields
                  .filter(group.filter)
                  .map(([page, selector, label]) => {
                    const original = (
                      roots[page].querySelector(selector)?.textContent || ''
                    ).trim();
                    const index = fields.findIndex((f) => f[1] === selector);
                    return `<div class="content-field"><div class="customizer-field-heading"><label for="custom-text-${index}">${escape(label)}</label><button type="button" data-reset-field="${escape(selector)}" aria-label="Restore default for ${escape(label)}">Restore default</button></div><textarea id="custom-text-${index}" name="${escape(selector)}" rows="${label.includes('paragraph') || label.includes('description') ? 4 : 2}" maxlength="2000" data-default="${escape(original)}">${escape(data.text[selector] ?? original)}</textarea></div>`;
                  })
                  .join('')
          }</section>`,
      )
      .join(
        '',
      )}<aside class="customizer-live-preview" aria-label="Text preview"><span>LIVE TEXT PREVIEW</span><h3></h3><p></p></aside></div></div><div class="customizer-savebar"><div><strong id="customizer-save-state">All changes saved</strong><p role="status" id="content-status">Choose a section to start editing.</p></div><div class="customizer-save-actions"><button class="button outline" type="button" data-reset-customizer>Reset all to defaults</button><button class="button outline" type="button" data-discard-customizer>Discard changes</button><button class="button" type="submit">Save changes</button><button class="button outline" type="submit" name="action" value="preview">Save & preview ↗</button></div></div></form></section>`;
  }
  function updateCustomizer(form, message = 'Unsaved changes. Save when you are ready.') {
    const panel = form.querySelector('.customizer-panel:not([hidden])');
    const inputs = [...panel.querySelectorAll('textarea')];
    const preview = form.querySelector('.customizer-live-preview');
    preview.hidden = !inputs.length;
    preview.querySelector('h3').textContent = inputs[0]?.value || '';
    preview.querySelector('p').textContent = inputs
      .slice(1, 3)
      .map((input) => input.value)
      .join('\n\n');
    if (message) {
      form.querySelector('#customizer-save-state').textContent = 'Unsaved changes';
      form.querySelector('#content-status').textContent = message;
    }
    window.TechouseOfficeUI?.refresh();
  }
  function restoreCustomizerPanel(panel) {
    panel.querySelectorAll('textarea').forEach((input) => (input.value = input.dataset.default));
    panel.querySelectorAll('[data-banner-upload]').forEach((input) => {
      delete input.dataset.image;
      input.value = '';
      const field = input.closest('.content-field');
      field.querySelector('img').src = field.querySelector('img').dataset.defaultImage;
      field.querySelector('input[type="checkbox"]').checked = true;
    });
  }
  function projectsPage(top, tabs) {
    return `<section class="container admin-shell">${top('Solar project stories', 'Add previous work, upload a photo, and choose whether it is published. Keep examples labeled until replaced with approved company projects.')}${tabs('projects')}<div class="customizer-grid"><form class="form-card" id="project-editor"><h2 id="project-editor-title">Add a project</h2><input type="hidden" name="projectId">${[
      ['title', 'Project title'],
      ['location', 'Location'],
      ['capacity', 'System capacity'],
    ]
      .map(
        ([name, label]) =>
          `<label class="content-field">${label}<input name="${name}" required maxlength="160"></label>`,
      )
      .join(
        '',
      )}<label class="content-field">Project description<textarea name="description" required maxlength="2500"></textarea></label><h3 class="project-editor-section-heading">Investment & property</h3><p class="project-editor-section-note">Optional details shown in the project portfolio. Leave unknown values blank.</p>${projectDetailFields.map(([name, label, hint]) => `<label class="content-field">${label}<input name="${name}" maxlength="500" placeholder="${escape(hint)}"></label>`).join('')}<h3 class="project-editor-section-heading">Project story</h3>${projectStoryFields.map(([name, label, hint]) => `<label class="content-field">${label}<textarea name="${name}" maxlength="2500" placeholder="${escape(hint)}"></textarea></label>`).join('')}<h3 class="project-editor-section-heading">Photos & publication</h3><label class="content-field">Project photos<input type="file" multiple accept="image/jpeg,image/png,image/webp" data-project-upload><small>Add up to 3 images. Manage or remove each photo below.</small></label><img class="upload-preview" id="project-image-preview" src="assets/solar.jpg" alt="Project image preview"><label class="content-field">Sector<select name="sector"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option></select></label><label class="content-field">Status<select name="status"><option value="published">Published</option><option value="draft">Draft</option></select></label><label><input type="checkbox" name="sample" checked> Illustrative sample, not completed company work</label><p id="project-status" role="status"></p><button class="button" type="submit">Save project</button> <button type="button" class="button outline" data-new-project>New project</button></form><div>${data.projects.map((p) => `<article class="form-card project-admin-card"><span class="pill">${p.sample ? 'SAMPLE · ' : ''}${escape(p.status)}</span><h3>${escape(p.title)}</h3><p>${escape(p.location)} · ${escape(p.capacity)}</p><button type="button" class="text-link" data-edit-project="${escape(p.id)}">Edit</button> <button type="button" class="text-link" data-delete-project="${escape(p.id)}">Remove</button></article>`).join('')}</div></div></section>`;
  }
  // Resize uploads before storage; only decoded raster images are accepted.
  async function upload(file) {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw Error('Choose a JPEG, PNG or WebP image.');
    if (file.size > 15 * 1024 * 1024) throw Error('Choose an image smaller than 15 MB.');
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.78);
  }
  document.addEventListener('input', (event) => {
    const form = event.target.closest('#website-customizer');
    if (form) updateCustomizer(form);
  });
  document.addEventListener('click', (event) => {
    const form = document.querySelector('#website-customizer');
    if (!form) return;
    if (event.target.closest('[data-discard-customizer]')) {
      render();
      return;
    }
    const section = event.target.closest('[data-customizer-section]');
    if (section) {
      form
        .querySelectorAll('[data-customizer-section]')
        .forEach((button) => button.setAttribute('aria-pressed', String(button === section)));
      form
        .querySelectorAll('[data-customizer-group]')
        .forEach(
          (panel) =>
            (panel.hidden = panel.dataset.customizerGroup !== section.dataset.customizerSection),
        );
      updateCustomizer(form, '');
    }
    const field = event.target.closest('[data-reset-field]');
    if (field) {
      const input = form.elements.namedItem(field.dataset.resetField);
      input.value = input.dataset.default;
      updateCustomizer(form, 'Default text restored. Save to apply.');
    }
    const resetSection = event.target.closest('[data-reset-section]');
    if (resetSection) {
      restoreCustomizerPanel(
        document.getElementById('customizer-' + resetSection.dataset.resetSection),
      );
      updateCustomizer(form, 'Section defaults loaded. Save to apply.');
    }
    if (event.target.closest('[data-reset-customizer]')) {
      form.querySelectorAll('.customizer-panel').forEach(restoreCustomizerPanel);
      updateCustomizer(
        form,
        'All customizer defaults loaded. Save to apply. Projects and posts are unchanged.',
      );
    }
  });
  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (input.matches('.restore-image input')) {
      const field = input.closest('.content-field'),
        image = field.querySelector('img'),
        uploadInput = field.querySelector('[data-banner-upload]');
      image.src = input.checked
        ? image.dataset.defaultImage
        : uploadInput.dataset.image ||
          data.images[uploadInput.dataset.bannerUpload] ||
          image.dataset.defaultImage;
    }
    if (!input.matches('[data-banner-upload],[data-project-upload],[data-post-upload]')) return;
    const form = input.closest('form'),
      buttons = [...form.querySelectorAll('button[type="submit"],[data-save-project-draft]')];
    const editorRevision = form.dataset.revision;
    buttons.forEach((b) => (b.disabled = true));
    try {
      if (!input.files.length) return;
      if (
        input.hasAttribute('data-project-upload') &&
        window.TechouseOfficeUI.projectPhotos(form).length + input.files.length > 3
      )
        throw Error('Each project can have up to 3 images. Remove a photo before adding more.');
      const images = await Promise.all([...input.files].map(upload));
      const image = images[0];
      if (input.hasAttribute('data-banner-upload')) {
        input.dataset.image = image;
        input.parentElement.querySelector('img').src = image;
        input.parentElement.querySelector('input[type=checkbox]').checked = false;
        updateCustomizer(form);
      } else if (input.hasAttribute('data-project-upload')) {
        if (form.dataset.revision !== editorRevision)
          throw Error(
            'The project editor changed during upload. Select the photos again for this project.',
          );
        window.TechouseOfficeUI.addProjectPhotos(form, images);
      } else {
        const select = form.elements.cover;
        select.add(new Option('Uploaded image', image, true, true));
        document.querySelector('#cover-preview').src = image;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  });
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (form.getAttribute('id') === 'website-customizer') {
      event.preventDefault();
      if (form.dataset.saving === 'true') return;
      const next = structuredClone(data);
      for (const [, selector] of fields) {
        const value = form.elements.namedItem(selector).value.trim();
        if (value && value !== form.elements.namedItem(selector).dataset.default)
          next.text[selector] = value;
        else delete next.text[selector];
      }
      for (const id of divisions) {
        const input = form.querySelector(`[data-banner-upload="${id}"]`);
        if (form.elements.namedItem('remove-' + id).checked) delete next.images[id];
        else if (input.dataset.image) next.images[id] = input.dataset.image;
      }
      // Freeze the submitted fields until the server responds so later edits cannot
      // accidentally become the baseline for a save that did not include them.
      form.dataset.saving = 'true';
      form.inert = true;
      let saved;
      try {
        saved = await persist(next);
      } finally {
        form.dataset.saving = 'false';
        form.inert = false;
      }
      if (saved) {
        window.TechouseOfficeUI?.markSaved();
        form.querySelector('#customizer-save-state').textContent = 'All changes saved';
        form.querySelector('#content-status').textContent = window.TechouseAdmin
          ? 'Website changes saved online.'
          : 'Website changes saved in this browser.';
        if (event.submitter?.value === 'preview')
          location.hash = form.querySelector('#customizer-about:not([hidden])') ? '/about' : '/';
      }
      form.dispatchEvent(new CustomEvent('techouse:customizer-saved', { detail: { saved } }));
    }
    if (form.getAttribute('id') === 'project-editor') {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      const previous = data.projects.find((p) => p.id === values.projectId);
      const gallery = window.TechouseOfficeUI.projectPhotos(form);
      if (gallery.length > 3) {
        document.querySelector('#project-status').textContent =
          'Keep up to 3 project images before saving.';
        return;
      }
      if (values.status === 'published' && !gallery.length) {
        document.querySelector('#project-status').textContent =
          'Add at least one image before publishing, or save this project as a draft.';
        return;
      }
      const project = {
        ...previous,
        id: values.projectId || 'project-' + crypto.randomUUID(),
        sector: values.sector || 'residential',
        title: values.title.trim(),
        location: values.location.trim(),
        capacity: values.capacity.trim(),
        description: values.description.trim(),
        ...Object.fromEntries(
          [...projectDetailFields, ...projectStoryFields].map(([name]) => [
            name,
            (values[name] || '').trim(),
          ]),
        ),
        sample: !!values.sample,
        status: values.status,
        image: gallery[0]?.src || '',
        gallery,
        reference: !!previous?.reference,
      };
      if (
        ![project.title, project.location, project.capacity, project.description].every(Boolean)
      ) {
        document.querySelector('#project-status').textContent =
          'Please complete the title, location, capacity and project description.';
        return;
      }
      const next = structuredClone(data);
      next.projects = previous
        ? next.projects.map((p) => (p.id === project.id ? project : p))
        : [project, ...next.projects];
      if (await persist(next)) render();
    }
  });
  document.addEventListener('click', async (event) => {
    const button = event.target.closest(
      '[data-edit-project],[data-delete-project],[data-new-project]',
    );
    if (!button) return;
    const form = document.querySelector('#project-editor');
    if (button.hasAttribute('data-delete-project')) {
      if (!confirm('Remove this project story?')) return;
      const next = structuredClone(data);
      next.projects = next.projects.filter((p) => p.id !== button.dataset.deleteProject);
      if (await persist(next)) render();
      return;
    }
    if (form.dataset.unsaved === 'true' && !confirm('Discard your unsaved project changes?')) {
      event.stopImmediatePropagation();
      return;
    }
    form.dataset.unsaved = 'false';
    form.reset();
    document.querySelector('#project-editor-title').textContent = button.hasAttribute(
      'data-edit-project',
    )
      ? 'Edit project'
      : 'Add a project';
    delete form.dataset.image;
    delete form.dataset.gallery;
    document.querySelector('#project-image-preview').src = 'assets/solar.jpg';
    if (button.hasAttribute('data-edit-project')) {
      const project = data.projects.find((p) => p.id === button.dataset.editProject);
      for (const name of [
        'title',
        'location',
        'capacity',
        'description',
        'status',
        ...projectDetailFields.map(([name]) => name),
        ...projectStoryFields.map(([name]) => name),
      ])
        form.elements[name].value = project[name] || '';
      form.elements.projectId.value = project.id;
      form.elements.sector.value = project.sector || 'residential';
      form.elements.sample.checked = project.sample;
      form.dataset.image = project.image;
      document.querySelector('#project-image-preview').src = imageURL(project.image);
    }
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const previewFrame =
    new URLSearchParams(location.search).has('office-preview') && window.parent !== window;
  function startPreview(renderPage) {
    let previousView = null,
      latestRevision = -1;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener(
      'click',
      (event) => {
        if (event.target.closest('a')) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    window.addEventListener('message', (event) => {
      if (
        event.source !== window.parent ||
        event.origin !== location.origin ||
        event.data?.type !== 'techouse-draft-preview'
      )
        return;
      if (!Number.isInteger(event.data.revision) || event.data.revision <= latestRevision) return;
      latestRevision = event.data.revision;
      const draft = event.data.draft;
      if (!draft || typeof draft.text !== 'object' || typeof draft.images !== 'object') return;
      data.text = Object.fromEntries(
        Object.entries(draft.text).filter(
          ([key, value]) => fields.some((field) => field[1] === key) && typeof value === 'string',
        ),
      );
      data.images = Object.fromEntries(
        Object.entries(draft.images).filter(
          ([key, value]) => divisions.includes(key) && typeof value === 'string',
        ),
      );
      const view = event.data.view || 'opening';
      const url = new URL(location.href);
      url.hash = view === 'about' ? '/about' : '/';
      history.replaceState(null, '', url.href);
      window.techouseIntroStarted = !(event.data.animate && view === 'opening');
      window.TechouseExperience.setCompanyPreview?.(view === 'landing-about' && event.data.animate);
      const rebuild =
        previousView !== view ||
        event.data.animate ||
        document.querySelector('.division-landing.intro-playing');
      if (rebuild) renderPage();
      else {
        const group = view === 'about' ? 'about' : 'home';
        for (const [page, selector] of fields) {
          if (page !== group || !Object.hasOwn(data.text, selector)) continue;
          const node = document.querySelector(selector);
          if (node && node.textContent !== data.text[selector])
            node.textContent = data.text[selector];
        }
        if (group === 'home')
          for (const id of divisions) {
            const background = document.querySelector(`[data-banner="${id}"] .banner-background`);
            const src = imageURL(data.images[id]);
            if (!background) continue;
            // Both layers must use the same image after upload, reset or preview edits.
            background.querySelectorAll('img').forEach((image) => {
              if (image.getAttribute('src') !== src) image.src = src;
            });
          }
      }
      previousView = view;
      document.documentElement.dataset.previewRevision = String(latestRevision);
      if (view === 'landing-about') {
        const section = document.querySelector('#company');
        if (section) window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
      }
      if (view === 'banners') {
        document.querySelectorAll('[data-banner]').forEach((banner) => {
          const selected = banner.dataset.banner === event.data.division;
          banner.style.outline = selected ? '4px solid #e5bf78' : '';
          banner.style.outlineOffset = '-4px';
          banner.style.opacity = selected ? '1' : '.65';
        });
      }
    });
    window.parent.postMessage(
      { type: 'techouse-preview-ready' },
      location.origin === 'null' ? '*' : location.origin,
    );
  }
  return {
    imageURL,
    apply,
    page,
    projectsPage,
    snapshot: () => structuredClone(data),
    customizationSnapshot: () => structuredClone({ text: data.text, images: data.images }),
    previewFrame,
    startPreview,
  };
})();

// Protect an unfinished project when selecting another record or refreshing.
document.addEventListener('input', (event) => {
  const editor = event.target.closest('#project-editor');
  if (editor) editor.dataset.unsaved = 'true';
});
window.addEventListener('beforeunload', (event) => {
  if (document.querySelector('#project-editor')?.dataset.unsaved === 'true') {
    event.preventDefault();
    event.returnValue = '';
  }
});
window.addEventListener(
  'hashchange',
  (event) => {
    if (document.querySelector('#project-editor')?.dataset.unsaved !== 'true') return;
    if (confirm('Discard your unsaved project changes and leave this page?')) return;
    history.replaceState(null, '', event.oldURL);
    event.stopImmediatePropagation();
  },
  true,
);
