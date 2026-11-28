import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/Sidebar";
import { FileCard, FileListControls } from "@/components/FileList";
import { ProjectRegister } from "@/components/ProjectRegister";
import { CompanyProjectSummaries, RegistrationSummary } from "@/components/RegistrationSummary";
import { TitleReleaseSummary } from "@/components/TitleReleaseSummary";
import { getFiles } from "@/lib/data/files";
import { getProjectDirectory } from "@/lib/data/projects";
import { formatMonth } from "@/lib/dates";
import { getProjectBlocks, getPropertyTypes, projectQuery } from "@/lib/project-blocks";
import { countSignedPurchasers } from "@/lib/signing";
import { getCurrentUser } from "@/lib/supabase/server";
import type { FileWithPurchasers, ProjectDirectory } from "@/lib/types";

type SearchParams = Promise<{ status?: string; followup?: string; sort?: string; company?: string; project?: string; block?: string; property?: string; release?: string }>;

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
  const propertyTypes = getPropertyTypes(block?.id);
  const propertyType = propertyTypes.find((item) => item.id === params.property);
  if ((params.project && !project) || (params.company && !company) || (params.block && !block) || (params.property && !propertyType)) notFound();

  const projectsById = new Map(directory.projects.map((item) => [item.id, item]));
  const files = allFiles.filter((file) => {
    if (project) return file.project_id === project.id && (!block || file.block_id === block.id) && (!propertyType || file.property_type === propertyType.id);
    if (company) return !!file.project_id && projectsById.get(file.project_id)?.company_id === company.id;
    return true;
  });
  const workspaceLabel = user?.app_metadata.mot_role === "admin" ? "ADMIN WORKSPACE" : user ? "YOUR WORKSPACE" : null;
  const heading = propertyType?.name ?? block?.name ?? project?.name ?? company?.name ?? "Property files";
  const parent = block && project
    ? { name: propertyType ? block.name : project.name, href: `/${projectQuery(project.id, propertyType ? block.id : undefined)}` }
    : project && company ? { name: company.name, href: `/?company=${company.id}` } : null;
  const companyProjects = company && !project ? directory.projects.filter((item) => item.company_id === company.id) : [];
  const newFileHref = project ? `/files/new${projectQuery(project.id, block?.id, propertyType?.id)}` : "/files/new";
  const isCompanyOverview = !!company && !project;
  const registerFilters = new URLSearchParams();
  if (status !== "all") registerFilters.set("status", status);
  if (followUp !== "all") registerFilters.set("followup", followUp);
  if (sort !== "recent") registerFilters.set("sort", sort);
  const scopeHref = project ? `/${projectQuery(project.id, block?.id, propertyType?.id)}${registerFilters.size ? `&${registerFilters}` : ""}` : "/";
  const releaseMonth = project && typeof params.release === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.release) ? params.release : undefined;

  const filtered = files.filter((file) => (status === "all" || file.status === status)
    && (followUp === "all" || file.purchasers.some((purchaser) => purchaser.follow_up_needed))
    && (!releaseMonth || file.title_released_on?.startsWith(releaseMonth)));
  if (sort === "completion") filtered.sort((a, b) => {
    const completion = (file: typeof a) => file.purchasers.length ? countSignedPurchasers(file) / file.purchasers.length : 0;
    return completion(a) - completion(b);
  });
  const openCount = files.filter((file) => file.status === "open").length;
  const followUpCount = files.filter((file) => file.purchasers.some((purchaser) => purchaser.follow_up_needed)).length;

  return <AppShell mode={user ? "staff" : "demo"} directory={directory} activeCompanyId={company?.id} activeProjectId={project?.id} activeBlockId={block?.id} activePropertyType={propertyType?.id}><div className="page-wrap dashboard-page">
    <div className={`page-heading workspace-heading${company || project ? " workspace-heading-compact" : ""}`}>
      <div className="workspace-heading-content">
        {parent ? <Link className="back-link" href={parent.href}>← {parent.name}</Link> : !company && workspaceLabel && <span className="eyebrow">{workspaceLabel}</span>}
        <h1>{heading}</h1>
        {!company && <p className="page-subtitle">Track Form 14A (MOT) from receipt to title registration.</p>}
        {!company && !project && <Link href={newFileHref} className="button button-primary"><span className="plus-sign" aria-hidden="true">+</span> New file</Link>}
      </div>
      <div className="workspace-plan" aria-hidden="true"><span /><span /><span /><span /></div>
    </div>
    {isCompanyOverview && (
      <section className="company-projects" aria-labelledby="company-projects-heading">
        <div className="projects-heading">
          <h2 id="company-projects-heading">Projects</h2>
          <Link href={`/projects/new?company=${company.id}`} className="button button-primary"><span className="plus-sign" aria-hidden="true">+</span> Add project</Link>
        </div>
        {companyProjects.length ? (
          <CompanyProjectSummaries projects={companyProjects} files={files} />
        ) : <p>No projects yet. Add a project to organize this company’s files.</p>}
      </section>
    )}
    {project && !block && blocks.length > 0 && (
      <section className="company-projects" aria-labelledby="project-blocks-heading">
        <h2 id="project-blocks-heading">Blocks</h2>
        <ul>{blocks.map((item) => <li key={item.id}><Link href={`/${projectQuery(project.id, item.id)}`}>{item.name}</Link></li>)}</ul>
      </section>
    )}
    {project && block && !propertyType && propertyTypes.length > 0 && (
      <section className="company-projects" aria-labelledby="property-types-heading">
        <h2 id="property-types-heading">Property types</h2>
        <ul>{propertyTypes.map((item) => <li key={item.id}><Link href={`/${projectQuery(project.id, block.id, item.id)}`}>{item.name}</Link></li>)}</ul>
      </section>
    )}
    {project && <div className="project-overview">
      <RegistrationSummary files={files} openCount={openCount} followUpCount={followUpCount} />
      <TitleReleaseSummary files={files} scopeHref={scopeHref} selectedMonth={releaseMonth} />
    </div>}
    {!project && <section className="overview-stats" aria-label="File overview">
      <div className="overview-stat"><span className="stat-icon icon-lavender" aria-hidden="true">▦</span><span><small>Total files</small><strong>{files.length}</strong></span></div>
      <div className="overview-stat"><span className="stat-icon icon-mint" aria-hidden="true">◷</span><span><small>Open files</small><strong>{openCount}</strong></span></div>
      <div className="overview-stat"><span className="stat-icon icon-amber" aria-hidden="true">!</span><span><small>Need follow-up</small><strong>{followUpCount}</strong></span></div>
    </section>}
    <div className={project ? "section-heading register-heading" : "section-heading"} id={project ? "mot-register" : undefined}>
      <div>
        <h2>{project ? "MOT register" : company ? "Property files" : "All files"} <span className="result-count">{filtered.length}</span></h2>
        {!project && <p>Review MOT milestones and purchaser signatures.</p>}
        {releaseMonth && <p>Released in <time dateTime={releaseMonth}>{formatMonth(releaseMonth)}</time> · <Link className="project-detail-link" href={`${scopeHref}#mot-register`}>Show all months</Link></p>}
      </div>
      {project && <Link href={newFileHref} className="button button-primary"><span className="plus-sign" aria-hidden="true">+</span> New file</Link>}
      <FileListControls status={status} followUp={followUp} sort={sort} companyId={project ? undefined : company?.id} projectId={project?.id} blockId={block?.id} propertyType={propertyType?.id} releaseMonth={releaseMonth} />
    </div>
    {project ? <ProjectRegister files={filtered} hasFiles={files.length > 0} /> : filtered.length ? <div className="file-grid">{filtered.map((file) => {
      const fileProject = file.project_id ? projectsById.get(file.project_id) : undefined;
      const fileBlock = getProjectBlocks(fileProject).find((item) => item.id === file.block_id);
      const filePropertyType = getPropertyTypes(fileBlock?.id).find((item) => item.id === file.property_type);
      return <FileCard key={file.id} file={file} projectName={[fileProject?.name, fileBlock?.name, filePropertyType?.name].filter(Boolean).join(" / ")} />;
    })}</div> : <div className="empty-state"><div className="empty-icon">▦</div><h2>{files.length === 0 ? "No files yet" : "No files match these filters"}</h2><p>{files.length ? "Try changing a filter." : isCompanyOverview ? "Files appear here after they’re assigned to a project." : "Create a property file to start tracking it."}</p>{!company && <Link href={newFileHref} className="button button-primary">+ Create a file</Link>}</div>}
  </div></AppShell>;
}
