#!/usr/bin/env node
/**
 * Copies `routes/app` into the host Next.js `src/app` tree.
 * Run from the repository root: `node cms/sync-routes.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const from = path.join(__dirname, "routes", "app");
const to = path.join(repoRoot, "src", "app");

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(from)) {
  console.error("Missing routes folder:", from);
  process.exit(1);
}

copyRecursive(from, to);
console.log("Synced cms/routes/app -> src/app");
