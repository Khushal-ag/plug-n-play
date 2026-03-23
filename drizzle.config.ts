import path from "node:path";

import { defineConfig } from "drizzle-kit";

const dbFile = process.env.CMS_DB_PATH ?? "./data/cms.sqlite";

export default defineConfig({
  schema: "./cms/module/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: path.resolve(/* turbopackIgnore: true */ process.cwd(), dbFile),
  },
});
