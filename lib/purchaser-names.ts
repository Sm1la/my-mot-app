export function readPurchaserNames(formData: FormData) {
  const names = formData.getAll("name").flatMap((value) => typeof value === "string" && value.trim() ? [value.trim()] : []);
  if (names.some((name) => name.length > 180)) return { error: "Enter purchaser names of 180 characters or fewer." };
  if (new Set(names).size !== names.length) return { error: "Enter each purchaser name once." };
  return { names };
}
