"use client";
import { useState } from "react";
import { api, Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Team() {
  const { user } = useAuth();
  const [f, setF] = useState({ full_name: "", email: "", role: "PORTFOLIO_MANAGER" as Role, password: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  if (user?.role !== "COS") return <p className="empty panel">Only the Chief of Staff can manage team accounts.</p>;
  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    try { await api("/users", { method: "POST", body: JSON.stringify({ ...f, email: f.email.trim().toLowerCase() }) });
      setMsg(`${f.full_name} can now sign in. Share the password with them securely; it is not emailed.`); setF({ ...f, full_name: "", email: "", password: "" }); }
    catch (x: any) { setErr(x.message); }
  }
  return (
    <>
      <header className="page-head"><div><h1>Team</h1><p>Create accounts for portfolio managers and other COS members.</p></div></header>
      <form className="panel form" onSubmit={create}>
        <label>Full name<input required value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} /></label>
        <label>Email<input type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
        <label>Role<select value={f.role} onChange={e => setF({ ...f, role: e.target.value as Role })}><option value="PORTFOLIO_MANAGER">Portfolio manager</option><option value="COS">Chief of Staff</option></select></label>
        <label>Initial password<input type="password" required minLength={12} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
        {err && <p className="err" role="alert">{err}</p>}{msg && <p className="ok">{msg}</p>}
        <button className="btn">Create account</button>
      </form>
    </>
  );
}
