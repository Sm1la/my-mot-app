import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; password?: string }> }) {
  const { error, password } = await searchParams;
  return <AuthForm mode="login" invalidLink={error === "auth"} passwordUpdated={password === "updated"} />;
}
