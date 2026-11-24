-- Solar inquiry property pin and roof outline. Additive only: no existing table changes.
-- One optional row per inquiry. lat/lng in degrees (WGS84), accuracy in metres (GPS only),
-- source is 'gps' (the visitor's device at the property) or 'map' (a pin they placed),
-- roof is a JSON array of [lat, lng] corners, roof_area in square metres (computed on the server).
CREATE TABLE IF NOT EXISTS inquiry_sites (inquiry_id TEXT PRIMARY KEY, lat REAL NOT NULL, lng REAL NOT NULL, accuracy REAL, source TEXT NOT NULL DEFAULT 'map', roof TEXT NOT NULL DEFAULT '', roof_area REAL);
