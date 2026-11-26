"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { getProjectBlocks, projectQuery, type BlockId } from "@/lib/project-blocks";
import type { ProjectDirectory } from "@/lib/types";

type WorkspaceMode = "demo" | "staff";
const WorkspaceContext = createContext<WorkspaceMode | undefined>(undefined);

export function WorkspaceField() {
  return <input type="hidden" name="workspace" value={useContext(WorkspaceContext)} />;
}

type NavigationProps = {
  mode?: WorkspaceMode;
  directory?: ProjectDirectory;
  activeCompanyId?: string;
  activeProjectId?: string;
  activeBlockId?: BlockId;
};

export function Sidebar({ mode, directory, activeCompanyId, activeProjectId, activeBlockId }: NavigationProps) {
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
        <nav className="sidebar-navigation" aria-label="Workspace">
          <div className="nav-label">WORKSPACE</div>
          <Link href="/" onClick={() => setOpen(false)} className={`nav-link ${pathname === "/" && !activeCompanyId ? "nav-active" : ""}`}>
            <span className="nav-icon">▦</span> All files
          </Link>
          {directory && <>
            <div className="nav-label company-nav-label">COMPANIES</div>
            {directory.companies.map((company) => (
              <div key={company.id}>
                <Link
                  href={`/?company=${company.id}`}
                  onClick={() => setOpen(false)}
                  className={`nav-link company-nav-link ${company.id === activeCompanyId && !activeProjectId ? "nav-active" : ""}`}
                >{company.name}</Link>
                {company.id === activeCompanyId && (
                  <div className="project-nav">
                    {directory.projects.filter((project) => project.company_id === company.id).map((project) => (
                      <div key={project.id}>
                        <Link href={`/${projectQuery(project.id)}`} onClick={() => setOpen(false)} className={`nav-link project-nav-link ${project.id === activeProjectId && !activeBlockId ? "nav-active" : ""}`}>
                          {project.name}
                        </Link>
                        {getProjectBlocks(project).map((block) => (
                          <Link key={block.id} href={`/${projectQuery(project.id, block.id)}`} onClick={() => setOpen(false)} className={`nav-link project-nav-link block-nav-link ${project.id === activeProjectId && block.id === activeBlockId ? "nav-active" : ""}`}>
                            {block.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>}
        </nav>
        <div className="sidebar-footer">
          {mode === "staff" && <form action={signOutAction}><button className="signout-button">↪ Sign out</button></form>}
          {mode === "demo" && <Link className="signout-button" href="/login" onClick={() => setOpen(false)}>Staff sign-in</Link>}
          <span>Form 14A · Conveyancing</span>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children, ...navigation }: NavigationProps & { children: React.ReactNode }) {
  return (
    <WorkspaceContext.Provider value={navigation.mode}>
      <div className="app-shell">
        <Sidebar {...navigation} />
        <main className="main-area">
          {navigation.mode === "demo" && <div className="demo-notice"><strong>Demo workspace</strong><span>Use sample data only. Changes are saved for this browser.</span></div>}
          {children}
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
}
