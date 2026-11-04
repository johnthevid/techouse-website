/**
 * Shared Material Symbols icon renderer. Uses inline artwork from the self-hosted Material SVG collection.
 * Add official symbols to assets/icons/material-symbols.svg, then copy their path artwork into the map below.
 * Decorative icons are hidden from assistive technology; icon-only controls need aria-label.
 */
window.TechouseIcons = (() => {
  // Inline paths also work when the prototype is opened directly with file://.
  const artwork = {
    arrow_outward: '<path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z"></path>',
    arrow_forward:
      '<path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"></path>',
    arrow_back:
      '<path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"></path>',
    arrow_downward:
      '<path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"></path>',
    arrow_upward:
      '<path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"></path>',
    close:
      '<path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path>',
    check: '<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"></path>',
    add: '<path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path>',
    remove: '<path d="M200-440v-80h560v80H200Z"></path>',
    menu: '<path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"></path>',
    call: '<path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"></path>',
    dashboard:
      '<path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"></path>',
    skip_next:
      '<path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"></path>',
    solar_power:
      '<path d="m80-80 80-400h640l80 400H80Zm40-720v-80h120v80H120Zm58 640h262v-80H194l-16 80Zm67-427-57-56 85-85 57 56-85 85Zm-35 267h230v-80H226l-16 80Zm270-360q-83 0-141.5-58.5T280-880h80q0 50 35 85t85 35q50 0 85-35t35-85h80q0 83-58.5 141.5T480-680Zm0-200Zm-40 360v-120h80v120h-80Zm80 360h262l-16-80H520v80Zm0-160h230l-16-80H520v80Zm195-267-84-85 56-56 85 84-57 57Zm5-213v-80h120v80H720Z"></path>',
    construction:
      '<path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"></path>',
    home_work:
      '<path d="M680-600h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160v-80h160v-560H480v56l-80-58v-78h520v720H680Zm-640 0v-400l280-200 280 200v400H360v-200h-80v200H40Zm80-80h80v-200h240v200h80v-280L320-622 120-480v280Zm560-360ZM440-200v-200H200v200-200h240v200Z"></path>',
    real_estate_agent:
      '<path d="M760-400v-260L560-800 360-660v60h-80v-100l280-200 280 200v300h-80ZM560-800Zm20 160h40v-40h-40v40Zm-80 0h40v-40h-40v40Zm80 80h40v-40h-40v40Zm-80 0h40v-40h-40v40ZM280-220l278 76 238-74q-5-9-14.5-15.5T760-240H558q-27 0-43-2t-33-8l-93-31 22-78 81 27q17 5 40 8t68 4q0-11-6.5-21T578-354l-234-86h-64v220ZM40-80v-440h304q7 0 14 1.5t13 3.5l235 87q33 12 53.5 42t20.5 66h80q50 0 85 33t35 87v40L560-60l-280-78v58H40Zm80-80h80v-280h-80v280Z"></path>',
    elevator:
      '<path d="M280-240h120v-160h40v-100q0-33-23.5-56.5T360-580h-40q-33 0-56.5 23.5T240-500v100h40v160Zm60-380q21 0 35.5-14.5T390-670q0-21-14.5-35.5T340-720q-21 0-35.5 14.5T290-670q0 21 14.5 35.5T340-620Zm180 100h200L620-680 520-520Zm100 240 100-160H520l100 160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z"></path>',
    ac_unit:
      '<path d="M440-80v-166L310-118l-56-56 186-186v-80h-80L174-254l-56-56 128-130H80v-80h166L118-650l56-56 186 186h80v-80L254-786l56-56 130 128v-166h80v166l130-128 56 56-186 186v80h80l186-186 56 56-128 130h166v80H714l128 130-56 56-186-186h-80v80l186 186-56 56-130-128v166h-80Z"></path>',
    electric_car:
      '<path d="M240-360v40q0 17-11.5 28.5T200-280h-40q-17 0-28.5-11.5T120-320v-320l84-240q6-18 21.5-29t34.5-11h440q19 0 34.5 11t21.5 29l84 240v320q0 17-11.5 28.5T800-280h-40q-17 0-28.5-11.5T720-320v-40H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-540q0-25-17.5-42.5T300-600q-25 0-42.5 17.5T240-540q0 25 17.5 42.5T300-480Zm360 0q25 0 42.5-17.5T720-540q0-25-17.5-42.5T660-600q-25 0-42.5 17.5T600-540q0 25 17.5 42.5T660-480ZM520-40 280-160h160v-80l240 120H520v80ZM200-440h560v-200H200v200Z"></path>',
    info: '<path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path>',
    expand_more: '<path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"></path>',
  };
  function icon(name, extraClass = '') {
    if (!Object.hasOwn(artwork, name)) throw new Error('Unregistered Material Symbol: ' + name);
    // Preserve the original Material coordinate system; no external SVG request is needed.
    return `<svg class="material-icon ${extraClass}" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">${artwork[name]}</svg>`;
  }
  // Compatibility adapter for existing copy templates. New templates can call icon() directly.
  const glyphs = {
    '↗': 'arrow_outward',
    '↘': 'arrow_downward',
    '←': 'arrow_back',
    '→': 'arrow_forward',
    '↓': 'arrow_downward',
    '↑': 'arrow_upward',
    '✓': 'check',
    '×': 'close',
    '▸│': 'skip_next',
  };
  const pattern = /▸│|[↗↘←→↓↑✓×]/g;
  function enhance(root) {
    if (!(root instanceof Element) || root.closest('svg,textarea,input,script,style')) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const text = walker.currentNode,
        parent = text.parentElement;
      if (
        parent?.closest('a,button,.success-icon,.banner-rest-hint,.back-to-top') &&
        !parent.closest('svg,textarea,script,style') &&
        /▸│|[↗↘←→↓↑✓×]/.test(text.data)
      )
        nodes.push(text);
    }
    for (const text of nodes) {
      const fragment = document.createDocumentFragment();
      let start = 0;
      pattern.lastIndex = 0;
      for (const match of text.data.matchAll(pattern)) {
        fragment.append(document.createTextNode(text.data.slice(start, match.index)));
        const template = document.createElement('template');
        template.innerHTML = icon(glyphs[match[0]]);
        fragment.append(template.content);
        start = match.index + match[0].length;
      }
      fragment.append(document.createTextNode(text.data.slice(start)));
      text.replaceWith(fragment);
    }
  }
  const observer = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) {
        if (node instanceof Element) enhance(node);
        else if (node.nodeType === Node.TEXT_NODE && node.parentElement)
          enhance(node.parentElement);
      }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return { icon, enhance };
})();
