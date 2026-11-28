import type { Project } from "@/lib/types";

const standardProjects = [
  { company: "selangor-properties", name: "Aira Residence Damansara", blocks: [
    { id: "tower-a", name: "Tower A" },
    { id: "tower-b", name: "Tower B" },
  ] },
  { company: "selayang-mulia", name: "Phase 1", blocks: [] },
  { company: "selayang-mulia", name: "Phase 1B", blocks: [] },
  { company: "selayang-mulia", name: "Phase 1C", blocks: [] },
  { company: "selayang-mulia", name: "Low Cost Flat and Shop", blocks: [
    { id: "mawar", name: "Block A (Mawar)" },
    { id: "teratai", name: "Block B (Teratai)" },
  ] },
] as const;

type StandardProject = (typeof standardProjects)[number];
export type BlockId = StandardProject["blocks"][number]["id"];
const propertyTypes = [{ id: "flat", name: "Flat" }, { id: "shop", name: "Shop" }] as const;
export type PropertyType = (typeof propertyTypes)[number]["id"];

function matchesProject(project: Project, standard: StandardProject) {
  return project.company_id === standard.company && project.name.trim().toLowerCase() === standard.name.toLowerCase();
}

export function hasStandardProjects(projects: Project[]) {
  return standardProjects.every((standard) => projects.some((project) => matchesProject(project, standard)));
}

export function getStandardProjectOrder(project: Project) {
  const index = standardProjects.findIndex((standard) => matchesProject(project, standard));
  return index === -1 ? standardProjects.length : index;
}

export function getProjectBlocks(project?: Project) {
  return (project && standardProjects.find((standard) => matchesProject(project, standard))?.blocks) || [];
}

export function getPropertyTypes(blockId?: BlockId | null) {
  return blockId === "mawar" || blockId === "teratai" ? propertyTypes : [];
}

export function projectQuery(projectId: string, blockId?: BlockId | null, propertyType?: PropertyType | null) {
  return `?project=${projectId}${blockId ? `&block=${blockId}` : ""}${propertyType ? `&property=${propertyType}` : ""}`;
}
