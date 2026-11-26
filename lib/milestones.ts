export const motMilestones = [
  { key: "mot_received_on", label: "Form 14A (MOT) received" },
  { key: "mot_executed_on", label: "Form 14A (MOT) executed" },
  { key: "title_released_on", label: "Title released to lawyer" },
  { key: "title_registered_on", label: "Title registered" },
] as const;

export type MotMilestoneDates = Record<(typeof motMilestones)[number]["key"], string | null>;

export function getLatestMilestone(dates: MotMilestoneDates) {
  return motMilestones.findLast(({ key }) => dates[key]);
}
