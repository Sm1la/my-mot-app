import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { FileCard, FileListControls } from "@/components/FileList";
import { getFiles } from "@/lib/data/files";

type SearchParams = Promise<{ status?: string; followup?: string; sort?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = ["open", "closed"].includes(params.status ?? "") ? params.status! : "all";
  const followUp = params.followup === "yes" ? "yes" : "all";
  const sort = params.sort === "completion" ? "completion" : "recent";
  let files;
  try {
    files = await getFiles();
  } catch (error) {
    return <AppShell><div className="page-wrap"><div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Property files</h1></div><Link href="/files/new" className="button button-primary">+ New file</Link></div><div className="error-panel"><strong>We couldn’t load your files.</strong><p>{error instanceof Error ? error.message : "Please try again."}</p><Link className="button button-secondary" href="/">Try again</Link></div></div></AppShell>;
  }

  const filtered = files.filter((file) => (status === "all" || file.status === status) && (followUp === "all" || file.purchasers.some((purchaser) => purchaser.follow_up_needed)));
  if (sort === "completion") filtered.sort((a, b) => {
    const completion = (file: typeof a) => file.purchasers.length ? file.purchasers.filter((p) => p.signing_status === "signed").length / file.purchasers.length : 0;
    return completion(a) - completion(b);
  });
  const openCount = files.filter((file) => file.status === "open").length;
  const followUpCount = files.filter((file) => file.purchasers.some((purchaser) => purchaser.follow_up_needed)).length;

  return <AppShell><div className="page-wrap">
    <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Property files</h1><p className="page-subtitle">Keep every Form 14A signature moving forward.</p></div><Link href="/files/new" className="button button-primary"><span className="plus-sign">+</span> New file</Link></div>
    <section className="overview-stats" aria-label="File overview"><div className="overview-stat"><span className="stat-icon icon-lavender">▦</span><span><small>Total files</small><strong>{files.length}</strong></span></div><div className="overview-stat"><span className="stat-icon icon-mint">◷</span><span><small>Open files</small><strong>{openCount}</strong></span></div><div className="overview-stat"><span className="stat-icon icon-amber">!</span><span><small>Need follow-up</small><strong>{followUpCount}</strong></span></div></section>
    <div className="section-heading"><div><h2>All files <span className="result-count">{filtered.length}</span></h2><p>Review signing progress and next steps.</p></div><FileListControls status={status} followUp={followUp} sort={sort} /></div>
    {filtered.length ? <div className="file-grid">{filtered.map((file) => <FileCard key={file.id} file={file} />)}</div> : <div className="empty-state"><div className="empty-icon">▦</div><h2>{files.length === 0 ? "No files yet" : "No files match these filters"}</h2><p>{files.length === 0 ? "Create your first transfer file to start tracking purchaser signatures." : "Try changing a filter, or add a new property file."}</p><Link href="/files/new" className="button button-primary">+ Create a file</Link></div>}
  </div></AppShell>;
}
