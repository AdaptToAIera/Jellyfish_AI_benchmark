import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url);
const text = file => readFile(new URL(file, root), "utf8");

const files = new Map();
const add = async (route, file, type) => {
  files.set(route, { body: await text(file), type });
};

await add("/index.html", "index.html", "text/html; charset=utf-8");
await add("/gallery.html", "gallery.html", "text/html; charset=utf-8");
await add("/compare.html", "compare.html", "text/html; charset=utf-8");
await add("/viewer.html", "viewer.html", "text/html; charset=utf-8");
await add("/styles.css", "styles.css", "text/css; charset=utf-8");
await add("/preferences.js", "preferences.js", "text/javascript; charset=utf-8");
await add("/data/models-data.js", "data/models-data.js", "text/javascript; charset=utf-8");
await add("/app.js", "app.js", "text/javascript; charset=utf-8");
await add("/explore.js", "explore.js", "text/javascript; charset=utf-8");
await add("/data/models.json", "data/models.json", "application/json; charset=utf-8");
await add("/README.md", "README.md", "text/markdown; charset=utf-8");

const removedModelFiles = new Set(["thinkingcap.html", "unsloth_q8_mtp.html"]);
for (const entry of await readdir(new URL("models", root))) {
  if (entry.endsWith(".html") && !removedModelFiles.has(entry)) {
    await add(`/models/${entry}`, `models/${entry}`, "text/html; charset=utf-8");
  }
}

const allowedModelIds = JSON.parse(files.get("/data/models.json").body).models.map(model => model.id);
const assetEntries = JSON.stringify(Object.fromEntries(files), null, 2);
const allowedEntries = JSON.stringify(allowedModelIds);

const worker = `const ASSETS = ${assetEntries};
const ALLOWED_MODEL_IDS = new Set(${allowedEntries});

function json(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {})
    }
  });
}

function userId(request) {
  return request.headers.get("oai-authenticated-user-id") || "";
}

async function voteTotals(env, currentUserId = "") {
  if (!env.DB) return { totals: {}, userVote: null, authenticated: Boolean(currentUserId), unavailable: true };
  const totalsResult = await env.DB.prepare("SELECT model_id, COUNT(*) AS total FROM votes GROUP BY model_id").all();
  const totals = {};
  for (const row of totalsResult.results || []) totals[row.model_id] = Number(row.total || 0);
  let userVote = null;
  if (currentUserId) {
    const own = await env.DB.prepare("SELECT model_id FROM votes WHERE user_id = ?").bind(currentUserId).first();
    userVote = own?.model_id || null;
  }
  return { totals, userVote, authenticated: Boolean(currentUserId) };
}

async function handleApi(request, env, pathname) {
  const currentUserId = userId(request);
  if (pathname === "/api/votes" && request.method === "GET") {
    return json(await voteTotals(env, currentUserId));
  }
  if (pathname === "/api/vote" && request.method === "POST") {
    if (!currentUserId) return json({ error: "Sign-in is required to vote." }, { status: 401 });
    if (!env.DB) return json({ error: "Voting database is unavailable." }, { status: 503 });
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const modelId = String(body?.modelId || "");
    if (!ALLOWED_MODEL_IDS.has(modelId)) return json({ error: "Unknown model." }, { status: 400 });
    await env.DB.prepare(
      "INSERT INTO votes (user_id, model_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now')) ON CONFLICT(user_id) DO UPDATE SET model_id = excluded.model_id, updated_at = datetime('now')"
    ).bind(currentUserId, modelId).run();
    return json(await voteTotals(env, currentUserId));
  }
  return json({ error: "Not found" }, { status: 404 });
}

function assetResponse(pathname) {
  const asset = ASSETS[pathname] || (pathname === "/" ? ASSETS["/index.html"] : null);
  if (!asset) return null;
  const isHtml = asset.type.startsWith("text/html");
  return new Response(asset.body, {
    headers: {
      "content-type": asset.type,
      "cache-control": isHtml ? "no-store" : "public, max-age=300"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url.pathname);
    const response = assetResponse(url.pathname);
    if (response) return response;
    return assetResponse("/index.html");
  }
};
`;

await rm(new URL("dist", root), { recursive: true, force: true });
await mkdir(new URL("dist/server", root), { recursive: true });
await mkdir(new URL("dist/.openai", root), { recursive: true });
await writeFile(new URL("dist/server/index.js", root), worker);
await writeFile(new URL("dist/.openai/hosting.json", root), await text(".openai/hosting.json"));
