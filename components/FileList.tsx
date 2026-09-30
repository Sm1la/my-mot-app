import Link from "next/link";
import type { FileWithPurchasers } from "@/lib/types";

export function FileListControls({ status, followUp, sort }: { status: string; followUp: string; sort: string }) {
  return <form className="list-controls" method="get">
    <label className="filter-select"><span className="sr-only">Filter files by status</span><select name="status" defaultValue={status} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="all">All statuses</option><option value="open">Open files</option><option value="closed">Closed files</option></select></label>
    <label className="filter-select"><span className="sr-only">Filter files by follow-up</span><select name="followup" defaultValue={followUp} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="all">All files</option><option value="yes">Needs follow-up</option></select></label>
    <label className="filter-select"><span className="sr-only">Sort files</span><select name="sort" defaultValue={sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="recent">Most recent</option><option value="completion">Least complete</option></select></label>
  </form>;
}

export function FileCard({ file }: { file: FileWithPurchasers }) {
  const signed = file.purchasers.filter((p) => p.signing_status === "signed").length;
  const total = file.purchasers.length;
  const followups = file.purchasers.filter((p) => p.follow_up_needed).length;
  const completion = total ? Math.round((signed / total) * 100) : 0;
  return <Link href={`/files/${file.id}`} className="file-card">
    <div className="file-card-top"><span className={`status-pill ${file.status === "open" ? "status-open" : "status-closed"}`}><i />{file.status === "open" ? "Open" : "Closed"}</span><span className="card-arrow">↗</span></div>
    <h2>{file.file_ref}</h2>
    <p className="file-address">{file.property_address}</p>
    <div className="card-progress"><span className="progress-copy">Signing progress</span><span className="signed-count">{signed}<span>/{total} signed</span></span></div>
    <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
    <div className="file-card-bottom"><span>{total === 0 ? "No purchasers yet" : `${completion}% complete`}</span>{followups > 0 && <span className="followup-count">◷ {followups} follow-up{followups === 1 ? "" : "s"}</span>}</div>
  </Link>;
}
