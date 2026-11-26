import Link from "next/link";
import { projectQuery } from "@/lib/project-blocks";
import type { Project, TransferFile } from "@/lib/types";

type Totals = { total: number; registered: number };

const percentFormat = new Intl.NumberFormat("en-MY", { style: "percent", maximumFractionDigits: 1 });

function RegistrationProgress({ totals }: { totals: Totals }) {
  const rate = totals.total === 0 ? 0 : totals.registered / totals.total;
  return (
    <div className="registration-progress">
      <strong>{percentFormat.format(rate)}</strong>
      <progress value={rate} max={1} aria-label="Proportion of files registered" />
    </div>
  );
}

export function RegistrationSummary({ files, openCount, followUpCount }: { files: TransferFile[]; openCount: number; followUpCount: number }) {
  const totals = { total: files.length, registered: files.filter((file) => file.title_registered_on).length };

  return (
    <section className="registration-summary table-card" aria-labelledby="registration-summary-heading">
      <h2 id="registration-summary-heading">Registration summary</h2>
      <dl className="registration-summary-grid">
        <div><dt>Total files</dt><dd>{totals.total}</dd></div>
        <div><dt>Registered</dt><dd>{totals.registered}</dd></div>
        <div><dt>Outstanding</dt><dd>{totals.total - totals.registered}</dd></div>
        <div><dt>% registered</dt><dd><RegistrationProgress totals={totals} /></dd></div>
      </dl>
      <p className="registration-operational">{openCount} open · {followUpCount} need follow-up</p>
    </section>
  );
}

export function CompanyProjectSummaries({ projects, files }: { projects: Project[]; files: TransferFile[] }) {
  const totalsByProject = new Map(projects.map((project) => [project.id, { total: 0, registered: 0 }]));
  for (const file of files) {
    if (!file.project_id) continue;
    const totals = totalsByProject.get(file.project_id);
    if (!totals) continue;
    totals.total += 1;
    if (file.title_registered_on) totals.registered += 1;
  }

  return (
    <div className="table-card register-scroll" role="region" aria-label="Project summary" tabIndex={0}>
      <table className="project-summary-table" aria-label="Project registration summary">
        <thead><tr>
          <th scope="col">Project</th><th scope="col">Total files</th><th scope="col">Registered</th><th scope="col">Outstanding</th><th scope="col">% registered</th>
        </tr></thead>
        <tbody>{projects.map((project) => {
          const totals = totalsByProject.get(project.id)!;
          return (
            <tr key={project.id}>
              <th scope="row"><Link href={`/${projectQuery(project.id)}`}>{project.name}</Link></th>
              <td>{totals.total}</td><td>{totals.registered}</td><td>{totals.total - totals.registered}</td>
              <td><RegistrationProgress totals={totals} /></td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
