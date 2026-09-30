import { AppShell } from "@/components/Sidebar";

export default function Loading() {
  return <AppShell><div className="page-wrap" aria-label="Loading files"><div className="skeleton skeleton-heading" /><div className="overview-stats">{[1, 2, 3].map((item) => <div className="skeleton skeleton-stat" key={item} />)}</div><div className="skeleton skeleton-subheading" /><div className="file-grid">{[1, 2, 3].map((item) => <div className="skeleton skeleton-card" key={item} />)}</div></div></AppShell>;
}
