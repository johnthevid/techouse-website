-- Optional inquiry answers that only some divisions ask for. Additive only: no existing table changes.
-- One row per inquiry; data is a JSON object validated on the server (insights.mjs parseDetails):
-- solar {roofType}; elevators {service, building, floors, capacity, item, doors, brand, part}.
CREATE TABLE IF NOT EXISTS inquiry_details (inquiry_id TEXT PRIMARY KEY, data TEXT NOT NULL);
