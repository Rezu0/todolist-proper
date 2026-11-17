/* eslint-disable @next/next/no-location-assign-relative-destination */
// Helper fetch untuk komponen client; sama dengan yang ada di Board.tsx,
// jadi Board bisa mengimpor dari sini dan fungsi lokalnya dihapus.
export async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}