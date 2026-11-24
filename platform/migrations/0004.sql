-- Customer verification codes for inquiries. Additive only: no existing table changes.
-- target, code_hash and token are salted hashes; no phone number, email or code is stored.
-- channel is 'sms' or 'email'; inquiry_id is set once a verified code is used by an inquiry.
CREATE TABLE IF NOT EXISTS verifications (id TEXT PRIMARY KEY, created INTEGER NOT NULL, expires INTEGER NOT NULL, channel TEXT NOT NULL, target TEXT NOT NULL, code_hash TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, verified INTEGER, token TEXT, inquiry_id TEXT);
CREATE INDEX IF NOT EXISTS verifications_token ON verifications(token);
CREATE INDEX IF NOT EXISTS verifications_inquiry ON verifications(inquiry_id);
