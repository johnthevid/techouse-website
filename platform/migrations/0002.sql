CREATE TABLE IF NOT EXISTS inquiry_otp (
  email_key TEXT PRIMARY KEY,
  challenge TEXT NOT NULL,
  digest TEXT NOT NULL,
  expires INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS inquiry_otp_expires ON inquiry_otp(expires);
