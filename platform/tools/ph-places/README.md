# Philippine places for "Use my location"

`site/assets/data/ph-places.json` lets the solar planner name the visitor's municipality and province from the browser's position, on the device, without sending the position anywhere.

- `municipalities`: `[name, province]` pairs (1,521), named after each municipality's seat.
- `points`: flat `[latitude × 1000, longitude × 1000, municipality index]` triples for 4,372 populated places.

Source: GeoNames populated places with at least 1,000 inhabitants (geonames.org, CC BY 4.0), as packaged by the `all-the-cities` npm package 3.1.0 (MIT). Each place carries its municipality's PSGC code; the first four digits give the province (`PROV` in `build.py`).

Rebuild (Python 3, no dependencies):

```sh
npm pack all-the-cities@3.1.0 && tar -xzf all-the-cities-3.1.0.tgz
python3 platform/tools/ph-places/decode.py package/cities.pbf ph.json
python3 platform/tools/ph-places/build.py ph.json site/assets/data/ph-places.json
```
