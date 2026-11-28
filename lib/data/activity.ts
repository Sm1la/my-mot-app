import { getWorkspace } from "@/lib/data/workspace";

export const activityTypes = ["file", "purchaser", "project"] as const;
export type ActivityType = (typeof activityTypes)[number];

export type ActivityFilters = { type?: ActivityType; file?: string; ref?: string };
type ActivityValue = string | boolean | number | null;

export type Activity = {
  id: string;
  happened_at: string;
  record_type: ActivityType;
  operation: "created" | "updated" | "deleted";
  file_id: string | null;
  label: string;
  file_ref: string | null;
  changes: Record<string, { from: ActivityValue; to: ActivityValue }>;
};

const pageSize = 25;

export async function getActivity(filters: ActivityFilters, page: number) {
  const { supabase } = await getWorkspace();
  const start = (page - 1) * pageSize;
  let query = supabase.from("mot_activity")
    .select("id, happened_at, record_type, operation, file_id, label, file_ref, changes")
    .order("happened_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + pageSize);

  if (filters.type) query = query.eq("record_type", filters.type);
  if (filters.file) query = query.eq("file_id", filters.file);
  if (filters.ref) query = query.ilike("file_ref", `%${filters.ref.replace(/[\\%_*]/g, "\\$&")}%`);
  const { data, error } = await query;
  if (error) throw new Error("Could not load activity history. Please try again.");
  return { entries: data.slice(0, pageSize) as Activity[], hasNextPage: data.length > pageSize };
}
