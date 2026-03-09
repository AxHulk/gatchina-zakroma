/**
 * Admin API client helper
 * Handles authentication and API calls for the admin panel
 */

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}

export async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers: Record<string, string> = {
    "x-admin-token": token,
    ...(options?.headers as Record<string, string> || {}),
  };

  if (options?.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function adminGet<T = any>(url: string): Promise<T> {
  const res = await adminFetch(url);
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function adminDelete<T = any>(url: string): Promise<T> {
  const res = await adminFetch(url, { method: "DELETE" });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
