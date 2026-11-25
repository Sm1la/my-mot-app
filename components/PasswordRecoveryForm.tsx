"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { PasswordField } from "@/components/PasswordField";
import { requestPasswordResetAction, resetPasswordAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function PasswordRecoveryForm({ mode }: { mode: "request" | "reset" }) {
  const request = mode === "request";
  const [state, formAction, pending] = useActionState(request ? requestPasswordResetAction : resetPasswordAction, initialState);

  return (
    <AuthScreen>
      <h1 id="auth-title">{request ? "Reset your password" : "Set a new password"}</h1>
      <p className="auth-copy">{request ? "Enter your work email to request a reset link." : "Use at least 8 characters for your new password."}</p>
      {state.success ? (
        <p className="form-success" role="status">If the email is registered, a reset link will arrive shortly. Open it in this browser.</p>
      ) : (
        <form action={formAction} className="form-stack">
          {request ? (
            <label className="field"><span>Work email</span><input name="email" type="email" autoComplete="email" required /></label>
          ) : (
            <>
              <PasswordField label="New password" isNew />
              <PasswordField label="Confirm new password" name="confirmation" isNew />
            </>
          )}
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <button className="button button-primary auth-submit" disabled={pending}>
            {pending ? "Please wait…" : request ? "Email me a reset link" : "Save new password"}
          </button>
        </form>
      )}
      <p className="auth-switch"><Link href={request ? "/login" : "/forgot-password"}>{request ? "Back to sign in" : "Request another reset link"}</Link></p>
    </AuthScreen>
  );
}
