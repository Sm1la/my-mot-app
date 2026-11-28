import { getWorkspace } from "@/lib/data/workspace";
import type { FileWithPurchasers } from "@/lib/types";

const demoSampleReferences = ["DEMO-001", "DEMO-002", "DEMO-003"];

export async function getFiles(): Promise<FileWithPurchasers[]> {
  const workspace = await getWorkspace();
  const { supabase } = workspace;
  const staffSamplePrefix = workspace.user?.id.replaceAll("-", "").slice(0, 8).toUpperCase();
  const sampleReferences = staffSamplePrefix
    ? ["01", "02", "03"].map((suffix) => `DEMO-${staffSamplePrefix}-${suffix}`)
    : demoSampleReferences;
  const { data, error } = await supabase
    .from(workspace.files)
    .select("id, file_ref, unit_no, spa_date, title_no, project_id, block_id, property_type, lawyer_name, status, notes, created_at, mot_received_on, mot_executed_on, title_released_on, title_registered_on")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load files. Please refresh and try again.");
  const files = (data ?? []).filter((file) => file.unit_no || file.project_id || !sampleReferences.includes(file.file_ref));
  if (!files.length) return [];

  const { data: purchasers, error: purchaserError } = await supabase
    .from(workspace.purchasers)
    .select("id, file_id, name, signing_status, signing_date, follow_up_needed, follow_up_notes, created_at")
    .in("file_id", files.map((file) => file.id))
    .order("created_at", { ascending: true });

  if (purchaserError) throw new Error("Could not load purchaser details. Please refresh and try again.");

  return files.map((file) => ({
    ...file,
    purchasers: (purchasers ?? []).filter((purchaser) => purchaser.file_id === file.id),
  })) as FileWithPurchasers[];
}

export async function getFile(id: string): Promise<FileWithPurchasers | null> {
  const files = await getFiles();
  return files.find((file) => file.id === id) ?? null;
}
