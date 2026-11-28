import type { MotMilestoneDates } from "@/lib/milestones";
import type { BlockId, PropertyType } from "@/lib/project-blocks";

export type FileStatus = "open" | "closed";
export type SigningStatus = "pending" | "signed";

export type Company = { id: string; name: string };
export type Project = { id: string; company_id: string; name: string };
export type ProjectDirectory = { companies: Company[]; projects: Project[] };

export type TransferFile = MotMilestoneDates & {
  id: string;
  file_ref: string | null;
  unit_no: string | null;
  spa_date: string | null;
  title_no: string | null;
  project_id: string | null;
  block_id: BlockId | null;
  property_type: PropertyType | null;
  lawyer_name: string | null;
  status: FileStatus;
  notes: string | null;
  created_at: string;
};

export type Purchaser = {
  id: string;
  file_id: string;
  name: string;
  signing_status: SigningStatus;
  signing_date: string | null;
  follow_up_needed: boolean;
  follow_up_notes: string | null;
  created_at: string;
};

export type FileWithPurchasers = TransferFile & { purchasers: Purchaser[] };
export type ActionState = { error?: string; success?: boolean };
