export type FileStatus = "open" | "closed";
export type SigningStatus = "pending" | "signed";

export type TransferFile = {
  id: string;
  file_ref: string;
  property_address: string;
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
