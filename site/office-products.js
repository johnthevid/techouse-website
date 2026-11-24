/** Back office → Solar products: edit the Skyworth equipment catalogue shown on the solar pages.
 * Saves the whole list into the shared content record (content.products) through TechouseContent.
 */
window.TechouseProducts = (() => {
  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const icon = (name) => window.TechouseIcons.icon(name);
  const catalogue = () => window.TechouseCatalogue;
  const categories = () => Object.entries(catalogue().labels);
  const fileName = (path) => decodeURIComponent(String(path).split('/').pop());
  let list = [],
    selected = null,
    draft = null,
    dirty = false,
    filter = 'all',
    confirming = false,
    saving = false,
    message = '',
    panel = 'edit',
    // Add product and Edit product keep separate drafts, so switching tabs never loses work.
    formPanel = 'edit',
    stash = { add: null, edit: null },
    previewCategory = 'panels',
    previewSize = 'desktop',
    frame = null,
    frameReady = false,
    previewTimer = 0;

  const saved = () => Array.isArray(window.TechouseContent.snapshot().products);
  function reload() {
    list = structuredClone(catalogue().all());
  }
  const blank = (category = 'panels') => ({
    id: 'product-' + crypto.randomUUID().slice(0, 8),
    category,
    status: 'draft',
    title: '',
    subtitle: '',
    capacity: '',
    specs: [''],
    image: '',
    websiteModel: '',
    imageSource: '',
    pdf: '',
    isNew: true,
  });
  function select(id) {
    const product = list.find((p) => p.id === id);
    selected = product ? id : null;
    draft = product ? structuredClone(product) : null;
    if (draft) previewCategory = draft.category;
    if (draft && !draft.specs?.length) draft.specs = [''];
    dirty = false;
    confirming = false;
    message = '';
  }
  const anyDirty = () => dirty || !!stash.add?.dirty || !!stash.edit?.dirty;
  // Switch the right-hand panel: 'add', 'edit' or 'page'. Page preview shows the last form's draft.
  function setPanel(next, category) {
    if ((next === 'add' || next === 'edit') && next !== formPanel) {
      stash[formPanel] = { draft, dirty, message, confirming };
      const kept = stash[next];
      stash[next] = null;
      if (kept) ({ draft, dirty, message, confirming } = kept);
      else {
        const product = next === 'edit' ? list.find((p) => p.id === selected) : null;
        draft =
          next === 'add'
            ? blank(category || (filter === 'all' ? previewCategory : filter))
            : product
              ? structuredClone(product)
              : null;
        dirty = false;
        message = '';
        confirming = false;
      }
      formPanel = next;
    }
    if (next === 'add' && category && !dirty) draft = blank(category);
    if (next === 'add' && !draft) draft = blank(category || previewCategory);
    panel = next;
    if (draft) previewCategory = draft.category;
  }
  // Resize an upload in the browser. WebP keeps the transparent backgrounds of product cut-outs.
  async function resize(file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type))
      throw Error('Choose a JPEG, PNG or WebP image.');
    if (file.size > 15 * 1024 * 1024) throw Error('Choose an image smaller than 15 MB.');
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let url = canvas.toDataURL('image/webp', 0.86);
    if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/png');
    if (url.length > 680_000) url = canvas.toDataURL('image/webp', 0.7);
    if (url.length > 680_000)
      throw Error('This image is still too large after resizing. Try a simpler image.');
    return url;
  }

  // ---------- Rendering ----------
  function row(p, index, group) {
    const first = index === 0,
      last = index === group.length - 1;
    return `<li class="px-row${p.id === selected ? ' is-selected' : ''}"><button type="button" class="px-pick" data-pick-product="${esc(p.id)}" aria-pressed="${p.id === selected}"><span class="px-thumb">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : icon('solar_power')}</span><span class="px-row-text"><strong>${esc(p.title || 'Untitled product')}</strong><span>${esc([p.capacity, p.subtitle].filter(Boolean).join(' · ') || 'No details yet')}</span></span><span class="ix-status" data-status="${p.status === 'draft' ? 'closed' : 'won'}">${p.status === 'draft' ? 'Draft' : 'Published'}</span></button><span class="px-move"><button type="button" data-move-product="${esc(p.id)}" data-direction="-1" ${first ? 'disabled' : ''} aria-label="Move ${esc(p.title)} up">${icon('arrow_upward')}</button><button type="button" data-move-product="${esc(p.id)}" data-direction="1" ${last ? 'disabled' : ''} aria-label="Move ${esc(p.title)} down">${icon('arrow_downward')}</button></span></li>`;
  }
  function listView() {
    const groups = categories()
      .filter(([id]) => filter === 'all' || filter === id)
      .map(([id, label]) => {
        const group = list.filter((p) => p.category === id);
        return `<section class="px-group"><h2>${esc(label)} <span>${group.filter((p) => p.status !== 'draft').length} published${group.some((p) => p.status === 'draft') ? ` · ${group.filter((p) => p.status === 'draft').length} draft` : ''}</span></h2>${
          group.length
            ? `<ol class="px-list">${group.map((p, i) => row(p, i, group)).join('')}</ol>`
            : `<p class="ix-empty">No ${esc(label.toLowerCase())} yet. The website asks visitors to contact the team instead.</p>`
        }<button type="button" class="text-link px-add-in" data-new-product="${id}">${icon('add')} Add to ${esc(label.toLowerCase())}</button></section>`;
      })
      .join('');
    return `<div class="ix-filters" role="group" aria-label="Show products">${[
      ['all', 'All', list.length],
      ...categories().map(([id, label]) => [
        id,
        label,
        list.filter((p) => p.category === id).length,
      ]),
    ]
      .map(
        ([id, label, count]) =>
          `<button type="button" data-product-view="${id}" aria-pressed="${filter === id}">${esc(label)}<span>${count}</span></button>`,
      )
      .join('')}</div>${groups}`;
  }
  function datasheetField(p) {
    const bundled = catalogue().bundledDatasheets();
    const external = /^https:\/\//.test(p.pdf);
    const mode = p.pdfMode || (!p.pdf ? 'none' : external ? 'link' : 'site');
    const onSite = bundled.includes(p.pdf)
      ? bundled
      : p.pdf && !external
        ? [p.pdf, ...bundled]
        : bundled;
    return `<fieldset class="px-field px-datasheet"><legend>Datasheet</legend><div class="px-choice" role="radiogroup" aria-label="Datasheet source">${[
      ['site', 'PDF on this website'],
      ['link', 'Link to a PDF'],
      ['none', 'No datasheet'],
    ]
      .map(
        ([value, label]) =>
          `<label><input type="radio" name="pdfMode" value="${value}" ${mode === value ? 'checked' : ''}> ${label}</label>`,
      )
      .join('')}</div>${
      mode === 'site'
        ? `<select name="pdfSite" aria-label="Datasheet on this website">${onSite.map((path) => `<option value="${esc(path)}" ${p.pdf === path ? 'selected' : ''}>${esc(fileName(path))}</option>`).join('')}</select>`
        : mode === 'link'
          ? `<input name="pdfLink" type="url" inputmode="url" placeholder="https://…/datasheet.pdf" value="${esc(external ? p.pdf : '')}" aria-label="Datasheet link"><small>Use a public link, for example the manufacturer’s PDF. Large PDFs cannot be uploaded here yet.</small>`
          : '<small>Visitors see only the Enquire link.</small>'
    }</fieldset>`;
  }
  function imageField(p) {
    const options = [
      ...new Set(
        catalogue()
          .builtIn()
          .map((b) => b.image),
      ),
    ];
    const bundled = options.includes(p.image);
    return `<fieldset class="px-field px-image"><legend>Product image</legend><div class="px-image-row"><div class="px-image-preview">${p.image ? `<img src="${esc(p.image)}" alt="Current product image">` : `<span>${icon('solar_power')} No image</span>`}</div><div class="px-image-controls"><label>Use an image already on the site<select name="imagePick"><option value="">${p.image && !bundled ? 'Uploaded image' : 'Choose an image'}</option>${options.map((path) => `<option value="${esc(path)}" ${p.image === path ? 'selected' : ''}>${esc(fileName(path))}</option>`).join('')}</select></label><label class="px-upload">Or upload a new image<input type="file" accept="image/jpeg,image/png,image/webp" data-product-image><small>JPEG, PNG or WebP. Resized to 900 px; transparent backgrounds are kept.</small></label>${p.image ? '<button type="button" class="text-link ix-danger-link" data-clear-image>Remove image</button>' : ''}</div></div><label>What the image shows <small>(optional)</small><input name="websiteModel" maxlength="80" value="${esc(p.websiteModel)}" placeholder="e.g. G12R SERIES"></label><small class="px-help">Shown in Technical details as “Website image: … · related product family”, so visitors know a photo may show a related model.</small><label>Image source link <small>(optional)</small><input name="imageSource" type="url" inputmode="url" maxlength="400" value="${esc(p.imageSource)}" placeholder="https://www.skyworth-pv.com/…"></label></fieldset>`;
  }
  function editorView() {
    if (!draft)
      return `<div class="ix-detail-empty"><h2>Choose a product</h2><p>Select a product in the list to edit its name, specifications, image and datasheet. To create one, open Add product. Changes appear on the solar equipment pages once saved and published.</p><button type="button" class="button outline small" data-panel="add">${icon('add')} Add product</button></div>`;
    const p = draft;
    const exists = list.some((item) => item.id === p.id);
    return `<form class="px-editor" data-product-form novalidate><button type="button" class="ix-back text-link" data-close-product>${icon('arrow_back')} All products</button><header class="px-editor-head"><h2 tabindex="-1" id="px-editor-title">${exists ? 'Edit product' : 'New product'}</h2><p role="status" aria-live="polite" class="ix-save-state">${esc(message || (dirty ? 'Unsaved changes' : ''))}</p></header><div class="px-columns"><div class="px-fields"><div class="px-two"><label class="px-field">Category<select name="category">${categories()
      .map(
        ([id, label]) =>
          `<option value="${id}" ${p.category === id ? 'selected' : ''}>${esc(label)}</option>`,
      )
      .join(
        '',
      )}</select></label><label class="px-field">Status<select name="status"><option value="published" ${p.status !== 'draft' ? 'selected' : ''}>Published</option><option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft · hidden from visitors</option></select></label></div><label class="px-field">Product name <span class="px-req">Required</span><input name="title" required maxlength="120" value="${esc(p.title)}" placeholder="e.g. QM210RTHCD Series"></label><div class="px-two"><label class="px-field">Power or capacity<input name="capacity" maxlength="80" value="${esc(p.capacity)}" placeholder="e.g. 620–640 W"></label><label class="px-field">Short description<input name="subtitle" maxlength="160" value="${esc(p.subtitle)}" placeholder="e.g. N-type bifacial modules"></label></div><fieldset class="px-field px-specs"><legend>Technical details <small>Up to eight lines, shown under “Technical details”.</small></legend><ol>${p.specs
      .map(
        (spec, i) =>
          `<li><input name="spec" maxlength="200" value="${esc(spec)}" aria-label="Specification line ${i + 1}" placeholder="e.g. Up to 23.7% module efficiency"><button type="button" data-remove-spec="${i}" aria-label="Remove line ${i + 1}">${icon('remove')}</button></li>`,
      )
      .join(
        '',
      )}</ol>${p.specs.length < 8 ? `<button type="button" class="text-link" data-add-spec>${icon('add')} Add a line</button>` : ''}</fieldset>${imageField(p)}${datasheetField(p)}</div><aside class="px-preview" aria-label="Preview"><h3>Preview</h3><p>How the card appears on the ${esc(catalogue().labels[p.category].toLowerCase())} page.</p><div class="catalogue-page catalogue-refined px-preview-frame" data-preview inert><div class="catalogue-products">${catalogue().card({ ...clean(p), title: p.title.trim() || 'Product name' })}</div></div>${p.status === 'draft' ? '<p class="px-preview-note">Draft: visitors will not see this product.</p>' : ''}</aside></div><footer class="px-actions"><button type="submit" class="button" ${saving ? 'disabled' : ''}>${saving ? 'Saving…' : exists ? 'Save product' : 'Add product'}</button><button type="button" class="button outline" data-cancel-product ${dirty ? '' : 'disabled'}>Discard changes</button>${
      exists
        ? confirming
          ? `<span class="px-confirm"><span>Delete “${esc(p.title)}” from the catalogue?</span><button type="button" class="button small ix-danger" data-confirm-delete-product>Delete</button><button type="button" class="button outline small" data-keep-product>Keep</button></span>`
          : '<button type="button" class="text-link ix-danger-link px-delete" data-delete-product>Delete product</button>'
        : ''
    }</footer></form>`;
  }
  function clean(p) {
    const { isNew, pdfMode, ...rest } = p;
    return { ...rest, specs: rest.specs.map((s) => s.trim()).filter(Boolean) };
  }

  // ---------- Page preview ----------
  // The public category page in a frame, fed the unsaved list (the edited product merged in).
  function previewProducts() {
    if (!draft) return list.map(clean);
    const edited = clean(draft);
    return list.some((p) => p.id === edited.id)
      ? list.map((p) => (p.id === edited.id ? edited : clean(p)))
      : [...list.map(clean), edited];
  }
  function previewURL() {
    const url = new URL(location.href);
    if (url.pathname.endsWith('/office.html'))
      url.pathname = url.pathname.replace(/office\.html$/, '');
    url.search = '?products-preview=1';
    url.hash = '/divisions/solar/products/' + previewCategory;
    return url.href;
  }
  function sendPreview() {
    clearTimeout(previewTimer);
    if (!frame?.isConnected || !frameReady || panel !== 'page') return;
    previewTimer = setTimeout(() => {
      frame.contentWindow?.postMessage(
        {
          type: 'techouse-products-preview',
          products: previewProducts(),
          category: previewCategory,
          focus: draft && draft.category === previewCategory ? draft.id : '',
        },
        location.origin,
      );
    }, 120);
  }
  window.addEventListener('message', (event) => {
    if (
      frame &&
      event.source === frame.contentWindow &&
      event.origin === location.origin &&
      event.data?.type === 'techouse-products-preview-ready'
    ) {
      frameReady = true;
      sendPreview();
    }
  });
  function pagePane() {
    return `<div class="px-page-tools"><div class="ix-filters" role="group" aria-label="Category to preview">${categories()
      .map(
        ([id, label]) =>
          `<button type="button" data-preview-category="${id}" aria-pressed="false">${esc(label)}</button>`,
      )
      .join('')}</div><div class="ix-filters" role="group" aria-label="Screen size">${[
      ['desktop', 'Computer'],
      ['phone', 'Phone'],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" data-preview-size="${id}" aria-pressed="false">${label}</button>`,
      )
      .join(
        '',
      )}</div></div><p class="px-page-note" role="status" aria-live="polite"></p><div class="px-page-viewport"><iframe title="Preview of the product page"></iframe></div>`;
  }
  function fitFrame(root) {
    const viewport = root.querySelector('.px-page-viewport');
    if (!viewport || !frame) return;
    const width = previewSize === 'phone' ? 390 : 1440;
    const scale = Math.min(1, viewport.clientWidth / width);
    const height = viewport.clientHeight;
    frame.style.width = width + 'px';
    frame.style.height = Math.round(height / scale) + 'px';
    frame.style.transform = `scale(${scale})`;
    frame.style.left = Math.max(0, (viewport.clientWidth - width * scale) / 2) + 'px';
  }
  function syncPagePane(root) {
    const pane = root.querySelector('.px-pane-page');
    pane
      .querySelectorAll('[data-preview-category]')
      .forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.previewCategory === previewCategory)),
      );
    pane
      .querySelectorAll('[data-preview-size]')
      .forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.previewSize === previewSize)),
      );
    const note = pane.querySelector('.px-page-note');
    note.textContent = !draft
      ? 'The published catalogue, as visitors see it. Links on the page are switched off.'
      : draft.category !== previewCategory
        ? `“${draft.title || 'This product'}” is in ${catalogue().labels[draft.category]}. Choose that category to see it.`
        : draft.status === 'draft'
          ? `“${draft.title || 'This product'}” is a draft, so it is not on the page. Set Status to Published to preview it there.`
          : `Includes your unsaved changes to “${draft.title || 'this product'}”, outlined on the page.`;
    if (panel === 'page' && !frame.getAttribute('src')) {
      frameReady = false;
      frame.src = previewURL();
    }
    fitFrame(root);
    sendPreview();
  }

  // ---------- Mount ----------
  function mount() {
    const root = document.querySelector('#office-products');
    if (!root) return;
    reload();
    const hashId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
    if (hashId && list.some((p) => p.id === hashId)) select(hashId);
    else if (selected && !list.some((p) => p.id === selected)) select(null);
    // The layout and the preview frame are built once; draw() refreshes the list and the editor.
    root.innerHTML = `<p class="ix-hint px-builtin">The website shows the built-in Skyworth catalogue. Your first save copies it here, so every product becomes editable.</p><div class="px-layout"><div class="px-list-wrap"></div><div class="px-editor-wrap"><div class="px-panel-tabs" role="tablist" aria-label="Product panel"><button type="button" role="tab" id="px-tab-add" aria-controls="px-pane-edit" data-panel="add">Add product</button><button type="button" role="tab" id="px-tab-edit" aria-controls="px-pane-edit" data-panel="edit">Edit product</button><button type="button" role="tab" id="px-tab-page" aria-controls="px-pane-page" data-panel="page">Page preview</button></div><div class="px-pane-edit" id="px-pane-edit" role="tabpanel"></div><div class="px-pane-page" id="px-pane-page" role="tabpanel" aria-labelledby="px-tab-page">${pagePane()}</div></div></div>`;
    frame = root.querySelector('.px-page-viewport iframe');
    frameReady = false;
    new ResizeObserver(() => fitFrame(root)).observe(root.querySelector('.px-page-viewport'));
    function draw(focus) {
      if (!root.isConnected) return;
      const scroll = root.querySelector('.px-list-wrap')?.scrollTop;
      root.classList.toggle('has-selection', !!draft || panel !== 'edit');
      root.querySelector('.px-builtin').hidden = saved();
      root.querySelector('.px-list-wrap').innerHTML = listView();
      root.querySelector('.px-pane-edit').innerHTML = editorView();
      for (const tab of root.querySelectorAll('.px-panel-tabs [data-panel]')) {
        const active = tab.dataset.panel === panel;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      }
      const formPane = root.querySelector('.px-pane-edit');
      formPane.hidden = panel === 'page';
      formPane.setAttribute('aria-labelledby', panel === 'add' ? 'px-tab-add' : 'px-tab-edit');
      root.querySelector('.px-pane-page').hidden = panel !== 'page';
      syncPagePane(root);
      if (scroll) root.querySelector('.px-list-wrap').scrollTop = scroll;
      if (focus)
        root
          .querySelector(focus)
          ?.focus({ preventScroll: matchMedia('(min-width: 1100px)').matches });
    }
    function readForm(form) {
      const f = form.elements;
      draft.category = f.category.value;
      draft.status = f.status.value;
      draft.title = f.title.value;
      draft.capacity = f.capacity.value;
      draft.subtitle = f.subtitle.value;
      draft.specs = [...form.querySelectorAll('[name="spec"]')].map((input) => input.value);
      draft.websiteModel = f.websiteModel.value;
      draft.imageSource = f.imageSource.value.trim();
      const mode = f.pdfMode.value;
      draft.pdfMode = mode;
      draft.pdf =
        mode === 'none'
          ? ''
          : mode === 'link'
            ? (f.pdfLink?.value.trim() ?? '')
            : (f.pdfSite?.value ?? catalogue().bundledDatasheets()[0]);
    }
    function refreshPreview(form) {
      sendPreview();
      const frame = form.querySelector('.px-preview-frame .catalogue-products');
      frame.innerHTML = catalogue().card({
        ...clean(draft),
        title: draft.title.trim() || 'Product name',
      });
      form.querySelector('.ix-save-state').textContent = dirty ? 'Unsaved changes' : '';
      form.querySelector('[data-cancel-product]').disabled = !dirty;
    }
    async function save(next, success) {
      saving = true;
      try {
        await window.TechouseContent.saveProducts(next.map(clean));
        reload();
        message = success;
        return true;
      } catch (error) {
        message = error.message;
        return false;
      } finally {
        saving = false;
      }
    }
    const leaveDraft = () => !dirty || confirm('Discard the unsaved changes to this product?');
    const focusTab = () => root.querySelector(`.px-panel-tabs [data-panel="${panel}"]`)?.focus();
    root.onclick = async (event) => {
      const tab = event.target.closest('[data-panel]');
      if (tab) {
        setPanel(tab.dataset.panel);
        draw();
        return tab.closest('.px-panel-tabs')
          ? focusTab()
          : root.querySelector('[name="title"]')?.focus();
      }
      const previewCat = event.target.closest('[data-preview-category]');
      if (previewCat) {
        previewCategory = previewCat.dataset.previewCategory;
        return syncPagePane(root);
      }
      const size = event.target.closest('[data-preview-size]');
      if (size) {
        previewSize = size.dataset.previewSize;
        return syncPagePane(root);
      }
      const view = event.target.closest('[data-product-view]');
      if (view) {
        filter = view.dataset.productView;
        return draw();
      }
      const pick = event.target.closest('[data-pick-product]');
      if (pick) {
        setPanel('edit');
        if (pick.dataset.pickProduct === selected && draft) return draw();
        if (!leaveDraft()) return draw();
        select(pick.dataset.pickProduct);
        history.replaceState(null, '', '#/office/products?id=' + encodeURIComponent(selected));
        return draw('#px-editor-title');
      }
      const add = event.target.closest('[data-new-product]');
      if (add) {
        setPanel('add', add.dataset.newProduct || (filter === 'all' ? 'panels' : filter));
        draw('[name="title"]');
        return;
      }
      if (event.target.closest('[data-close-product]')) {
        if (panel === 'add') {
          setPanel('edit');
          select(null);
          history.replaceState(null, '', '#/office/products');
          return draw();
        }
        if (!leaveDraft()) return;
        const id = selected;
        select(null);
        history.replaceState(null, '', '#/office/products');
        draw();
        root.querySelector(`[data-pick-product="${CSS.escape(id || '')}"]`)?.focus();
        return;
      }
      const move = event.target.closest('[data-move-product]');
      if (move) {
        const id = move.dataset.moveProduct;
        const item = list.find((p) => p.id === id);
        const group = list.filter((p) => p.category === item.category);
        const swap = group[group.indexOf(item) + Number(move.dataset.direction)];
        if (!swap) return;
        const next = list.slice();
        const a = next.indexOf(item),
          b = next.indexOf(swap);
        [next[a], next[b]] = [next[b], next[a]];
        list = next;
        draw();
        const ok = await save(next, 'Order saved.');
        if (!ok) reload();
        draw();
        if (!ok) root.querySelector('.ix-save-state')?.focus();
        root
          .querySelector(
            `[data-move-product="${CSS.escape(id)}"][data-direction="${move.dataset.direction}"]:not([disabled])`,
          )
          ?.focus() || root.querySelector(`[data-pick-product="${CSS.escape(id)}"]`)?.focus();
        return;
      }
      const form = event.target.closest('[data-product-form]');
      if (!form) return;
      if (event.target.closest('[data-add-spec]')) {
        readForm(form);
        draft.specs.push('');
        dirty = true;
        draw();
        root.querySelectorAll('[name="spec"]')[draft.specs.length - 1]?.focus();
        return;
      }
      const removeSpec = event.target.closest('[data-remove-spec]');
      if (removeSpec) {
        readForm(form);
        draft.specs.splice(Number(removeSpec.dataset.removeSpec), 1);
        if (!draft.specs.length) draft.specs = [''];
        dirty = true;
        draw();
        root.querySelector('[data-add-spec]')?.focus();
        return;
      }
      if (event.target.closest('[data-clear-image]')) {
        readForm(form);
        draft.image = '';
        dirty = true;
        return draw();
      }
      if (event.target.closest('[data-cancel-product]')) {
        if (panel === 'add') {
          draft = blank(draft.category);
          dirty = false;
          message = '';
        } else select(selected);
        return draw('[name="title"]');
      }
      if (event.target.closest('[data-delete-product]')) {
        confirming = true;
        draw();
        return root.querySelector('[data-keep-product]')?.focus();
      }
      if (event.target.closest('[data-keep-product]')) {
        confirming = false;
        draw();
        return root.querySelector('[data-delete-product]')?.focus();
      }
      if (event.target.closest('[data-confirm-delete-product]')) {
        const title = draft.title;
        if (
          await save(
            list.filter((p) => p.id !== draft.id),
            `Deleted “${title}”.`,
          )
        ) {
          const note = message;
          select(null);
          message = note;
          history.replaceState(null, '', '#/office/products');
          window.showToast?.(note);
        }
        return draw();
      }
    };
    // Tabs: Left and Right arrows move between Add product, Edit product and Page preview.
    root.onkeydown = (event) => {
      const tab = event.target.closest('.px-panel-tabs [data-panel]');
      if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const order = ['add', 'edit', 'page'];
      const at = order.indexOf(panel);
      const next =
        event.key === 'Home'
          ? 'add'
          : event.key === 'End'
            ? 'page'
            : order[(at + (event.key === 'ArrowRight' ? 1 : 2)) % 3];
      setPanel(next);
      draw();
      focusTab();
    };
    root.oninput = (event) => {
      const form = event.target.closest('[data-product-form]');
      if (!form || event.target.matches('[type=file]')) return;
      readForm(form);
      dirty = true;
      message = '';
      refreshPreview(form);
    };
    root.onchange = async (event) => {
      const form = event.target.closest('[data-product-form]');
      if (!form) return;
      if (event.target.matches('[name="pdfMode"], [name="category"], [name="status"]')) {
        readForm(form);
        if (event.target.name === 'category') previewCategory = draft.category;
        if (
          event.target.name === 'pdfMode' &&
          event.target.value === 'site' &&
          !catalogue().bundledDatasheets().includes(draft.pdf)
        )
          draft.pdf = catalogue().bundledDatasheets()[0];
        dirty = true;
        draw();
        root
          .querySelector(
            `[name="${event.target.name}"]${event.target.type === 'radio' ? ':checked' : ''}`,
          )
          ?.focus();
        return;
      }
      if (event.target.matches('[name="imagePick"]') && event.target.value) {
        readForm(form);
        draft.image = event.target.value;
        dirty = true;
        draw();
        return root.querySelector('[name="imagePick"]')?.focus();
      }
      if (event.target.matches('[data-product-image]')) {
        const state = form.querySelector('.ix-save-state');
        state.textContent = 'Preparing image…';
        try {
          readForm(form);
          draft.image = await resize(event.target.files[0]);
          dirty = true;
          message = 'Image added. Save to publish it.';
          draw();
        } catch (error) {
          state.textContent = error.message;
        }
      }
    };
    root.onsubmit = async (event) => {
      const form = event.target.closest('[data-product-form]');
      if (!form) return;
      event.preventDefault();
      readForm(form);
      if (!draft.title.trim()) {
        message = 'Add a product name before saving.';
        draw('[name="title"]');
        return;
      }
      if (draft.pdf && /^https?:/.test(draft.pdf) && !/^https:\/\/\S+$/.test(draft.pdf)) {
        message = 'Datasheet links must start with https://';
        return draw('[name="pdfLink"]');
      }
      if (draft.imageSource && !/^https:\/\/\S+$/.test(draft.imageSource)) {
        message = 'Image source links must start with https://';
        return draw('[name="imageSource"]');
      }
      const product = { ...clean(draft), updatedAt: new Date().toISOString() };
      const exists = list.some((p) => p.id === product.id);
      const next = exists
        ? list.map((p) => (p.id === product.id ? product : p))
        : [...list, product];
      draw();
      const ok = await save(
        next,
        `${exists ? 'Saved' : 'Added'} “${product.title}”${product.status === 'draft' ? ' as a draft' : ''}.`,
      );
      if (ok) {
        const note = message;
        // A new product moves to Edit product; Add product starts a fresh form next time.
        if (panel === 'add') {
          dirty = false;
          setPanel('edit');
          stash.add = null;
        }
        select(product.id);
        message = note;
        history.replaceState(null, '', '#/office/products?id=' + encodeURIComponent(product.id));
      }
      draw('.ix-save-state');
    };
    draw();
  }
  // Leaving the page with unsaved product edits asks first, like the other editors.
  window.addEventListener('beforeunload', (event) => {
    if (anyDirty() && document.querySelector('#office-products')) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.addEventListener(
    'hashchange',
    (event) => {
      if (!anyDirty() || !document.querySelector('#office-products')) return;
      if (confirm('Discard the unsaved product changes?')) {
        dirty = false;
        stash = { add: null, edit: null };
        return;
      }
      event.stopImmediatePropagation();
      history.replaceState(null, '', event.oldURL);
    },
    true,
  );
  return { mount };
})();
