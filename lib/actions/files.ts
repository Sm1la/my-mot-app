"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function createFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase
    .from("files")
    .insert({ file_ref, property_address, notes: notes || null, status: "open", user_id: user.id })
    .select("id")
    .single();

  if (error || !data) return { error: "We couldn’t save this file. Check your connection and try again." };
  revalidatePath("/");
  redirect(`/files/${data.id}`);
}

export async function updateFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) return { error: "This file could not be identified." };
  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };

  const supabase = await createClient();
  const { error } = await supabase.from("files").update({ file_ref, property_address, notes: notes || null }).eq("id", id);
  if (error) return { error: "We couldn’t update this file. Check your connection and try again." };
  revalidatePath("/");
  revalidatePath(`/files/${id}`);
  return { success: true };
}

export async function toggleFileStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "open" && status !== "closed")) return;
  const supabase = await createClient();
  const { error } = await supabase.from("files").update({ status }).eq("id", id);
  if (error) throw new Error("Could not update file status.");
  revalidatePath("/");
  revalidatePath(`/files/${id}`);
}

export async function deleteFileAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase.from("files").delete().eq("id", id);
  if (error) throw new Error("File could not be deleted. Please try again.");
  revalidatePath("/");
  redirect("/");
}
