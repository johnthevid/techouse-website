/** Create a short-lived invitation locally. Its URL is written privately, never to public site assets. */
import { createEnvironment } from "./local.mjs";
import { randomBytes, createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const email = (process.argv[2] || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw Error("Supply the admin email.");
const { db } = await createEnvironment();
if (db.prepare("SELECT email FROM users WHERE email=?").get(email))
  throw Error("Account already exists.");
const token = randomBytes(32).toString("hex");
db.prepare(
  "INSERT INTO invitations(token,email,expires) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET token=excluded.token,expires=excluded.expires",
).run(
  createHash("sha256").update(token).digest("hex"),
  email,
  Date.now() + 30 * 60000,
);
await writeFile(
  new URL("./.data/setup.url", import.meta.url),
  `http://127.0.0.1:8787/admin#setup=${token}`,
  { mode: 0o600 },
);
db.close();
console.log(
  "Private setup link saved in platform/.data/setup.url (expires in 30 minutes).",
);
