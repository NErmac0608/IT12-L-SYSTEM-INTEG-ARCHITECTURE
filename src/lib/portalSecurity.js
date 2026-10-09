// Cryptographic portal route tokens & secure search endpoint paths
// These obscured hashes keep organizer and administrative surfaces non-searchable to standard students

export const ORGANIZER_PORTAL_KEY = "org-e9b27a41d6";
export const ADMIN_PORTAL_KEY = "adm-3c81f092a7";

// Obscured/hashed path identifiers
export const ORGANIZER_HASHED_PATH = `/_sec_portal_org_${ORGANIZER_PORTAL_KEY}`;
export const ADMIN_HASHED_PATH = `/_sec_portal_adm_${ADMIN_PORTAL_KEY}`;

// Search-style URL paths
export const ORGANIZER_SEARCH_ENDPOINT = `/portal?access=organizer&key=${ORGANIZER_PORTAL_KEY}`;
export const ADMIN_SEARCH_ENDPOINT = `/portal?access=admin&key=${ADMIN_PORTAL_KEY}`;

/**
 * Validates whether the search params or path match the organizer encryption key
 */
export function isOrganizerPortalAuthorized(searchParams, pathname = "") {
  const access = searchParams?.get("access") || searchParams?.get("scope");
  const key = searchParams?.get("key") || searchParams?.get("token");
  if (access === "organizer" && key === ORGANIZER_PORTAL_KEY) return true;
  if (pathname.startsWith(ORGANIZER_HASHED_PATH)) return true;
  return false;
}

/**
 * Validates whether the search params or path match the admin encryption key
 */
export function isAdminPortalAuthorized(searchParams, pathname = "") {
  const access = searchParams?.get("access") || searchParams?.get("scope");
  const key = searchParams?.get("key") || searchParams?.get("token");
  if (access === "admin" && key === ADMIN_PORTAL_KEY) return true;
  if (pathname.startsWith(ADMIN_HASHED_PATH)) return true;
  return false;
}
