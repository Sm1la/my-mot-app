import { createClient } from "@/lib/supabase/server";
import type { FileWithPurchasers } from "@/lib/types";

async function seedFirstLogin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError || user.user_metadata?.form14a_demo_seeded === true) return;

  const { count, error: countError } = await supabase.from("files").select("id", { count: "exact", head: true });
  if (countError) throw new Error("Could not check your workspace. Please refresh and try again.");

  if (count === 0) {
    const refBase = user.id.replaceAll("-", "").slice(0, 8).toUpperCase();
    const demoFiles = [
      { file_ref: `DEMO-${refBase}-01`, property_address: "12 Oak Avenue, Kuala Lumpur", status: "open", notes: "Standard residential transfer. Two joint purchasers." },
      { file_ref: `DEMO-${refBase}-02`, property_address: "34 Kings Road, Petaling Jaya", status: "open", notes: "Trustee purchase — three parties on title." },
      { file_ref: `DEMO-${refBase}-03`, property_address: "7 Station Lane, Shah Alam", status: "closed", notes: "Completed transfer. All forms signed." },
    ];
    const { data: insertedFiles, error: fileError } = await supabase.from("files").insert(demoFiles.map((file) => ({ ...file, user_id: user.id }))).select("id, file_ref");
    if (fileError) throw new Error("Could not prepare your sample workspace. Please refresh and try again.");

    const idFor = (index: number) => insertedFiles?.find((file) => file.file_ref === demoFiles[index].file_ref)?.id;
    const purchasers = [
      { file_id: idFor(0), name: "John Smith", signing_status: "signed", signing_date: "2024-06-15", follow_up_needed: false },
      { file_id: idFor(0), name: "Mary Smith", signing_status: "pending", signing_date: null, follow_up_needed: true, follow_up_notes: "Solicitor chasing — no response yet." },
      { file_id: idFor(1), name: "David Brown", signing_status: "signed", signing_date: "2024-06-20", follow_up_needed: false },
      { file_id: idFor(1), name: "Sarah Brown", signing_status: "pending", signing_date: null, follow_up_needed: false },
      { file_id: idFor(1), name: "James Wilson (trustee)", signing_status: "pending", signing_date: null, follow_up_needed: true, follow_up_notes: "Trustee not yet contacted." },
      { file_id: idFor(2), name: "Robert Taylor", signing_status: "signed", signing_date: "2024-05-10", follow_up_needed: false },
      { file_id: idFor(2), name: "Emma Taylor", signing_status: "signed", signing_date: "2024-05-10", follow_up_needed: false },
    ].filter((purchaser) => purchaser.file_id);

    const { error: purchaserError } = await supabase.from("purchasers").insert(purchasers.map((purchaser) => ({ ...purchaser, user_id: user.id })));
    if (purchaserError) throw new Error("Could not prepare sample purchasers. Please refresh and try again.");
  }

  const { error: metadataError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, form14a_demo_seeded: true } });
  if (metadataError) throw new Error("Could not finish preparing your workspace. Please refresh and try again.");
}

export async function getFiles(): Promise<FileWithPurchasers[]> {
  const supabase = await createClient();
  await seedFirstLogin(supabase);
  const { data: files, error } = await supabase
    .from("files")
    .select("id, file_ref, property_address, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load files. Please refresh and try again.");
  if (!files?.length) return [];

  const { data: purchasers, error: purchaserError } = await supabase
    .from("purchasers")
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
