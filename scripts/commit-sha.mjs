import { execSync } from "node:child_process";

// Vercel sets this at build time; falls back to the local git HEAD so dev/
// local builds show a real commit instead of a placeholder.
export function commitSha() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "dev";
  }
}
