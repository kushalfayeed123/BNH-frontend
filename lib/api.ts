export const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
let access: string | null = null;
let inflight: Promise<boolean> | null = null;

export type Role = "PORTFOLIO_MANAGER" | "COS";
export type User = { id: string; email: string; full_name: string; role: Role };
export type Rag = "RED" | "AMBER" | "GREEN";
export type Profile = {
  id: string; company_id: string; company_name: string; reporting_month: string; status: string;
  cash_position_ngn: number; runway_months: number | null; revenue_ngn: number | null;
  rag_status: Rag; rag_rationale: string | null; rag_trend: string | null; open_blockers?: number;
};
export type ChangeRequest = {
  id: string; company_name: string; reporting_month: string; submitted_by_name: string;
  submitted_at: string; summary?: string; status: string;
};

export class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }

export function refreshSession(): Promise<boolean> {
  // Refresh tokens rotate, so concurrent callers must share one request.
  inflight ??= (async () => {
    const rt = localStorage.getItem("bnh_rt");
    if (!rt) return false;
    const r = await fetch(`${BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: rt }) });
    if (!r.ok) { localStorage.removeItem("bnh_rt"); return false; }
    const d = await r.json(); access = d.access_token; localStorage.setItem("bnh_rt", d.refresh_token); return true;
  })().finally(() => { inflight = null; });
  return inflight;
}
export function setTokens(a: string | null, r: string | null) {
  access = a; r ? localStorage.setItem("bnh_rt", r) : localStorage.removeItem("bnh_rt");
}
export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}), ...init.headers } });
  if (res.status === 401 && retry && (await refreshSession())) return api<T>(path, init, false);
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new ApiError(res.status, b.detail?.message ?? b.detail ?? "Something went wrong. Try again."); }
  return res.status === 204 ? (undefined as T) : res.json();
}
export const ngn = (n: number | null | undefined) => {
  if (n == null) return "–"; const a = Math.abs(n);
  return "₦" + (a >= 1e9 ? (n / 1e9).toFixed(2) + "bn" : a >= 1e6 ? (n / 1e6).toFixed(1) + "m" : n.toLocaleString());
};
export const month = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
