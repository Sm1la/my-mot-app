import type { FileWithPurchasers } from "@/lib/types";

export function countSignedPurchasers(file: Pick<FileWithPurchasers, "title_released_on" | "purchasers">) {
  if (file.title_released_on) return file.purchasers.length;
  return file.purchasers.filter((purchaser) => purchaser.signing_status === "signed").length;
}
