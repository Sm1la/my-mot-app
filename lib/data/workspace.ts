import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { demoCookieName, isDemoToken } from "@/lib/demo-session";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const getWorkspace = cache(async () => {
  const user = await getCurrentUser();
  if (user) {
    return {
      supabase: await createClient(),
      mode: "staff" as const,
      user,
      files: "files",
      projects: "projects",
      purchasers: "purchasers",
      owner: { user_id: user.id },
    };
  }

  const token = (await cookies()).get(demoCookieName)?.value;
  if (!isDemoToken(token)) throw new Error("Open the tracker again to start a demo workspace.");

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { "x-mot-demo-token": token } },
    },
  );
  const { error } = await supabase.rpc("seed_demo_workspace");
  if (error) throw new Error("Could not prepare your demo files. Please try again.");

  return {
    supabase,
    mode: "demo" as const,
    files: "demo_files",
    projects: "demo_projects",
    purchasers: "demo_purchasers",
    owner: {},
  };
});

export async function getActionWorkspace(formData: FormData) {
  const workspace = await getWorkspace();
  if (formData.get("workspace") !== workspace.mode) {
    throw new Error("Your workspace changed. Reload the page and try again.");
  }
  return workspace;
}
