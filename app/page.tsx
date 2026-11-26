import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/Sidebar";
import { FileCard, FileListControls } from "@/components/FileList";
import { ProjectRegister } from "@/components/ProjectRegister";
import { getFiles } from "@/lib/data/files";
import { getProjectDirectory } from "@/lib/data/projects";
import { getProjectBlocks, projectQuery } from "@/lib/project-blocks";
import { getCurrentUser } from "@/lib/supabase/server";
import type { FileWithPurchasers, ProjectDirectory } from "@/lib/types";

type SearchParams = Promise<{ status?: string; followup?: string; sort?: string; company?: string; project?: string; block?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = ["open", "closed"].includes(params.status ?? "") ? params.status! : "all";
  const followUp = params.followup === "yes" ? "yes" : "all";
  const sort = params.sort === "completion" ? "completion" : "recent";
  let allFiles: FileWithPurchasers[];
  let directory: ProjectDirectory;
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
    [allFiles, directory] = await Promise.all([getFiles(), getProjectDirectory()]);
  } catch (error) {
    return <AppShell mode={user ? "staff" : "demo"}><div className="page-wrap"><div className="page-heading"><div><h1>Property files</h1></div><Link href="/files/new" className="button button-primary">+ New file</Link></div><div className="error-panel"><strong>We couldn’t load your files.</strong><p>{error instanceof Error ? error.message : "Please try again."}</p><Link className="button button-secondary" href="/">Try again</Link></div></div></AppShell>;
  }

  const project = directory.projects.find((item) => item.id === params.project);
  const company = directory.companies.find((item) => item.id === (project?.company_id ?? params.company));
  const blocks = getProjectBlocks(project);
  const block = blocks.find((item) => item.id === params.block);
  if ((params.project && !project) || (params.company && !company) || (params.block && !block)) notFound();

  const projectsById = new Map(directory.projects.map((item) => [item.id, item]));
  const files = allFiles.filter((file) => {
    if (project) return file.project_id === project.id && (!block || file.block_id === block.id);
    if (company) return !!file.project_id && projectsById.get(file.project_id)?.company_id === company.id;
    return true;
  });
  const workspaceLabel = user?.app_metadata.mot_role === "admin" ? "ADMIN WORKSPACE" : user ? "YOUR WORKSPACE" : null;
  const heading = block?.name ?? project?.name ?? company?.name ?? "Property files";
  const companyProjects = company && !project ? directory.projects.filter((item) => item.company_id === company.id) : [];
  const primaryHref = project ? `/files/new${projectQuery(project.id, block?.id)}` : company ? `/projects/new?company=${company.id}` : "/files/new";
  const primaryLabel = company && !project ? "Add project" : "New file";

  const filtered = files.filter((file) => (status === "all" || file.status === status) && (followUp === "all" || file.purchasers.some((purchaser) => purchaser.follow_up_needed)));
  if (sort === "completion") filtered.sort((a, b) => {
    const completion = (file: typeof a) => file.purchasers.length ? file.purchasers.filter((p) => p.signing_status === "signed").length / file.purchasers.length : 0;
    return completion(a) - completion(b);
  });
  const openCount = files.filter((file) => file.status === "open").length;
  const followUpCount = files.filter((file) => file.purchasers.some((purchaser) => purchaser.follow_up_needed)).length;

  return <AppShell mode={user ? "staff" : "demo"} directory={directory} activeCompanyId={company?.id} activeProjectId={project?.id} activeBlockId={block?.id}><div className="page-wrap">
    <div className="page-heading">
      <div>
        {block && project ? <Link className="back-link" href={`/${projectQuery(project.id)}`}>← {project.name}</Link> : project && company ? <Link className="back-link" href={`/?company=${company.id}`}>← {company.name}</Link> : !company && workspaceLabel && <span className="eyebrow">{workspaceLabel}</span>}
        <h1>{heading}</h1>
        {!company && <p className="page-subtitle">Track Form 14A (MOT) from receipt to title registration.</p>}
      </div>
      <Link href={primaryHref} className="button button-primary"><span className="plus-sign">+</span> {primaryLabel}</Link>
    </div>
    {company && !project && (
      <section className="company-projects" aria-labelledby="company-projects-heading">
        <h2 id="company-projects-heading">Projects</h2>
        {companyProjects.length ? (
          <ul>{companyProjects.map((item) => <li key={item.id}><Link href={`/?project=${item.id}`}>{item.name}</Link></li>)}</ul>
        ) : <p>No projects yet. Add a project to organize this company’s files.</p>}
      </section>
    )}
    {project && !block && blocks.length > 0 && (
      <section className="company-projects" aria-labelledby="project-blocks-heading">
        <h2 id="project-blocks-heading">Blocks</h2>
        <ul>{blocks.map((item) => <li key={item.id}><Link href={`/${projectQuery(project.id, item.id)}`}>{item.name}</Link></li>)}</ul>
      </section>
    )}
    <section className="overview-stats" aria-label="File overview"><div className="overview-stat"><span className="stat-icon icon-lavender">▦</span><span><small>Total files</small><strong>{files.length}</strong></span></div><div className="overview-stat"><span className="stat-icon icon-mint">◷</span><span><small>Open files</small><strong>{openCount}</strong></span></div><div className="overview-stat"><span className="stat-icon icon-amber">!</span><span><small>Need follow-up</small><strong>{followUpCount}</strong></span></div></section>
    <div className="section-heading"><div><h2>{project ? "MOT register" : company ? "Property files" : "All files"} <span className="result-count">{filtered.length}</span></h2>{!project && <p>Review MOT milestones and purchaser signatures.</p>}</div><FileListControls status={status} followUp={followUp} sort={sort} companyId={project ? undefined : company?.id} projectId={project?.id} blockId={block?.id} /></div>
    {project ? <ProjectRegister files={filtered} hasFiles={files.length > 0} /> : filtered.length ? <div className="file-grid">{filtered.map((file) => {
      const fileProject = file.project_id ? projectsById.get(file.project_id) : undefined;
      const fileBlock = getProjectBlocks(fileProject).find((item) => item.id === file.block_id);
      return <FileCard key={file.id} file={file} projectName={fileBlock ? `${fileProject?.name} / ${fileBlock.name}` : fileProject?.name} />;
    })}</div> : <div className="empty-state"><div className="empty-icon">▦</div><h2>{files.length === 0 ? "No files yet" : "No files match these filters"}</h2><p>{files.length ? "Try changing a filter." : company && !project ? "Files appear here after they’re assigned to a project." : "Create a property file to start tracking it."}</p>{!company && <Link href={primaryHref} className="button button-primary">+ Create a file</Link>}</div>}
  </div></AppShell>;
}
