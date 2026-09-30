import { createClient } from "@/lib/supabase/server";
import type { Purchaser } from "@/lib/types";

export async function getPurchasers(fileId: string): Promise<Purchaser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchasers")
    .select("id, file_id, name, signing_status, signing_date, follow_up_needed, follow_up_notes, created_at")
    .eq("file_id", fileId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load purchasers. Please refresh and try again.");
  return (data ?? []) as Purchaser[];
}
