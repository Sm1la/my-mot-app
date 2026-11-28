import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, WorkspaceField } from "@/components/Sidebar";
import { AddPurchaserForm, DeleteFileButton, EditFileDetails } from "@/components/Forms";
import { FileMilestones } from "@/components/FileMilestones";
import { PurchaserTable } from "@/components/PurchaserTable";
import { getFile } from "@/lib/data/files";
import { getProjectDirectory } from "@/lib/data/projects";
import { formatDate } from "@/lib/dates";
import { getProjectBlocks, getPropertyTypes, projectQuery } from "@/lib/project-blocks";
import { countSignedPurchasers } from "@/lib/signing";
import { toggleFileStatus } from "@/lib/actions/files";
import { getCurrentUser } from "@/lib/supabase/server";
import type { FileWithPurchasers, ProjectDirectory } from "@/lib/types";

export default async function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mode = await getCurrentUser() ? "staff" : "demo";
  let file: FileWithPurchasers | null;
  let directory: ProjectDirectory;
  try {
    [file, directory] = await Promise.all([getFile(id), getProjectDirectory()]);
  } catch {
    return <AppShell mode={mode}><div className="page-wrap"><Link href="/" className="back-link">← Back to files</Link><div className="error-panel"><strong>We couldn’t load this file.</strong><p>Check your connection and try again.</p><Link href={`/files/${id}`} className="button button-secondary">Retry</Link></div></div></AppShell>;
  }
  if (!file) notFound();

  const project = directory.projects.find((item) => item.id === file.project_id);
  const block = getProjectBlocks(project).find((item) => item.id === file.block_id);
  const propertyType = getPropertyTypes(block?.id).find((item) => item.id === file.property_type);
  const signed = countSignedPurchasers(file);
  const total = file.purchasers.length;
  return <AppShell mode={mode} directory={directory} activeCompanyId={project?.company_id} activeProjectId={project?.id} activeBlockId={block?.id} activePropertyType={propertyType?.id}><div className="page-wrap">
    <Link href="/" className="back-link">← All files</Link>
    <section className="detail-hero">
      <div className="detail-hero-copy">
        <span className={`status-pill ${file.status === "open" ? "status-open" : "status-closed"}`}><i />{file.status === "open" ? "Open file" : "Closed file"}</span>
        <h1>{file.unit_no || file.file_ref || "Unnumbered unit"}</h1>
        {file.spa_date && <p className="file-lawyer"><strong>SPA Date</strong> <time dateTime={file.spa_date}>{formatDate(file.spa_date)}</time></p>}
        {file.title_no && <p className="file-lawyer"><strong>Title No</strong> {file.title_no}</p>}
        {project && <p className="file-lawyer"><strong>Project</strong> <Link className="project-detail-link" href={`/${projectQuery(project.id, block?.id, propertyType?.id)}`}>{[project.name, block?.name, propertyType?.name].filter(Boolean).join(" / ")}</Link></p>}
        {file.lawyer_name && <p className="file-lawyer"><strong>MOT Lawyer</strong> {file.lawyer_name}</p>}
        {file.notes && <p className="file-notes">{file.notes}</p>}
      </div>
      <div className="detail-hero-actions"><form action={toggleFileStatus}><WorkspaceField /><input type="hidden" name="id" value={file.id} /><input type="hidden" name="status" value={file.status === "open" ? "closed" : "open"} /><button className="button button-secondary">Mark {file.status === "open" ? "closed" : "open"}</button></form><Link className="button button-secondary" href={`/activity?file=${file.id}`}>File history</Link><EditFileDetails file={file} directory={directory} /><DeleteFileButton id={file.id} purchaserCount={total} /></div>
      <div className="detail-progress"><div><small>Purchaser signing progress</small><strong><span>{signed}</span> / {total} signed</strong></div><div className="progress-track"><span style={{ width: `${total ? (signed / total) * 100 : 0}%` }} /></div></div>
    </section>
    <FileMilestones key={file.id} fileId={file.id} dates={{
      mot_received_on: file.mot_received_on,
      mot_executed_on: file.mot_executed_on,
      title_released_on: file.title_released_on,
      title_registered_on: file.title_registered_on,
    }} />
    <section className="detail-section"><div className="section-heading"><div><h2>Purchasers <span className="result-count">{total}</span></h2><p>Saving the title release date counts every purchaser on this file as signed.</p></div></div>
      <div className="table-card"><PurchaserTable purchasers={file.purchasers} fileId={file.id} releasedOn={file.title_released_on} /><div className="add-purchaser-wrap"><div className="add-caption"><strong>{project ? "Add purchasers" : "Add a purchaser"}</strong><span>Each purchaser is tracked separately.</span></div><AddPurchaserForm fileId={file.id} multiple={!!project} /></div></div>
    </section>
  </div></AppShell>;
}
