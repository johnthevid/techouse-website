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
  artwork['elevator'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M7,18h3V14h1V11.5q0-0.83-0.59-1.41T9,9.5H8q-0.82,0-1.41,0.59Q6,10.68 6,11.5V14H7v4ZM9.39,8.14Q9.75,7.77 9.75,7.25q0-0.53-0.36-0.89T8.5,6T7.61,6.36Q7.25,6.72 7.25,7.25q0,0.52 0.36,0.89T8.5,8.5q0.53,0 0.89-0.36ZM13,11h5L15.5,7L13,11Zm2.5,6L18,13H13l2.5,4ZM5,21q-0.83,0-1.41-0.59T3,19V5Q3,4.17 3.59,3.59T5,3H19q0.83,0 1.41,0.59T21,5V19q0,0.82-0.59,1.41T19,21H5Zm0-2H19V5H5V19Zm0,0V5V19Z"/></g>';
  artwork['real_estate_agent'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M19,14V7.5L14,4L9,7.5V9H7V6.5l7-5l7,5V14H19ZM14,4Zm0.5,4h1V7h-1V8Zm-2,0h1V7h-1V8Zm2,2h1V9h-1v1Zm-2,0h1V9h-1v1ZM7,18.5l6.95,1.9l5.95-1.85q-0.13-0.23-0.36-0.39T19,18H13.95q-0.68,0-1.08-0.05t-0.82-0.2L9.73,16.98l0.55-1.95L12.3,15.7q0.43,0.13 1,0.2T15,16q0-0.28-0.16-0.53t-0.39-0.32L8.6,13H7v5.5ZM1,22V11H8.6q0.18,0 0.35,0.04t0.32,0.09l5.88,2.17q0.83,0.3 1.34,1.05T17,16h2q1.25,0 2.13,0.82T22,19v1l-8,2.5L7,20.55V22H1Zm2-2H5V13H3v7Z"/></g>';
  artwork['shapes'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M15,15ZM8,17.95q0.25,0.03 0.49,0.04T9,18t0.51-0.01T10,17.95V20H20V10H17.95q0.03-0.25 0.04-0.49T18,9T17.99,8.49T17.95,8H20q0.83,0 1.41,0.59T22,10V20q0,0.82-0.59,1.41T20,22H10q-0.82,0-1.41-0.59T8,20V17.95ZM4.04,13.96Q2,11.93 2,9Q2,6.07 4.04,4.04T9,2t4.96,2.04T16,9t-2.04,4.96T9,16q-2.93,0-4.96-2.04Zm8.5-1.42Q14,11.08 14,9T12.54,5.46T9,4Q6.93,4 5.46,5.46Q4,6.93 4,9t1.46,3.54T9,14t3.54-1.46ZM9,9Z"/></g>';
  artwork['solar_power'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M2,22L4,12H20l2,10H2ZM3,4V2H6V4H3ZM4.45,20H11V18H4.85l-0.4,2ZM6.13,9.32L4.7,7.93L6.83,5.8L8.25,7.2L6.13,9.32ZM5.25,16H11V14H5.65l-0.4,2ZM8.46,5.54Q7,4.07 7,2H9Q9,3.25 9.88,4.13T12,5t2.13-0.88T15,2h2q0,2.07-1.46,3.54T12,7Q9.93,7 8.46,5.54ZM12,2Zm-1,9V8h2v3H11Zm2,9h6.55l-0.4-2H13v2Zm0-4h5.75l-0.4-2H13v2Zm4.88-6.68L15.78,7.2l1.4-1.4L19.3,7.9L17.88,9.32ZM18,4V2h3V4H18Z"/></g>';
  artwork['construction'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M18.9,21l-5.48-5.48l2.1-2.1L21,18.9L18.9,21ZM5.1,21L3,18.9L9.9,12L8.2,10.3L7.5,11L6.23,9.73v2.05l-0.7,0.7L2.5,9.45l0.7-0.7H5.25L4,7.5L7.55,3.95q0.5-0.5 1.07-0.73T9.8,3t1.18,0.22t1.07,0.73l-2.3,2.3L11,7.5L10.3,8.2L12,9.9l2.25-2.25q-0.1-0.27-0.16-0.57t-0.06-0.6q0-1.47 1.01-2.49t2.49-1.01q0.38,0 0.71,0.07q0.34,0.08 0.69,0.23L16.45,5.75l1.8,1.8l2.48-2.48q0.18,0.35 0.24,0.69t0.06,0.71q0,1.48-1.01,2.49Q19,9.98 17.53,9.98q-0.3,0-0.6-0.05q-0.3-0.05-0.57-0.17L5.1,21Z"/></g>';
  artwork['factory'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M2,22V9.98L9,7V9l5-2v3h8V22H2Zm2-2H20V12H12V9.95l-5,2V10L4,11.33V20Zm7-2h2V14H11v4ZM7,18H9V14H7v4Zm8,0h2V14H15v4Zm7-8H17l1-8h3l1,8ZM4,20H7h5h8H4Z"/></g>';
  artwork['handshake'] =
    '<g transform="translate(0 -960) scale(40)"><path d="M11.88,20q0.1,0 0.2-0.05t0.15-0.1l8.2-8.2q0.3-0.3 0.44-0.67T21,10.23q0-0.4-0.14-0.76T20.43,8.82L16.18,4.57q-0.28-0.3-0.64-0.44T14.78,4Q14.4,4 14.03,4.14T13.35,4.57L13.08,4.85l1.85,1.88q0.38,0.35 0.55,0.8t0.17,0.95q0,1.05-0.71,1.76t-1.76,0.71q-0.5,0-0.96-0.18T11.4,10.25L9.53,8.4L5.15,12.77q-0.08,0.08-0.11,0.16Q5,13.02 5,13.13q0,0.2 0.15,0.36T5.5,13.65q0.1,0 0.2-0.05t0.15-0.1l3.4-3.4l1.4,1.4L7.28,14.9Q7.2,14.98 7.16,15.06T7.13,15.25q0,0.2 0.15,0.35t0.35,0.15q0.1,0 0.2-0.05t0.15-0.1l3.4-3.38l1.4,1.4L9.4,17.02q-0.07,0.05-0.11,0.15q-0.04,0.1-0.04,0.2q0,0.2 0.15,0.35t0.35,0.15q0.1,0 0.19-0.04q0.09-0.04 0.16-0.11l3.4-3.38l1.4,1.4l-3.4,3.4q-0.07,0.08-0.11,0.16T11.35,19.5q0,0.2 0.16,0.35T11.88,20Zm-0.02,2q-0.93,0-1.64-0.61T9.38,19.85q-0.85-0.13-1.42-0.7q-0.58-0.57-0.7-1.42Q6.4,17.6 5.84,17.01Q5.28,16.43 5.15,15.6Q4.2,15.48 3.6,14.78T3,13.13q0-0.5 0.19-0.96t0.54-0.81l5.8-5.78L12.8,8.85q0.05,0.07 0.15,0.11T13.15,9q0.22,0 0.38-0.14q0.15-0.14 0.15-0.36q0-0.1-0.04-0.2T13.53,8.15L9.95,4.57Q9.68,4.27 9.31,4.14T8.55,4Q8.18,4 7.8,4.14T7.13,4.57L3.6,8.13Q3.38,8.35 3.23,8.65t-0.2,0.6t0,0.61t0.2,0.59L1.78,11.9q-0.43-0.57-0.63-1.26T1,9.25T1.35,7.89Q1.65,7.22 2.18,6.7L5.7,3.17Q6.3,2.6 7.04,2.3T8.55,2t1.51,0.3t1.31,0.88l0.28,0.28l0.28-0.28q0.6-0.57 1.34-0.88T14.78,2t1.51,0.3T17.6,3.17L21.83,7.4Q22.4,7.97 22.7,8.73T23,10.25q0,0.77-0.3,1.51t-0.88,1.31l-8.2,8.18q-0.35,0.35-0.81,0.55T11.85,22ZM9.38,8Z"/></g>';
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
