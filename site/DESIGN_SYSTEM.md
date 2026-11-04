# Techouse design direction

## Primary reference

Use [Material Design 3 components](https://m3.material.io/components) as the main reference for component behavior, states, and hierarchy. Use [Material Symbols](https://developers.google.com/fonts/docs/material_symbols) for standard interface icons.

**Techouse adaptation: cards and action buttons keep sharp, square corners.** Do not automatically adopt rounded Material containers or pill buttons. Preserve the photographic banners, typography, colours, and approved motion behavior.

## Icon system

`icons.js` exposes a shared renderer:

```js
window.TechouseIcons.icon('arrow_outward');
window.TechouseIcons.icon('call');
```

It returns an SVG string suitable for an existing HTML template. The SVG embeds local path artwork directly so icons also work in `file://` previews. The original collection remains in `assets/icons/material-symbols.svg`; no runtime icon-font service is required.

The outlined icons use `currentColor` and a default 22px size. Their CSS is in `design-system.css`. Icons accompany visible action labels; icon-only controls must have a meaningful `aria-label`. The renderer hides decorative SVGs from assistive technology.

The module also translates legacy arrow/check/close characters in interactive labels into Material SVGs. This compatibility adapter handles dynamic buttons without changing their text-only source values. For new UI, prefer the renderer directly. Keep instructional illustrations separate from navigation icons.

| Purpose | Symbol |
|---|---|
| Explore / open | `arrow_outward` |
| Next / back | `arrow_forward`, `arrow_back` |
| Scroll down / back to top | `arrow_downward`, `arrow_upward` |
| Call / staff area / menu | `call`, `dashboard`, `menu` |
| Confirm / close / skip | `check`, `close`, `skip_next` |
| Add / remove / expand / information | `add`, `remove`, `expand_more`, `info` |
| Solar / construction / prefab / property / elevators | `solar_power`, `construction`, `home_work`, `real_estate_agent`, `elevator` |
| Energy examples | `ac_unit`, `electric_car` |

## Shape and states

`design-system.css` loads last. Its corner variables are:

```css
--corner-card: 0px;
--corner-action: 0px;
```

Cards, action buttons, dialogs, form fields, and selection tiles use square corners. The homepage About Us scroll cue keeps its rounded pill shape. Small progress indicators, radio controls, loading dots, and the brand artwork are exceptions because their shape communicates their role.

Preserve visible keyboard focus, clear selected/disabled states, descriptive labels, and reduced-motion handling. Material is the reference, not an additional framework dependency.

## Adding icons

1. Choose a symbol from the official Material Symbols collection, using the outlined style consistently.
2. Add the official SVG paths as a named symbol in the local sprite, preserving its viewBox.
3. Copy the symbol’s path artwork into the `artwork` map in `icons.js`.
4. Use the shared renderer and inspect light/dark backgrounds, keyboard labels, and mobile layout.
5. Keep the icon license with the assets.

Icon source: Google’s [material-design-icons repository](https://github.com/google/material-design-icons), `symbols/web/<name>/materialsymbolsoutlined/<name>_24px.svg`.

The selected icons are distributed under Apache License 2.0. See `assets/icons/LICENSE.txt`. This project uses selected symbols, not the entire icon library.
