"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActionWorkspace } from "@/lib/data/workspace";
import { isCalendarDate } from "@/lib/dates";
import { motMilestones, type MotMilestoneDates } from "@/lib/milestones";
import type { ActionState } from "@/lib/types";

function readProjectLocation(formData: FormData) {
  const value = formData.get("project_location") ?? formData.get("project_id");
  if (typeof value !== "string") return {};
  const [projectId, blockId] = value.split(":", 2);
  return { project_id: projectId || null, block_id: blockId || null };
}

function readRegisterDetails(formData: FormData) {
  const fields = [
    { key: "unit_no", label: "unit number", maxLength: 80 },
    { key: "title_no", label: "title number", maxLength: 120 },
    { key: "spa_date", label: "SPA date" },
    { key: "mot_received_on", label: "MOT received date" },
    { key: "title_released_on", label: "date released title" },
  ] as const;
  const values: Partial<Record<(typeof fields)[number]["key"], string | null>> = {};
  for (const field of fields) {
    const entry = formData.get(field.key);
    if (typeof entry !== "string") continue;
    const value = entry.trim();
    if ("maxLength" in field && value.length > field.maxLength) {
      return { error: `Enter a ${field.label} of ${field.maxLength} characters or fewer.` };
    }
    if (!("maxLength" in field) && value && !isCalendarDate(value)) {
      return { error: `Enter a valid ${field.label}.` };
    }
    values[field.key] = value || null;
  }
  return { values };
}

export async function createFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const lawyer_name = String(formData.get("lawyer_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };
  if (lawyer_name.length > 180) return { error: "Enter a lawyer name of 180 characters or fewer." };
  const register = readRegisterDetails(formData);
  if (register.error) return { error: register.error };

  const { supabase, files, owner } = await getActionWorkspace(formData);
  const { data, error } = await supabase
    .from(files)
    .insert({ file_ref, property_address, ...readProjectLocation(formData), ...register.values, lawyer_name: lawyer_name || null, notes: notes || null, status: "open", ...owner })
    .select("id")
    .single();

  if (error?.code === "23503") return { error: "Choose a project from this workspace." };
  if (error?.code === "23514" && error.message.includes("chosen block")) return { error: "Choose a block that belongs to the selected project." };
  if (error || !data) return { error: "We couldn’t save this file. Check your connection and try again." };
  revalidatePath("/");
  redirect(`/files/${data.id}`);
}

export async function updateFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const file_ref = String(formData.get("file_ref") ?? "").trim();
  const property_address = String(formData.get("property_address") ?? "").trim();
  const lawyerName = formData.get("lawyer_name");
  const lawyer_name = typeof lawyerName === "string" ? lawyerName.trim() : undefined;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) return { error: "This file could not be identified." };
  if (!file_ref) return { error: "Enter a file reference." };
  if (!property_address) return { error: "Enter the property address." };
  if (lawyer_name && lawyer_name.length > 180) return { error: "Enter a lawyer name of 180 characters or fewer." };
  const register = readRegisterDetails(formData);
  if (register.error) return { error: register.error };

  const { supabase, files } = await getActionWorkspace(formData);
  const updates = {
    file_ref,
    property_address,
    notes: notes || null,
    ...readProjectLocation(formData),
    ...register.values,
    ...(lawyer_name === undefined ? {} : { lawyer_name: lawyer_name || null }),
  };
  const { error } = await supabase.from(files).update(updates).eq("id", id);
  if (error?.code === "23503") return { error: "Choose a project from this workspace." };
  if (error?.code === "23514" && error.message.includes("chosen block")) return { error: "Choose a block that belongs to the selected project." };
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
    if (typeof value !== "string" || !isCalendarDate(value)) {
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

export async function toggleRegistrationAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const previousDate = formData.get("previous_registration_date");
  if (!id || typeof previousDate !== "string" || (previousDate && !isCalendarDate(previousDate))) {
    return { error: "Reload the page and try again." };
  }

  const { supabase, files } = await getActionWorkspace(formData);
  const nextDate = previousDate ? null : new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Kuala_Lumpur" });
  const update = supabase.from(files).update({ title_registered_on: nextDate }).eq("id", id);
  const guardedUpdate = previousDate ? update.eq("title_registered_on", previousDate) : update.is("title_registered_on", null);
  const { data, error } = await guardedUpdate.select("id").maybeSingle();
  if (error) return { error: "Could not save registration. Try again." };

  revalidatePath("/");
  revalidatePath(`/files/${id}`);
  return data ? { success: true } : { error: "Registration changed. Check the current date and try again." };
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
