import { NextResponse } from "next/server";
import { passwordRecoveryCookie, passwordRecoveryCookieOptions } from "@/lib/auth/recovery";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const flowId = url.searchParams.get("sb_flow_id");
    let recovery = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") recovery = true;
    });
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
      if (!error && data.user) {
        const response = NextResponse.redirect(new URL(recovery ? "/reset-password" : "/", url.origin));
        if (recovery) {
          response.cookies.set(passwordRecoveryCookie, data.user.id, passwordRecoveryCookieOptions);
        }
        return response;
      }
    } finally {
      subscription.unsubscribe();
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
