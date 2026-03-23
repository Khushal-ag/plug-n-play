#!/usr/bin/env node
/**
 * One-shot installer: wire the CMS from the `cms/` folder into a host project.
 *
 * By default the CMS **stays** under `cms/` (module code is not copied into `src/`).
 * Only App Router route templates are copied into `src/app/`.
 *
 * Usage (from your project root, with `cms/` next to package.json):
 *   node cms/install.mjs
 *
 * Options:
 *   --dry-run          Print actions only
 *   --skip-install     Do not run bun/npm to add dependencies
 *   --no-public-routes Skip copying root page, [...slug], and sitemap (admin only)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipInstall = args.has("--skip-install");
const noPublicRoutes = args.has("--no-public-routes");

/** Host project root = parent of this bundle folder */
const projectRoot = path.resolve(__dirname, "..");

const moduleSrc = path.join(__dirname, "module");
const routesApp = path.join(__dirname, "routes", "app");
const destApp = path.join(projectRoot, "src", "app");

function log(...a) {
  console.log("[cms]", ...a);
}

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

function mergeTsconfigPaths() {
  const tsconfigPath = path.join(projectRoot, "tsconfig.json");
  const target = "./cms/module/*";
  if (!fs.existsSync(tsconfigPath)) {
    log("No tsconfig.json found — add paths manually:", {
      "@cms/*": [target],
    });
    return;
  }
  let raw = fs.readFileSync(tsconfigPath, "utf8");
  if (raw.includes('"@cms/*"')) {
    log("tsconfig.json already has @cms/* path");
    return;
  }
  const next = raw.replace(
    /"paths"\s*:\s*\{/,
    `"paths": {\n      "@cms/*": ["${target}"],`,
  );
  if (next === raw) {
    log("Could not auto-patch tsconfig paths — add @cms/* manually.");
    return;
  }
  if (!dryRun) fs.writeFileSync(tsconfigPath, next, "utf8");
  log(`Patched tsconfig.json: @cms/* -> ${target}`);
}

function writeDrizzleConfig() {
  const target = path.join(projectRoot, "drizzle.config.ts");
  const schema = "./cms/module/database/schema.ts";
  if (fs.existsSync(target)) {
    log(
      `drizzle.config.ts already exists — ensure schema points to ${schema}`,
    );
    return;
  }
  const body = `import path from "node:path";

import { defineConfig } from "drizzle-kit";

const dbFile = process.env.CMS_DB_PATH ?? "./data/cms.sqlite";

export default defineConfig({
  schema: "${schema}",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: path.resolve(process.cwd(), dbFile),
  },
});
`;
  if (!dryRun) fs.writeFileSync(target, body, "utf8");
  log("Created drizzle.config.ts");
}

function appendEnvExample() {
  const target = path.join(projectRoot, ".env.example");
  const snippet = `
# CMS
ADMIN_PASSWORD=
CMS_DB_PATH=./data/cms.sqlite
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CMS_ADMIN_BASE=/admin
NEXT_PUBLIC_CMS_BRAND_NAME=Content Studio
NEXT_PUBLIC_CMS_BRAND_TAGLINE=Content studio
NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION=
`.trimStart();

  if (!fs.existsSync(target)) {
    if (!dryRun) fs.writeFileSync(target, snippet, "utf8");
    log("Created .env.example");
    return;
  }
  const cur = fs.readFileSync(target, "utf8");
  if (cur.includes("ADMIN_PASSWORD=") && cur.includes("CMS_DB_PATH")) {
    log(".env.example already mentions CMS — skipped");
    return;
  }
  if (!dryRun) fs.appendFileSync(target, `\n${snippet}`, "utf8");
  log("Appended CMS vars to .env.example");
}

function hintNextConfig() {
  log(
    "Ensure next.config includes: serverExternalPackages: [\"better-sqlite3\"] (merge with your existing config).",
  );
}

function runPackageInstall() {
  if (skipInstall) {
    log("Skipped dependency install (--skip-install)");
    return;
  }
  const depsPath = path.join(__dirname, "deps.json");
  if (!fs.existsSync(depsPath)) return;
  const { dependencies = {}, devDependencies = {} } = JSON.parse(
    fs.readFileSync(depsPath, "utf8"),
  );
  const prod = Object.entries(dependencies).map(([k, v]) => `${k}@${v}`);
  const dev = Object.entries(devDependencies).map(([k, v]) => `${k}@${v}`);

  const tryBun = spawnSync("bun", ["--version"], { encoding: "utf8" });
  const pm =
    tryBun.status === 0 ? "bun"
    : fs.existsSync(path.join(projectRoot, "package-lock.json")) ? "npm"
    : "npm";

  if (dryRun) {
    log(`Would run: ${pm} add ${prod.join(" ")}`);
    log(`Would run: ${pm} add -D ${dev.join(" ")}`);
    return;
  }

  if (pm === "bun") {
    if (prod.length) spawnSync("bun", ["add", ...prod], { cwd: projectRoot, stdio: "inherit" });
    if (dev.length) {
      spawnSync("bun", ["add", "-d", ...dev], {
        cwd: projectRoot,
        stdio: "inherit",
      });
    }
  } else {
    if (prod.length) {
      spawnSync("npm", ["install", "--save", ...prod], {
        cwd: projectRoot,
        stdio: "inherit",
      });
    }
    if (dev.length) {
      spawnSync("npm", ["install", "--save-dev", ...dev], {
        cwd: projectRoot,
        stdio: "inherit",
      });
    }
  }
}

function main() {
  if (!fs.existsSync(path.join(projectRoot, "package.json"))) {
    console.error("Run this from a project root (package.json not found).");
    process.exit(1);
  }

  log("Project root:", projectRoot);
  log("Mode: separate — CMS code stays in cms/; only routes go to src/app");

  if (dryRun) log("DRY RUN — no files written");

  if (!fs.existsSync(moduleSrc)) {
    console.error("Missing module folder:", moduleSrc);
    process.exit(1);
  }

  log("Left cms/module in place (not copied to src/cms)");

  if (!fs.existsSync(routesApp)) {
    console.error("Missing routes:", routesApp);
    process.exit(1);
  }

  if (noPublicRoutes) {
    if (!dryRun) {
      const adminSrc = path.join(routesApp, "admin");
      const adminDest = path.join(destApp, "admin");
      copyRecursive(adminSrc, adminDest);
    }
    log("Copied admin routes only -> src/app/admin");
  } else if (!dryRun) {
    copyRecursive(routesApp, destApp);
    log("Copied routes -> src/app");
  } else {
    log("Would copy routes -> src/app");
  }

  mergeTsconfigPaths();
  writeDrizzleConfig();
  appendEnvExample();
  hintNextConfig();
  runPackageInstall();

  log("Done. Set ADMIN_PASSWORD in .env.local, run db:push, then dev. Keep the cms/ folder in the project.");
}

main();
