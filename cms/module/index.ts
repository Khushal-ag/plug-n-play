/**
 * Optional barrel — prefer `@cms/data/pages` etc. in app code to avoid
 * pulling server-only code into client bundles.
 * Server actions live under `@cms/auth/admin-actions` and `@cms/data/page-actions`.
 */
export { cmsAdminBasePath, cmsConfig } from "./config";
export {
  clearAdminSession,
  isAdminAuthenticated,
  requireAdmin,
  setAdminSession,
} from "./auth/session";
export {
  createPage,
  deletePage,
  getPageById,
  getPageBySlug,
  listPages,
  listPublishedForSitemap,
  updatePage,
  type PageInput,
  type PageRow,
} from "./data/pages";
export { getDrizzle, schema } from "./database/client";
export { pages } from "./database/schema";
