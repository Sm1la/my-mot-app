import { cache } from "react";
import { getWorkspace } from "@/lib/data/workspace";
import type { ProjectDirectory } from "@/lib/types";

export const getProjectDirectory = cache(async (): Promise<ProjectDirectory> => {
  const { supabase, projects: projectTable } = await getWorkspace();
  const [companies, projects] = await Promise.all([
    supabase.from("companies").select("id, name").order("display_order"),
    supabase.from(projectTable).select("id, company_id, name").order("name"),
  ]);
  if (companies.error || projects.error) throw new Error("Could not load companies and projects. Please try again.");
  return { companies: companies.data, projects: projects.data };
});
