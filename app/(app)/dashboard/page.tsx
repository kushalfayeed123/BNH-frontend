"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ngn, month, Profile, Rag as R } from "@/lib/api";
import Rag from "@/components/Rag";
import { useAuth } from "@/lib/auth";

export default function Overview() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [pending, setPending] = useState(0); const [err, setErr] = useState("");
  useEffect(() => {
    api<{ items: Profile[] }>("/profiles?status=APPROVED&latest=true&limit=200").then(d => setRows(d.items)).catch(e => setErr(e.message));
    api<{ total: number }>("/change-requests?status=PENDING&limit=1").then(d => setPending(d.total)).catch(() => {});
  }, []);
  if (err) return <p className="err">{err}</p>;
  if (!rows) return <div className="skeleton" />;
  const count = (r: R) => rows.filter(p => p.rag_status === r).length;
  const cash = rows.reduce((s, p) => s + p.cash_position_ngn, 0);
  const attention = rows.filter(p => p.rag_status !== "GREEN").sort((a, b) => (a.rag_status === "RED" ? 0 : 1) - (b.rag_status === "RED" ? 0 : 1));
  const runway = rows.filter(p => p.runway_months != null).sort((a, b) => a.runway_months! - b.runway_months!).slice(0, 5);
  return (
    <>
      <header className="page-head">
        <div><h1>{rows.length} companies, {ngn(cash)} in cash</h1>
          <p>{count("RED")} need attention now. Approved data only.</p></div>
        {pending > 0 && <Link className="btn" href="/approvals">{pending} awaiting approval</Link>}
      </header>
      <section className="panel">
        <div className="ragbar" role="img" aria-label={`${count("GREEN")} green, ${count("AMBER")} amber, ${count("RED")} red`}>
          {(["GREEN", "AMBER", "RED"] as R[]).map(r => count(r) > 0 && <div key={r} className={`seg seg-${r.toLowerCase()}`} style={{ flex: count(r) }}>{count(r)}</div>)}
        </div>
      </section>
      <div className="two">
        <section className="panel"><h2>Needs attention</h2>
          {attention.length === 0 ? <p className="empty">Every company is green this month.</p> :
            <ul className="list">{attention.map(p => <li key={p.id}>
              <div><Link href={`/portfolio?q=${encodeURIComponent(p.company_name)}`}><b>{p.company_name}</b></Link><p>{p.rag_rationale}</p></div>
              <Rag s={p.rag_status} /></li>)}</ul>}
        </section>
        <section className="panel"><h2>Shortest runway</h2>
          <ul className="list">{runway.map(p => <li key={p.id}><div><b>{p.company_name}</b><p>{month(p.reporting_month)} · cash {ngn(p.cash_position_ngn)}</p></div>
            <span className="big">{p.runway_months} mo</span></li>)}</ul>
        </section>
      </div>
      {user?.role === "PORTFOLIO_MANAGER" && <p className="hint">Submit monthly updates from the Portfolio page.</p>}
    </>
  );
}
