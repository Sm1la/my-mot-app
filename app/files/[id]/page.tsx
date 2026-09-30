import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/Sidebar";
import { AddPurchaserForm, DeleteFileButton, EditFileDetails } from "@/components/Forms";
import { PurchaserTable } from "@/components/PurchaserTable";
import { getFile } from "@/lib/data/files";
import { toggleFileStatus } from "@/lib/actions/files";

export default async function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let file;
  try {
    file = await getFile(id);
  } catch {
    return <AppShell><div className="page-wrap"><Link href="/" className="back-link">← Back to files</Link><div className="error-panel"><strong>We couldn’t load this file.</strong><p>Check your connection and try again.</p><Link href={`/files/${id}`} className="button button-secondary">Retry</Link></div></div></AppShell>;
  }
  if (!file) notFound();

  const signed = file.purchasers.filter((p) => p.signing_status === "signed").length;
  const total = file.purchasers.length;
  return <AppShell><div className="page-wrap">
    <Link href="/" className="back-link">← All files</Link>
    <section className="detail-hero">
      <div className="detail-hero-copy"><span className={`status-pill ${file.status === "open" ? "status-open" : "status-closed"}`}><i />{file.status === "open" ? "Open file" : "Closed file"}</span><h1>{file.file_ref}</h1><p className="detail-address">⌖ {file.property_address}</p>{file.notes && <p className="file-notes">{file.notes}</p>}</div>
      <div className="detail-hero-actions"><form action={toggleFileStatus}><input type="hidden" name="id" value={file.id} /><input type="hidden" name="status" value={file.status === "open" ? "closed" : "open"} /><button className="button button-secondary">Mark {file.status === "open" ? "closed" : "open"}</button></form><EditFileDetails file={file} /><DeleteFileButton id={file.id} purchaserCount={total} /></div>
      <div className="detail-progress"><div><small>Purchaser signing progress</small><strong><span>{signed}</span> / {total} signed</strong></div><div className="progress-track"><span style={{ width: `${total ? (signed / total) * 100 : 0}%` }} /></div></div>
    </section>
    <section className="detail-section"><div className="section-heading"><div><h2>Purchasers <span className="result-count">{total}</span></h2><p>Update signing status and follow-up as the file progresses.</p></div></div>
      <div className="table-card"><PurchaserTable purchasers={file.purchasers} fileId={file.id} /><div className="add-purchaser-wrap"><div className="add-caption"><strong>Add a purchaser</strong><span>Each purchaser is tracked separately.</span></div><AddPurchaserForm fileId={file.id} /></div></div>
    </section>
  </div></AppShell>;
}
