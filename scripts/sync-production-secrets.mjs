#!/usr/bin/env node
/**
 * Sync secrets from apps/api/.dev.vars to Cloudflare Workers (production).
 * Usage: node scripts/sync-production-secrets.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const devVarsPath = join(root, "apps/api/.dev.vars");
const apiDir = join(root, "apps/api");

const SECRET_KEYS = ["ANTHROPIC_API_KEY", "DATABASE_URL", "CLERK_SECRET_KEY"];

function parseDevVars(content) {
  const values = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    values[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return values;
}

const vars = parseDevVars(readFileSync(devVarsPath, "utf8"));

for (const key of SECRET_KEYS) {
  const value = vars[key];
  if (!value) {
    console.error(`Missing ${key} in apps/api/.dev.vars`);
    process.exit(1);
  }

  console.log(`Setting secret ${key}...`);
  execFileSync(
    "node",
    [
      join(apiDir, "node_modules/wrangler/bin/wrangler.js"),
      "secret",
      "put",
      key,
      "--env",
      "production",
    ],
    {
      cwd: apiDir,
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
    }
  );
}

console.log("Production secrets synced.");
