import Link from "next/link";
import { ProjectForm } from "@/components/ProjectForm";
import { AppShell } from "@/components/Sidebar";
import { getProjectDirectory } from "@/lib/data/projects";
import { getWorkspace } from "@/lib/data/workspace";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const [params, workspace, directory] = await Promise.all([searchParams, getWorkspace(), getProjectDirectory()]);
  const company = directory.companies.find((item) => item.id === params.company);
  return (
    <AppShell mode={workspace.mode} directory={directory} activeCompanyId={company?.id}>
      <div className="page-wrap narrow-page">
        <Link href={company ? `/?company=${company.id}` : "/"} className="back-link">← Back to {company ? "company" : "files"}</Link>
        <div className="page-heading page-heading-simple"><h1>Add a project</h1></div>
        <ProjectForm companies={directory.companies} companyId={company?.id} />
      </div>
    </AppShell>
  );
}
