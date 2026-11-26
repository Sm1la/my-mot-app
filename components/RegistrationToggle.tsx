"use client";

import { useActionState } from "react";
import { WorkspaceField } from "@/components/Sidebar";
import { toggleRegistrationAction } from "@/lib/actions/files";
import { formatDate } from "@/lib/dates";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function RegistrationToggle({ fileId, label, date }: { fileId: string; label: string; date: string | null }) {
  const [state, action, pending] = useActionState(toggleRegistrationAction, initialState);
  return (
    <form action={action} className="register-registration">
      <WorkspaceField />
      <input type="hidden" name="id" value={fileId} />
      <input type="hidden" name="previous_registration_date" value={date ?? ""} />
      <button
        type="submit"
        role="checkbox"
        aria-checked={!!date}
        aria-label={`Registered for ${label}`}
        title={date ? "Clear registration date" : "Mark registered today"}
        className="register-check"
        disabled={pending}
      >
        <span aria-hidden="true">{date ? "✓" : ""}</span>
      </button>
      {date && <time dateTime={date}>{formatDate(date)}</time>}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  );
}
