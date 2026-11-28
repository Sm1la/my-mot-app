import Link from "next/link";
import { formatMonth } from "@/lib/dates";
import type { TransferFile } from "@/lib/types";

export function TitleReleaseSummary({ files, scopeHref, selectedMonth }: { files: TransferFile[]; scopeHref: string; selectedMonth?: string }) {
  const monthlyCounts = new Map<string, number>();
  for (const file of files) {
    if (!file.title_released_on) continue;
    const month = file.title_released_on.slice(0, 7);
    monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1);
  }

  const years = new Map<string, { total: number; months: { date: string; count: number }[] }>();
  for (const month of [...monthlyCounts.keys()].sort().reverse()) {
    const year = month.slice(0, 4);
    const entry = years.get(year) ?? { total: 0, months: [] };
    const count = monthlyCounts.get(month)!;
    entry.total += count;
    entry.months.push({ date: month, count });
    years.set(year, entry);
  }

  return (
    <section className="title-release-summary" aria-labelledby="title-release-heading">
      <h2 id="title-release-heading">Title releases by year and month</h2>
      {years.size === 0 ? <p className="release-summary-empty">No title releases recorded.</p> : (
        <div className="table-card register-scroll" role="region" aria-label="Title releases" tabIndex={0}>
          <table className="project-summary-table release-summary-table" aria-label="Title releases by year and month">
            <thead><tr><th scope="col">Release period</th><th scope="col">Titles released</th></tr></thead>
            {[...years].map(([year, { total, months }]) => (
              <tbody key={year}>
                <tr className="release-year"><th scope="row">{year} total</th><td>{total}</td></tr>
                {months.map(({ date, count }) => (
                  <tr key={date}>
                    <th scope="row"><Link href={`${scopeHref}&release=${date}#mot-register`} aria-current={date === selectedMonth ? "true" : undefined}>
                      {formatMonth(date)}
                    </Link></th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </section>
  );
}
