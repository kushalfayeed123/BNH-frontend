"use client";
import { useEffect, useState } from "react";
import { api, month, ChangeRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Approvals() {
  const { user } = useAuth(); const cos = user?.role === "COS";
  const [rows, setRows] = useState<ChangeRequest[] | null>(null); const [err, setErr] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});
  const load = () => api<{ items: ChangeRequest[] }>("/change-requests?status=PENDING").then(d => setRows(d.items)).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  async function act(id: string, kind: "approve" | "deny" | "withdraw") {
    setErr("");
    try { await api(`/change-requests/${id}/${kind}`, { method: "POST", body: JSON.stringify({ comment: note[id] ?? "" }) }); load(); }
    catch (e: any) { setErr(e.message); }
  }
  return (
    <>
      <header className="page-head"><div><h1>Approvals</h1><p>{cos ? "Review updates before they join the approved portfolio." : "Updates you have submitted and are waiting on."}</p></div></header>
      {err && <p className="err" role="alert">{err}</p>}
      {!rows ? <div className="skeleton" /> : rows.length === 0 ? <p className="empty panel">Nothing is waiting for approval.</p> :
        rows.map(r => <section key={r.id} className="panel">
          <div className="row"><div><h2>{r.company_name}</h2><p>{month(r.reporting_month)} · submitted by {r.submitted_by_name}</p>{r.summary && <p>{r.summary}</p>}</div></div>
          {cos ? <div className="actions">
            <input placeholder="Comment (required to deny)" value={note[r.id] ?? ""} onChange={e => setNote({ ...note, [r.id]: e.target.value })} />
            <button className="btn" onClick={() => act(r.id, "approve")}>Approve</button>
            <button className="btn ghost" disabled={!note[r.id]?.trim()} onClick={() => act(r.id, "deny")}>Deny</button>
          </div> : <div className="actions"><button className="btn ghost" onClick={() => act(r.id, "withdraw")}>Withdraw</button></div>}
        </section>)}
    </>
  );
}
