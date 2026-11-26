import { cache } from "react";
import { getWorkspace } from "@/lib/data/workspace";
import { getStandardProjectOrder, hasStandardProjects } from "@/lib/project-blocks";
import type { ProjectDirectory } from "@/lib/types";

export const getProjectDirectory = cache(async (): Promise<ProjectDirectory> => {
  const { supabase, projects: projectTable } = await getWorkspace();
  const listProjects = () => supabase.from(projectTable).select("id, company_id, name").order("name");
  const [companies, listedProjects] = await Promise.all([
    supabase.from("companies").select("id, name").order("display_order"),
    listProjects(),
  ]);
  if (companies.error || listedProjects.error) throw new Error("Could not load companies and projects. Please try again.");
  let projects = listedProjects.data;
  if (!hasStandardProjects(projects)) {
    const { error } = await supabase.rpc("ensure_standard_projects");
    if (error) throw new Error("Could not prepare the standard projects. Please try again.");
    const refreshed = await listProjects();
    if (refreshed.error) throw new Error("Could not load projects. Please try again.");
    projects = refreshed.data;
  }
  projects.sort((left, right) => getStandardProjectOrder(left) - getStandardProjectOrder(right));
  return { companies: companies.data, projects };
});
