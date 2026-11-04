/** One-time operator provisioning. No public registration or default password. */
import { createEnvironment } from "./local.mjs";
import { passwordHash } from "./worker.mjs";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const email = (process.argv[2] || "").toLowerCase().trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw Error(
    "Supply the admin email as the first argument. Password is read from stdin.",
  );
let password = "";
if (process.stdin.isTTY) {
  process.stdout.write("New password (16+ characters): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  password = await new Promise((resolve) => {
    process.stdin.on("data", (b) => {
      for (const c of b.toString()) {
        if (c === "\u0003") process.exit(1);
        if (c === "\r" || c === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(password);
          return;
        }
        if (c === "\u007f") password = password.slice(0, -1);
        else password += c;
      }
    });
  });
} else {
  for await (const b of process.stdin) password += b;
  password = password.trimEnd();
}
if (password.length < 16 || password.length > 256)
  throw Error("Use 16–256 characters.");
const { db } = await createEnvironment();
if (db.prepare("SELECT email FROM users WHERE email=?").get(email))
  throw Error("Account exists. Provisioning will not overwrite it.");
db.prepare("INSERT INTO users(email,password) VALUES(?,?)").run(
  email,
  await passwordHash(password),
);
if (!db.prepare("SELECT id FROM content WHERE id=1").get()) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(
    await readFile(
      new URL("../site/portfolio-data.js", import.meta.url),
      "utf8",
    ),
    context,
  );
  db.prepare("INSERT INTO content(id,body) VALUES(1,?)").run(
    JSON.stringify({
      text: {},
      images: {},
      projects: context.window.TechousePortfolioSamples,
      posts: [],
      portfolioVersion: 2,
    }),
  );
}
console.log(
  "Admin created locally. Sign in at /admin and enroll your authenticator. No password was printed or stored in plaintext.",
);
db.close();
