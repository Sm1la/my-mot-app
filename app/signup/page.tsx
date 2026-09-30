import { AuthForm } from "@/components/AuthForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ checkEmail?: string }> }) {
  const params = await searchParams;
  return <AuthForm mode="signup" checkEmail={params.checkEmail === "1"} />;
}
