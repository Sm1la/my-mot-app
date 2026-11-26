"use client";

import { useActionState, useState } from "react";
import { WorkspaceField } from "@/components/Sidebar";
import { updateMilestonesAction } from "@/lib/actions/files";
import { motMilestones, type MotMilestoneDates } from "@/lib/milestones";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function FileMilestones({ fileId, dates }: { fileId: string; dates: MotMilestoneDates }) {
  const [draft, setDraft] = useState<Partial<MotMilestoneDates>>({});
  const [state, formAction, pending] = useActionState(async (previousState: ActionState, formData: FormData) => {
    const result = await updateMilestonesAction(previousState, formData);
    if (result.success) setDraft({});
    return result;
  }, initialState);
  const hasUnsavedChanges = motMilestones.some(({ key }) => draft[key] !== undefined && draft[key] !== dates[key]);

  return (
    <section className="detail-section" aria-labelledby="mot-milestones-title">
      <div className="section-heading">
        <div>
          <h2 id="mot-milestones-title">MOT milestones</h2>
          <p>Record each date as the transfer progresses.</p>
        </div>
      </div>
      <form action={formAction} className="form-card form-stack">
        <WorkspaceField />
        <input type="hidden" name="id" value={fileId} />
        <div className="milestone-fields">
          {motMilestones.map(({ key, label }) => {
            const value = draft[key] === undefined ? dates[key] : draft[key];
            return (
              <label key={key} className="field">
                <span>{label}</span>
                <input
                  name={value === dates[key] ? undefined : key}
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  value={value ?? ""}
                  readOnly={pending}
                  onChange={(event) => {
                    const nextValue = event.currentTarget.value || null;
                    setDraft((current) => ({ ...current, [key]: nextValue === dates[key] ? undefined : nextValue }));
                  }}
                />
              </label>
            );
          })}
        </div>
        <div className="milestone-actions">
          <button className="button button-primary" disabled={pending || !hasUnsavedChanges}>
            {pending ? "Saving…" : "Save milestone dates"}
          </button>
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.success && !hasUnsavedChanges && <p className="form-success" role="status">Milestone dates saved.</p>}
        </div>
      </form>
    </section>
  );
}
