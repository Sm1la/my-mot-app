import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { FileForm } from "@/components/Forms";
import { notFound } from "next/navigation";
import { getProjectDirectory } from "@/lib/data/projects";
import { getWorkspace } from "@/lib/data/workspace";
import { getProjectBlocks, getPropertyTypes, projectQuery } from "@/lib/project-blocks";

export default async function NewFilePage({ searchParams }: { searchParams: Promise<{ project?: string; block?: string; property?: string }> }) {
  const [params, workspace, directory] = await Promise.all([searchParams, getWorkspace(), getProjectDirectory()]);
  const project = directory.projects.find((item) => item.id === params.project);
  const block = getProjectBlocks(project).find((item) => item.id === params.block);
  const propertyType = getPropertyTypes(block?.id).find((item) => item.id === params.property);
  if ((params.project && !project) || (params.block && !block) || (params.property && !propertyType)) notFound();
  const locationLabel = project ? [project.name, block?.name, propertyType?.name].filter(Boolean).join(" / ") : undefined;

  return <AppShell mode={workspace.mode} directory={directory} activeCompanyId={project?.company_id} activeProjectId={project?.id} activeBlockId={block?.id} activePropertyType={propertyType?.id}><div className="page-wrap narrow-page">
    <Link href={project ? `/${projectQuery(project.id, block?.id, propertyType?.id)}` : "/"} className="back-link">← Back to files</Link>
    <div className="page-heading page-heading-simple"><div><span className="eyebrow">NEW PROPERTY FILE</span><h1>Create a file</h1><p className="page-subtitle">Start a checklist for this transfer.</p></div></div>
    <section className="form-card"><FileForm directory={directory} projectId={project?.id} blockId={block?.id} propertyType={propertyType?.id} locationLabel={locationLabel} /></section>
  </div></AppShell>;
}
