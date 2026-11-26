import type { Project } from "@/lib/types";

const airaBlocks = [
  { id: "tower-a", name: "Tower A" },
  { id: "tower-b", name: "Tower B" },
] as const;

export type BlockId = (typeof airaBlocks)[number]["id"];

export function isAiraProject(project: Project) {
  return project.company_id === "selangor-properties" && project.name.trim().toLowerCase() === "aira residence damansara";
}

export function getProjectBlocks(project?: Project) {
  return project && isAiraProject(project) ? airaBlocks : [];
}

export function projectQuery(projectId: string, blockId?: BlockId | null) {
  return `?project=${projectId}${blockId ? `&block=${blockId}` : ""}`;
}
