import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { activityTypes, getActivity, type Activity, type ActivityFilters } from "@/lib/data/activity";
import { getProjectDirectory } from "@/lib/data/projects";
import { getWorkspace } from "@/lib/data/workspace";
import { formatDate, isCalendarDate } from "@/lib/dates";
import type { ProjectDirectory } from "@/lib/types";

type SearchParams = Promise<{ type?: string; file?: string; ref?: string; page?: string }>;
const timestamp = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" });
const recordNames = { file: "File", purchaser: "Purchaser", project: "Project" };
const fieldNames: Record<string, string> = {
  block_id: "Block", company_id: "Company", file_ref: "File reference", follow_up_needed: "Follow-up needed",
  follow_up_notes: "Follow-up note", lawyer_name: "MOT lawyer", notes: "Remarks", project_id: "Project", property_type: "Property type",
  mot_received_on: "MOT received date", mot_executed_on: "MOT executed date", title_released_on: "Date released title",
  title_registered_on: "Title registered date", unit_no: "Unit no.", title_no: "Title no.", spa_date: "SPA date",
};
const locationNames: Record<string, string> = {
  "tower-a": "Tower A", "tower-b": "Tower B", mawar: "Block A (Mawar)", teratai: "Block B (Teratai)", flat: "Flat", shop: "Shop",
};

function valueLabel(field: string, value: string | number | boolean | null, directory: ProjectDirectory) {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field === "project_id") return directory.projects.find((item) => item.id === value)?.name ?? "Unavailable project";
  if (field === "company_id") return directory.companies.find((item) => item.id === value)?.name ?? "Unavailable company";
  if (typeof value === "string" && (field === "block_id" || field === "property_type")) return locationNames[value] ?? value;
  if (typeof value === "string" && (field.endsWith("_on") || field.endsWith("_date")) && isCalendarDate(value)) return formatDate(value);
  return String(value);
}

function activityHref(filters: ActivityFilters, page: number) {
  const query = new URLSearchParams();
  if (filters.type) query.set("type", filters.type);
  if (filters.file) query.set("file", filters.file);
  if (filters.ref) query.set("ref", filters.ref);
  if (page > 1) query.set("page", String(page));
  return query.size ? `/activity?${query}` : "/activity";
}

function ActivityDetails({ entry, directory }: { entry: Activity; directory: ProjectDirectory }) {
  return (
    <details className="history-changes">
      <summary>View changes</summary>
      <dl>{Object.entries(entry.changes).map(([field, change]) => (
        <div key={field}>
          <dt>{fieldNames[field] ?? field.replaceAll("_", " ")}</dt>
          <dd>
            {entry.operation !== "created" && <span>{entry.operation === "updated" && <small>Before </small>}{valueLabel(field, change.from, directory)}</span>}
            {entry.operation !== "deleted" && <span>{entry.operation === "updated" && <small>After </small>}{valueLabel(field, change.to, directory)}</span>}
          </dd>
        </div>
      ))}</dl>
    </details>
  );
}

export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const file = typeof params.file === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(params.file) ? params.file : undefined;
  const ref = typeof params.ref === "string" ? params.ref.trim().slice(0, 80) : undefined;
  const type = activityTypes.find((item) => item === params.type);
  const pageNumber = Number(params.page);
  const page = Number.isSafeInteger(pageNumber) && pageNumber > 0 && pageNumber <= 1_000_000 ? pageNumber : 1;
  const filters = { file, ref, type };
  const [workspace, activity, directory] = await Promise.all([getWorkspace(), getActivity(filters, page), getProjectDirectory()]);

  return (
    <AppShell mode={workspace.mode} directory={directory}>
      <div className="page-wrap">
        <div className="page-heading">
          <div><h1>{file ? "File history" : "Activity history"}</h1><p className="page-subtitle">Saved changes to files, purchasers, and projects.</p></div>
          {file && <Link className="button button-secondary" href="/activity">All activity</Link>}
        </div>
        <form action="/activity" method="get" className="history-filters">
          {file && <input type="hidden" name="file" value={file} />}
          <label className="field"><span>File reference</span><input name="ref" maxLength={80} defaultValue={ref ?? ""} /></label>
          <label className="field"><span>Record type</span><select name="type" defaultValue={type ?? ""}>
            <option value="">All types</option>
            {activityTypes.map((item) => <option key={item} value={item}>{recordNames[item]}</option>)}
          </select></label>
          <button className="button button-primary">Filter history</button>
          {(ref || type) && <Link className="button button-secondary" href={activityHref({ file }, 1)}>Clear filters</Link>}
        </form>
        {activity.entries.length ? (
          <ol className="history-list">
            {activity.entries.map((entry) => (
              <li key={entry.id} className="table-card history-entry">
                <div className="history-entry-heading">
                  <div><h2>{recordNames[entry.record_type]} {entry.operation}</h2><p>{entry.label}</p></div>
                  <time dateTime={entry.happened_at}>{timestamp.format(new Date(entry.happened_at))}</time>
                </div>
                {entry.file_ref && entry.file_ref !== entry.label && <p className="history-reference">File reference {entry.file_ref}</p>}
                <ActivityDetails entry={entry} directory={directory} />
                {entry.file_id && !file && <Link className="project-detail-link history-file-link" href={activityHref({ file: entry.file_id }, 1)}>File history</Link>}
              </li>
            ))}
          </ol>
        ) : <div className="empty-state"><h2>No activity found</h2><p>New changes appear here after they are saved.</p></div>}
        {(page > 1 || activity.hasNextPage) && <nav className="history-pagination" aria-label="Activity pages">
          {page > 1 && <Link className="button button-secondary" href={activityHref(filters, page - 1)}>Newer activity</Link>}
          {activity.hasNextPage && <Link className="button button-secondary" href={activityHref(filters, page + 1)}>Older activity</Link>}
        </nav>}
      </div>
    </AppShell>
  );
}
