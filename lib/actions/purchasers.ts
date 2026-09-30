"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function addPurchaserAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const fileId = String(formData.get("file_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!fileId) return { error: "This file could not be identified." };
  if (!name) return { error: "Enter the purchaser’s full name." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("purchasers").insert({ file_id: fileId, name, signing_status: "pending", user_id: user.id });
  if (error) return { error: "We couldn’t add this purchaser. Check your connection and try again." };
  revalidatePath(`/files/${fileId}`);
  revalidatePath("/");
  return { success: true };
}

export async function updatePurchaserAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const fileId = String(formData.get("file_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const follow_up_notes = String(formData.get("follow_up_notes") ?? "").trim();
  if (!id || !fileId) return { error: "This purchaser could not be identified." };
  if (!name) return { error: "Enter the purchaser’s full name." };

  const supabase = await createClient();
  const { error } = await supabase.from("purchasers").update({ name, follow_up_notes: follow_up_notes || null }).eq("id", id).eq("file_id", fileId);
  if (error) return { error: "We couldn’t update this purchaser. Check your connection and try again." };
  revalidatePath(`/files/${fileId}`);
  revalidatePath("/");
  return { success: true };
}

export async function toggleSigningStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const fileId = String(formData.get("file_id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "");
  if (!id || !fileId || (nextStatus !== "signed" && nextStatus !== "pending")) return;

  const supabase = await createClient();
  const { error } = await supabase.from("purchasers").update({
    signing_status: nextStatus,
    signing_date: nextStatus === "signed" ? new Date().toISOString().slice(0, 10) : null,
  }).eq("id", id).eq("file_id", fileId);
  if (error) throw new Error("Could not update signing status.");
  revalidatePath(`/files/${fileId}`);
  revalidatePath("/");
}

export async function toggleFollowUp(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const fileId = String(formData.get("file_id") ?? "");
  const nextValue = String(formData.get("next_value") ?? "");
  if (!id || !fileId || (nextValue !== "true" && nextValue !== "false")) return;
  const supabase = await createClient();
  const { error } = await supabase.from("purchasers").update({ follow_up_needed: nextValue === "true" }).eq("id", id).eq("file_id", fileId);
  if (error) throw new Error("Could not update follow-up status.");
  revalidatePath(`/files/${fileId}`);
  revalidatePath("/");
}

export async function deletePurchaserAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const fileId = String(formData.get("file_id") ?? "");
  if (!id || !fileId) return;
  const supabase = await createClient();
  const { error } = await supabase.from("purchasers").delete().eq("id", id).eq("file_id", fileId);
  if (error) throw new Error("Could not remove purchaser.");
  revalidatePath(`/files/${fileId}`);
  revalidatePath("/");
}
