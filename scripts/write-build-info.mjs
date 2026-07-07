// Writes <app>/public/build-info.json before each build so the running app
// can fetch it fresh (no-store) to learn the commit/version of a waiting
// update, without having to execute the new service worker's JS first.
//
// Invoked from the consuming app's root (e.g. `node brand-kit/scripts/write-build-info.mjs`
// as an npm script), so paths resolve against process.cwd() — the app's own
// root — not this script's own location inside the brand-kit submodule.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { commitSha } from "./commit-sha.mjs";

const commit = commitSha();
const buildInfo = { commit, version: commit.slice(0, 7) };

writeFileSync(
  resolve(process.cwd(), "public/build-info.json"),
  JSON.stringify(buildInfo),
);
