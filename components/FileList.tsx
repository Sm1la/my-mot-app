"use client";

import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { getLatestMilestone } from "@/lib/milestones";
import { countSignedPurchasers } from "@/lib/signing";
import type { FileWithPurchasers } from "@/lib/types";


export function FileListControls({ status, followUp, sort, companyId, projectId, blockId, propertyType, releaseMonth }: { status: string; followUp: string; sort: string; companyId?: string; projectId?: string; blockId?: string; propertyType?: string; releaseMonth?: string }) {
  return <form className="list-controls" method="get">
    {companyId && <input type="hidden" name="company" value={companyId} />}
    {projectId && <input type="hidden" name="project" value={projectId} />}
    {blockId && <input type="hidden" name="block" value={blockId} />}
    {propertyType && <input type="hidden" name="property" value={propertyType} />}
    {releaseMonth && <input type="hidden" name="release" value={releaseMonth} />}
    <label className="filter-select"><span className="sr-only">Filter files by status</span><select name="status" defaultValue={status} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="all">All statuses</option><option value="open">Open files</option><option value="closed">Closed files</option></select></label>
    <label className="filter-select"><span className="sr-only">Filter files by follow-up</span><select name="followup" defaultValue={followUp} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="all">All files</option><option value="yes">Needs follow-up</option></select></label>
    <label className="filter-select"><span className="sr-only">Sort files</span><select name="sort" defaultValue={sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="recent">Most recent</option><option value="completion">Least complete</option></select></label>
  </form>;
}

export function FileCard({ file, projectName }: { file: FileWithPurchasers; projectName?: string }) {
  const signed = countSignedPurchasers(file);
  const total = file.purchasers.length;
  const followups = file.purchasers.filter((p) => p.follow_up_needed).length;
  const completion = total ? Math.round((signed / total) * 100) : 0;
  const milestone = getLatestMilestone(file);
  const milestoneDate = milestone && file[milestone.key];
  return <Link href={`/files/${file.id}`} className="file-card">
    <div className="file-card-top"><span className={`status-pill ${file.status === "open" ? "status-open" : "status-closed"}`}><i />{file.status === "open" ? "Open" : "Closed"}</span><span className="card-arrow">↗</span></div>
    <h2>{file.unit_no || file.file_ref || "Unnumbered unit"}</h2>
    {projectName && <p className="file-lawyer"><strong>Project</strong> {projectName}</p>}
    {file.lawyer_name && <p className="file-lawyer"><strong>Lawyer</strong> {file.lawyer_name}</p>}
    <div className="card-milestone">
      <strong>{milestone?.label ?? "No MOT milestones recorded"}</strong>
      {milestoneDate && <time dateTime={milestoneDate}>{formatDate(milestoneDate)}</time>}
    </div>
    <div className="card-progress"><span className="progress-copy">Signing progress</span><span className="signed-count">{signed}<span>/{total} signed</span></span></div>
    <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
    <div className="file-card-bottom"><span>{total === 0 ? "No purchasers yet" : `${completion}% complete`}</span>{followups > 0 && <span className="followup-count">◷ {followups} follow-up{followups === 1 ? "" : "s"}</span>}</div>
  </Link>;
}
