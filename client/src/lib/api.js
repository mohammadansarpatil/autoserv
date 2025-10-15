const API_URL = import.meta.env.VITE_API_URL;

/**
 * GET helper
 * @param {string} path - e.g. "/api/health"
 */
export async function apiGet(path) {
  if (!API_URL) throw new Error("API base URL is missing (VITE_API_URL)");
  const res = await fetch(`${API_URL}${path}`, {
    // headers can go here if needed later (Authorization, etc.)
  });
  if (!res.ok) {
    // Attach more detail for debugging
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export function getServices() {
  return apiGet("/api/services");
}