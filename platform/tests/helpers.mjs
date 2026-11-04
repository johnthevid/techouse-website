import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createEnvironment } from "../local.mjs";
import worker, { passwordHash, totp } from "../worker.mjs";
export const credentials = {
  email: "admin@example.test",
  password: "Test-only password with 32 chars!",
};
export async function fixture(t) {
  const folder = await mkdtemp(join(tmpdir(), "techouse-test-"));
  const { env, db } = await createEnvironment(folder);
  t.after(async () => {
    db.close();
    await rm(folder, { recursive: true, force: true });
  });
  db.prepare("INSERT INTO users(email,password) VALUES(?,?)").run(
    credentials.email,
    await passwordHash(credentials.password),
  );
  let cookie = "",
    csrf = "";
  async function request(path, method = "GET", data, options = {}) {
    const headers = {
      ...(method !== "GET"
        ? { Origin: env.APP_ORIGIN, "Content-Type": "application/json" }
        : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...options.headers,
    };
    const response = await worker.fetch(
      new Request(env.APP_ORIGIN + path, {
        method,
        headers,
        ...(data !== undefined
          ? { body: typeof data === "string" ? data : JSON.stringify(data) }
          : {}),
      }),
      env,
    );
    const set = response.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    let value;
    try {
      value = await response.clone().json();
    } catch {
      value = await response.clone().text();
    }
    if (value.csrf) csrf = value.csrf;
    return { response, status: response.status, value };
  }
  async function login() {
    const first = await request("/api/auth/login", "POST", credentials);
    const secret = first.value.secret;
    const code = await totp(secret, Math.floor(Date.now() / 30000));
    const second = await request("/api/auth/verify", "POST", { code });
    return { first, second, secret };
  }
  return {
    env,
    db,
    request,
    login,
    getCookie: () => cookie,
    getCsrf: () => csrf,
  };
}
export const content = (title = "Sample") => ({
  text: { "#landing-title": title },
  images: {},
  projects: [
    {
      id: "project-1",
      title,
      sector: "residential",
      status: "published",
      sample: true,
      image: "assets/solar.jpg",
      gallery: [],
    },
    {
      id: "draft-1",
      title: "Private draft",
      sector: "industrial",
      status: "draft",
      image: "",
      gallery: [],
    },
  ],
  posts: [
    {
      id: "post-1",
      title: "Update",
      body: "Plain text",
      summary: "Intro",
      status: "published",
      cover: "",
    },
    { id: "post-draft", title: "Secret post", body: "Hidden", status: "draft" },
  ],
});
