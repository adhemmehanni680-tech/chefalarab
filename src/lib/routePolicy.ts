/**
 * Central route policy used by every ad surface.
 *
 * These pages are informational / legal and intentionally ad-free.
 * Keep this list in sync with the AdSense Auto ads "Page exclusions"
 * configured for chefalarab.com.
 */
export const AD_FREE_ROUTES = [
  "/privacy_policy",
  "/terms_conditions",
  "/cookie_policy",
  "/contact_us",
  "/about_us",
] as const;

function normalizePathname(pathname?: string | null): string {
  if (!pathname) return "/";

  const value = pathname.split("?")[0]?.split("#")[0] || "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;

  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

export function isAdFreePath(pathname?: string | null): boolean {
  const normalized = normalizePathname(pathname);

  return AD_FREE_ROUTES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`),
  );
}
