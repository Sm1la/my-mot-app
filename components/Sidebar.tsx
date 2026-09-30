"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mobile-header">
        <Link href="/" className="brand"><span className="brand-mark">14</span><span>Form 14A</span></Link>
        <button className="menu-toggle" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
      </header>
      {open && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <Link href="/" className="brand desktop-brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">14</span><span><strong>Form 14A</strong><small>Signing tracker</small></span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <Link href="/" onClick={() => setOpen(false)} className={`nav-link ${pathname === "/" ? "nav-active" : ""}`}>
          <span className="nav-icon">▦</span> All files
        </Link>
        <div className="sidebar-note"><span className="note-dot" />Keep every signature on track.</div>
        <div className="sidebar-footer"><form action={signOutAction}><button className="signout-button">↪ Sign out</button></form><span>Form 14A · Conveyancing</span></div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><Sidebar /><main className="main-area">{children}</main></div>;
}
