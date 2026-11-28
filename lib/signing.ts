import type { FileWithPurchasers } from "@/lib/types";

export function countSignedPurchasers(file: Pick<FileWithPurchasers, "mot_received_on" | "purchasers">) {
  if (file.mot_received_on) return file.purchasers.length;
  return file.purchasers.filter((purchaser) => purchaser.signing_status === "signed").length;
}
