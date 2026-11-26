"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActionWorkspace } from "@/lib/data/workspace";
import { motMilestones, type MotMilestoneDates } from "@/lib/milestones";
import type { ActionState } from "@/lib/types";

export async function createFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const project_id = String(formData.get("project_id") ?? "") || null;
  const lawyer_name = String(formData.get("lawyer_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };
  if (lawyer_name.length > 180) return { error: "Enter a lawyer name of 180 characters or fewer." };

  const { supabase, files, owner } = await getActionWorkspace(formData);
  const { data, error } = await supabase
    .from(files)
    .insert({ file_ref, property_address, project_id, lawyer_name: lawyer_name || null, notes: notes || null, status: "open", ...owner })
    .select("id")
    .single();

  if (error?.code === "23503") return { error: "Choose a project from this workspace." };
  if (error || !data) return { error: "We couldn’t save this file. Check your connection and try again." };
  revalidatePath("/");
  redirect(`/files/${data.id}`);
}

export async function updateFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const projectId = formData.get("project_id");
  const lawyerName = formData.get("lawyer_name");
  const lawyer_name = typeof lawyerName === "string" ? lawyerName.trim() : undefined;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) return { error: "This file could not be identified." };
  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };
  if (lawyer_name && lawyer_name.length > 180) return { error: "Enter a lawyer name of 180 characters or fewer." };

  const { supabase, files } = await getActionWorkspace(formData);
  const updates = {
    file_ref,
    property_address,
    notes: notes || null,
    ...(typeof projectId === "string" ? { project_id: projectId || null } : {}),
    ...(lawyer_name === undefined ? {} : { lawyer_name: lawyer_name || null }),
  };
  const { error } = await supabase.from(files).update(updates).eq("id", id);
  if (error?.code === "23503") return { error: "Choose a project from this workspace." };
  if (error) return { error: "We couldn’t update this file. Check your connection and try again." };
  revalidatePath("/");
  revalidatePath(`/files/${id}`);
  return { success: true };
}

export async function updateMilestonesAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "This file could not be identified." };

  const dates: Partial<MotMilestoneDates> = {};
  for (const { key, label } of motMilestones) {
    const value = formData.get(key);
    if (value === null || value === formData.get(`previous_${key}`)) continue;
    if (value === "") {
      dates[key] = null;
      continue;
    }
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) {
      return { error: `Enter a valid date for ${label}.` };
    }
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      return { error: `Enter a valid date for ${label}.` };
    }
    dates[key] = value;
  }
  if (Object.keys(dates).length === 0) return { success: true };

  const { supabase, files } = await getActionWorkspace(formData);
  const { data, error } = await supabase.from(files).update(dates).eq("id", id).select("id").maybeSingle();
  if (error || !data) return { error: "We couldn’t save the milestone dates. Please try again." };

  revalidatePath("/");
  revalidatePath(`/files/${id}`);
  return { success: true };
}

export async function toggleFileStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "open" && status !== "closed")) return;
  const { supabase, files } = await getActionWorkspace(formData);
  const { error } = await supabase.from(files).update({ status }).eq("id", id);
  if (error) throw new Error("Could not update file status.");
  revalidatePath("/");
  revalidatePath(`/files/${id}`);
}

export async function deleteFileAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase, files } = await getActionWorkspace(formData);
  const { error } = await supabase.from(files).delete().eq("id", id);
  if (error) throw new Error("File could not be deleted. Please try again.");
  revalidatePath("/");
  redirect("/");
}
