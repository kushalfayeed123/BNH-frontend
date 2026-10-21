"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/approvals", label: "Approvals" },
  { href: "/users", label: "Team", cos: true },
];
export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(); const path = usePathname(); const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  if (!user) return <div className="splash">Loading…</div>;
  return (
    <div className="shell">
      <aside>
        <div className="logo">BNH</div>
        <nav>{NAV.filter(n => !n.cos || user.role === "COS").map(n =>
          <Link key={n.href} href={n.href} className={path.startsWith(n.href) ? "on" : ""}>{n.label}</Link>)}</nav>
        <div className="me">
          <b>{user.full_name}</b><span>{user.role === "COS" ? "Chief of Staff" : "Portfolio manager"}</span>
          <button onClick={async () => { await logout(); router.replace("/login"); }}>Sign out</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
