/** Local adapter only. Production uses the Worker with D1; no local files are served outside site/. */
import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:http";
import { readFile, mkdir, chmod, writeFile, stat } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import worker from "./worker.mjs";
const here = dirname(fileURLToPath(import.meta.url));
export function d1(db) {
  return {
    prepare(sql) {
      let args = [];
      return {
        bind(...a) {
          args = a;
          return this;
        },
        async first() {
          return db.prepare(sql).get(...args) || null;
        },
        async all() {
          return { results: db.prepare(sql).all(...args) };
        },
        async run() {
          const r = db.prepare(sql).run(...args);
          return { meta: { changes: Number(r.changes) } };
        },
      };
    },
  };
}
export async function createEnvironment(folder = resolve(here, ".data")) {
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await chmod(folder, 0o700);
  const keyPath = resolve(folder, "auth-key");
  let key;
  try {
    key = (await readFile(keyPath, "utf8")).trim();
  } catch (error) {
    // A read/permission failure must never replace the key protecting existing MFA data.
    if (error.code !== "ENOENT") throw error;
    try {
      await stat(resolve(folder, "techouse.sqlite"));
      throw new Error("The local authentication key is missing. Restore its backup before starting.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    key = randomBytes(32).toString("hex");
    try {
      await writeFile(keyPath, key, { mode: 0o600, flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      key = (await readFile(keyPath, "utf8")).trim();
    }
  }
  if (!/^[a-f0-9]{64}$/.test(key))
    throw new Error(
      "The local authentication key is invalid. Restore its backup before starting.",
    );
  await chmod(keyPath, 0o600);
  const db = new DatabaseSync(resolve(folder, "techouse.sqlite"));
  db.exec(await readFile(resolve(here, "migrations/0001.sql"), "utf8"));
  await chmod(resolve(folder, "techouse.sqlite"), 0o600);
  const site = resolve(here, "../site");
  const env = {
    DB: d1(db),
    AUTH_KEY: key,
    APP_ORIGIN: "http://127.0.0.1:8787",
    COOKIE_SECURE: "false",
    ASSETS: {
      async fetch(request) {
        let path;
        try {
          path = decodeURIComponent(new URL(request.url).pathname);
        } catch {
          return new Response("Bad path", { status: 400 });
        }
        if (path === "/") path = "/index.html";
        const file = resolve(site, "." + path);
        if (
          !file.startsWith(site + sep) ||
          path.split("/").some((p) => p.startsWith("."))
        )
          return new Response("Not found", { status: 404 });
        const types = {
          ".html": "text/html; charset=utf-8",
          ".js": "application/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".jpg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".pdf": "application/pdf",
          ".woff2": "font/woff2",
        };
        try {
          return new Response(await readFile(file), {
            headers: {
              "Content-Type":
                types[extname(file)] || "application/octet-stream",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  };
  return { env, db };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { env, db } = await createEnvironment();
  if (!db.prepare("SELECT id FROM content WHERE id=1").get())
    db.prepare("INSERT INTO content(id,body) VALUES(1,?)").run(
      JSON.stringify({
        text: {},
        images: {},
        projects: [],
        posts: [],
        portfolioVersion: 2,
      }),
    );
  const port = Number(process.env.PORT || 8787);
  env.APP_ORIGIN = `http://127.0.0.1:${port}`;
  createServer(async (req, res) => {
    try {
      const bytes = [];
      let size = 0;
      for await (const b of req) {
        size += b.length;
        if (size > 5_000_000) {
          res.writeHead(413);
          res.end();
          return;
        }
        bytes.push(b);
      }
      const request = new Request(env.APP_ORIGIN + req.url, {
        method: req.method,
        headers: req.headers,
        ...(!["GET", "HEAD"].includes(req.method)
          ? { body: Buffer.concat(bytes) }
          : {}),
      });
      const response = await worker.fetch(request, env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Request failed");
    }
  }).listen(port, "127.0.0.1", () =>
    console.log(
      `Techouse base: ${env.APP_ORIGIN} — admin: /admin (run bootstrap first)`,
    ),
  );
}
