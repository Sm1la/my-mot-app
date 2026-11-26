import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { FileForm } from "@/components/Forms";
import { notFound } from "next/navigation";
import { getProjectDirectory } from "@/lib/data/projects";
import { getWorkspace } from "@/lib/data/workspace";

export default async function NewFilePage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const [params, workspace, directory] = await Promise.all([searchParams, getWorkspace(), getProjectDirectory()]);
  const project = directory.projects.find((item) => item.id === params.project);
  if (params.project && !project) notFound();

  return <AppShell mode={workspace.mode} directory={directory} activeCompanyId={project?.company_id} activeProjectId={project?.id}><div className="page-wrap narrow-page">
    <Link href={project ? `/?project=${project.id}` : "/"} className="back-link">← Back to files</Link>
    <div className="page-heading page-heading-simple"><div><span className="eyebrow">NEW PROPERTY FILE</span><h1>Create a file</h1><p className="page-subtitle">Start a checklist for this transfer.</p></div></div>
    <section className="form-card"><FileForm directory={directory} projectId={project?.id} /></section>
  </div></AppShell>;
}
