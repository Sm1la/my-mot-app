import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PasswordRecoveryForm } from "@/components/PasswordRecoveryForm";
import { passwordRecoveryCookie } from "@/lib/auth/recovery";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const recoveryUser = cookieStore.get(passwordRecoveryCookie)?.value;
  if (!recoveryUser) redirect("/login?error=auth");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id !== recoveryUser) redirect("/login?error=auth");

  return <PasswordRecoveryForm mode="reset" />;
}
