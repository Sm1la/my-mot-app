"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActionWorkspace } from "@/lib/data/workspace";
import type { ActionState } from "@/lib/types";

export async function createProjectAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const companyId = String(formData.get("company_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!companyId) return { error: "Choose a company." };
  if (!name || name.length > 160) return { error: "Enter a project name of 1 to 160 characters." };

  const { supabase, projects, owner } = await getActionWorkspace(formData);
  const { data, error } = await supabase.from(projects)
    .insert({ company_id: companyId, name, ...owner })
    .select("id")
    .single();

  if (error?.code === "23505") return { error: "This company already has a project with that name." };
  if (error?.code === "23503") return { error: "Choose an existing company." };
  if (error || !data) return { error: "We couldn’t save this project. Please try again." };

  revalidatePath("/");
  redirect(`/?project=${data.id}`);
}
