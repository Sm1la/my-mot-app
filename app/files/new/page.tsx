import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { FileForm } from "@/components/Forms";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function NewFilePage() {
  const mode = await getCurrentUser() ? "staff" : "demo";
  return <AppShell mode={mode}><div className="page-wrap narrow-page">
    <Link href="/" className="back-link">← Back to files</Link>
    <div className="page-heading page-heading-simple"><div><span className="eyebrow">NEW PROPERTY FILE</span><h1>Create a file</h1><p className="page-subtitle">Start a checklist for this transfer.</p></div></div>
    <section className="form-card"><FileForm /></section>
  </div></AppShell>;
}
