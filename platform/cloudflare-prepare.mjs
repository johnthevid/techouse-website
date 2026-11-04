/** Generate fresh production provisioning artifacts privately. Never reuses the development key.
 * This does not connect to Cloudflare, buy services, or deploy anything.
 */
import { mkdir, writeFile, access, chmod } from "node:fs/promises";
import { randomBytes, createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const [originValue, emailValue] = process.argv.slice(2);
let origin;
try {
  const url = new URL(originValue);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error();
  origin = url.origin;
} catch {
  throw Error(
    "Supply the exact HTTPS site origin, without a path, followed by the administrator email.",
  );
}
const email = (emailValue || "").toLowerCase().trim();
if (
  !/^[a-z0-9.!#$%&*+/=?^_`{|}~@-]+$/.test(email) ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
)
  throw Error("Supply a valid administrator email.");
const folder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".data/cloudflare",
);
await mkdir(folder, { recursive: true, mode: 0o700 });
await chmod(folder, 0o700);
const keyPath = resolve(folder, "AUTH_KEY");
let exists = false;
try {
  await access(keyPath);
  exists = true;
} catch {}
if (!exists)
  await writeFile(keyPath, randomBytes(32).toString("hex"), {
    mode: 0o600,
    flag: "wx",
  });
const token = randomBytes(32).toString("hex"),
  digest = createHash("sha256").update(token).digest("hex"),
  expires = Date.now() + 30 * 60000;
// Only the hash goes to D1. The raw token stays in the private URL file, not command history.
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const sql = `INSERT INTO invitations(token,email,expires) VALUES(${literal(digest)},${literal(email)},${expires}) ON CONFLICT(email) DO UPDATE SET token=excluded.token,expires=excluded.expires;\n`;
await writeFile(resolve(folder, "invite.sql"), sql, { mode: 0o600 });
await writeFile(
  resolve(folder, "setup.url"),
  origin + "/admin#setup=" + token,
  { mode: 0o600 },
);
console.log(
  "Private Cloudflare artifacts prepared in platform/.data/cloudflare/.",
);
console.log(
  "AUTH_KEY is created only once. Back it up securely; do not replace it after MFA enrollment.",
);
console.log(
  "Import invite.sql only into the intended database, then open setup.url privately within 30 minutes.",
);
console.log("No Cloudflare services were changed or deployed.");
