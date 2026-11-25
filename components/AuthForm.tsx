"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { PasswordField } from "@/components/PasswordField";
import { magicLinkAction, signInAction, signUpAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

function EmailSignIn() {
  const [state, formAction, pending] = useActionState(magicLinkAction, initialState);

  return (
    <details className="auth-alternative">
      <summary>Sign in with a one-time link</summary>
      <form action={formAction} className="form-stack">
        <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label>
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        {state.success && <p className="form-success" role="status">Sign-in link sent. Open the newest email in this browser.</p>}
        <button className="button button-secondary" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
      </form>
    </details>
  );
}

export function AuthForm({
  mode,
  checkEmail = false,
  invalidLink = false,
  passwordUpdated = false,
}: {
  mode: "login" | "signup";
  checkEmail?: boolean;
  invalidLink?: boolean;
  passwordUpdated?: boolean;
}) {
  const signup = mode === "signup";
  const [state, formAction, pending] = useActionState(signup ? signUpAction : signInAction, initialState);

  if (checkEmail) {
    return (
      <AuthScreen>
        <h1 id="auth-title">Verify your email</h1>
        <p className="auth-copy">Open the link in your inbox to finish creating your account.</p>
        <Link className="button button-primary auth-submit" href="/login">Go to sign in</Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <h1 id="auth-title">{signup ? "Create your account" : "Sign in"}</h1>
      <p className="auth-copy">{signup ? "Set up your Form 14A workspace." : "Manage property files and Form 14A signatures."}</p>
      {passwordUpdated && <p className="form-success" role="status">Password updated. Sign in with your new password.</p>}
      {invalidLink && <p className="form-error" role="alert">This link is invalid or expired. Request a new link and open it in the same browser.</p>}
      <form action={formAction} className="form-stack">
        <label className="field">
          <span>{signup ? "Email address" : "Username"}</span>
          <input name="email" type="email" autoComplete="username" placeholder="Email address" required />
        </label>
        <PasswordField isNew={signup} />
        {!signup && <Link className="auth-forgot" href="/forgot-password">Forgot password?</Link>}
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <button className="button button-primary auth-submit" disabled={pending}>
          {pending ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
      </form>
      {!signup && <EmailSignIn />}
      <p className="auth-switch">
        {signup ? "Already have an account?" : "New user?"}{" "}
        <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link>
      </p>
    </AuthScreen>
  );
}
