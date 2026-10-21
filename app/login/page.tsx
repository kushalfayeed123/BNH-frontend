"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login } = useAuth(); const router = useRouter();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try { await login(email.trim().toLowerCase(), pw); router.replace("/dashboard"); }
    catch (x: any) { setErr(x.message); setBusy(false); }
  }
  return (
    <main className="login">
      <section className="login-brand">
        <h1>BNH<br />Portfolio Manager</h1>
        <p>Every portfolio company, its cash, its health and its blockers, in one approved view.</p>
      </section>
      <form className="login-form" onSubmit={submit}>
        <h2>Sign in</h2>
        <label>Email<input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={pw} onChange={e => setPw(e.target.value)} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <small>Accounts are created by the Chief of Staff. Locked out? Ask them to re-create your account.</small>
      </form>
    </main>
  );
}
