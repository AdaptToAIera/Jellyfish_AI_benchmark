import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = await readFile(resolve(root, "dist/server/index.js"), "utf8");
JSON.parse(await readFile(resolve(root, "dist/.openai/hosting.json"), "utf8"));

const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const worker = await import(moduleUrl);
assert.equal(typeof worker.default?.fetch, "function");

const home = await worker.default.fetch(new Request("https://example.test/"), {});
assert.equal(home.status, 200);
assert.match(await home.text(), /Local models are no longer/);

const votes = await worker.default.fetch(new Request("https://example.test/api/votes"), {});
assert.equal(votes.status, 200);
assert.equal((await votes.json()).unavailable, true);

console.log("Worker artifact is valid.");
