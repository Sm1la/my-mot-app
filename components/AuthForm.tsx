"use client";

import Link from "next/link";
import { useActionState } from "react";
import { magicLinkAction, signInAction, signUpAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function AuthForm({ mode, checkEmail = false }: { mode: "login" | "signup"; checkEmail?: boolean }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [linkState, linkAction, linkPending] = useActionState(magicLinkAction, initialState);
  const signup = mode === "signup";
  return <div className="auth-page"><div className="auth-brand"><span className="brand-mark">14</span><div><strong>Form 14A</strong><small>Signing tracker</small></div></div><div className="auth-card">
    {checkEmail ? <><div className="auth-icon">✉</div><span className="eyebrow">CHECK YOUR INBOX</span><h1>Verify your email</h1><p className="auth-copy">If email confirmation is enabled, follow the link we sent to finish creating your account. Then sign in to manage your files.</p><Link className="button button-primary auth-submit" href="/login">Go to sign in</Link></> : <>
      <span className="eyebrow">SECURE WORKSPACE</span><h1>{signup ? "Create your account" : "Welcome back"}</h1><p className="auth-copy">{signup ? "Set up a secure space for your property transfer files." : "Sign in to continue tracking your Form 14A files."}</p>
      <form action={formAction} className="form-stack"><label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label><label className="field"><span>Password</span><input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "At least 8 characters" : "Enter your password"} minLength={signup ? 8 : undefined} required /></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="button button-primary auth-submit" disabled={pending}>{pending ? "Please wait…" : signup ? "Create account" : "Sign in"}</button></form>
      {!signup && <><div className="auth-divider"><span>or use a one-time link</span></div><form action={linkAction} className="magic-link-form"><label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>{linkState.error && <p className="form-error" role="alert">{linkState.error}</p>}{linkState.success && <p className="form-success" role="status">Sign-in link sent. Check your inbox.</p>}<button className="button button-secondary auth-submit" disabled={linkPending}>{linkPending ? "Sending…" : "Email me a sign-in link"}</button></form></>}
      <p className="auth-switch">{signup ? "Already have an account?" : "New to Form 14A?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create account"}</Link></p>
    </>}
  </div><p className="auth-footnote">Your files are private to your account.</p></div>;
}
