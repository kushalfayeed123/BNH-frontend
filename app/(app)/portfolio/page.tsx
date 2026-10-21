"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api, ngn, month, Profile, Rag as R } from "@/lib/api";
import Rag from "@/components/Rag";

function List() {
  const [q, setQ] = useState(useSearchParams().get("q") ?? ""); const [rag, setRag] = useState<"ALL" | R>("ALL");
  const [rows, setRows] = useState<Profile[] | null>(null); const [err, setErr] = useState("");
  useEffect(() => { api<{ items: Profile[] }>("/profiles?latest=true&limit=200").then(d => setRows(d.items)).catch(e => setErr(e.message)); }, []);
  if (err) return <p className="err">{err}</p>;
  const shown = (rows ?? []).filter(p => (rag === "ALL" || p.rag_status === rag) && p.company_name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <header className="page-head"><div><h1>Portfolio</h1><p>Latest monthly profile for each company.</p></div></header>
      <div className="toolbar">
        <input placeholder="Search companies" value={q} onChange={e => setQ(e.target.value)} />
        {(["ALL", "RED", "AMBER", "GREEN"] as const).map(r => <button key={r} className={`chip ${rag === r ? "on" : ""}`} onClick={() => setRag(r)}>{r === "ALL" ? "All" : r[0] + r.slice(1).toLowerCase()}</button>)}
      </div>
      <div className="panel flush"><table>
        <thead><tr><th>Company</th><th>Month</th><th className="r">Cash</th><th className="r">Runway</th><th className="r">Revenue</th><th>Health</th><th>Status</th></tr></thead>
        <tbody>{!rows ? <tr><td colSpan={7}><div className="skeleton" /></td></tr> : shown.length === 0 ? <tr><td colSpan={7} className="empty">No companies match. Clear the search or filter.</td></tr> :
          shown.map(p => <tr key={p.id}><td><b>{p.company_name}</b></td><td>{month(p.reporting_month)}</td><td className="r">{ngn(p.cash_position_ngn)}</td>
            <td className="r">{p.runway_months ?? "–"}{p.runway_months != null && " mo"}</td><td className="r">{ngn(p.revenue_ngn)}</td>
            <td><Rag s={p.rag_status} /></td><td><span className="tag">{p.status.replace("_", " ").toLowerCase()}</span></td></tr>)}</tbody>
      </table></div>
    </>
  );
}
export default function Portfolio() { return <Suspense><List /></Suspense>; }
