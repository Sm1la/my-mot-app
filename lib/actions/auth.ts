"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { passwordRecoveryCookie, passwordRecoveryCookieOptions } from "@/lib/auth/recovery";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function signInAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "invalid_credentials") {
    return { error: "That email and password don’t match. Use Forgot password? to set a new password." };
  }
  if (error) return { error: "We couldn’t sign you in. Check your details and try again." };
  redirect("/");
}

export async function magicLinkAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${appUrl}/auth/callback` },
  });
  if (error?.code === "over_email_send_rate_limit") {
    return { error: "MOT has reached its email limit. Try requesting a new link later." };
  }
  if (error) return { error: "We couldn’t send a sign-in link. Check the address and try again." };
  return { success: true };
}

export async function requestPasswordResetAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/auth/callback` });
  if (error?.code === "over_email_send_rate_limit") {
    return { error: "MOT has reached its email limit. Try requesting a reset link later." };
  }
  if (error && error.code !== "user_not_found") {
    return { error: "We couldn’t request a reset link. Please try again later." };
  }
  return { success: true };
}

export async function resetPasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8) return { error: "Choose a password with at least 8 characters." };
  if (password !== confirmation) return { error: "The passwords don’t match." };

  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || cookieStore.get(passwordRecoveryCookie)?.value !== user.id) {
    return { error: "Open a fresh reset link to set your password." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === "same_password") return { error: "Choose a password you haven’t used for MOT." };
  if (error) return { error: "We couldn’t update your password. Try again or request a fresh link." };

  cookieStore.set(passwordRecoveryCookie, "", { ...passwordRecoveryCookieOptions, maxAge: 0 });
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?password=updated");
}

export async function signUpAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Choose a password with at least 8 characters." };
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${appUrl}/auth/callback` } });
  if (error) return { error: "We couldn’t create your account. Check your details and try again." };
  if (data.session) redirect("/");
  redirect("/signup?checkEmail=1");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
