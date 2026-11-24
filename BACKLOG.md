# Feature backlog

Features the client has asked for that are not built yet. Move an item to HANDOFF.md and CHANGELOG.md when work starts or ships.

## Queued

### Edit solar products from the back office

- **Asked:** initial approval meeting, 24 Nov 2026.
- **Today:** the Skyworth panels, inverters and batteries (names, specifications, photos and datasheets) are written into `site/catalogue.js`. Changing a product needs a code change and a deployment.
- **Wanted:** staff add, edit, hide and reorder products in the back office, and the solar product pages read them from the shared content.
- **Likely scope:**
  - A Products tab in the back office (like Project stories): category (panels, inverters, batteries), model name, short description, specification rows, photo upload, datasheet link or PDF upload, published/hidden, order.
  - Store products in the shared content (`platform/worker.mjs` content validation, with limits on text, specification rows and image size), seeded from the current `catalogue.js` list so nothing disappears on first save.
  - `catalogue.js` renders from the shared content and falls back to its built-in list.
  - Check what the Solar Calculator reads from the catalogue (panel wattage, inverter and battery sizes) before letting staff change those values; the calculator's sizing and price lists come from the sales workbook and may need to stay fixed or be edited separately.
  - Tests for validation, the editor and the public pages.
- **To confirm with Techouse:** who edits products, whether prices are ever shown, and whether datasheets are uploaded files or links to Skyworth.
