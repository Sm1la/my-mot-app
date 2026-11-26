"use client";

import { useActionState } from "react";
import { WorkspaceField } from "@/components/Sidebar";
import { updateMilestonesAction } from "@/lib/actions/files";
import { motMilestones, type MotMilestoneDates } from "@/lib/milestones";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function FileMilestones({ fileId, dates }: { fileId: string; dates: MotMilestoneDates }) {
  const [state, formAction, pending] = useActionState(updateMilestonesAction, initialState);

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
          {motMilestones.map(({ key, label }) => (
            <div key={`${key}:${dates[key] ?? ""}`}>
              <label className="field">
                <span>{label}</span>
                <input name={key} type="date" min="0001-01-01" max="9999-12-31" defaultValue={dates[key] ?? ""} readOnly={pending} />
              </label>
              <input type="hidden" name={`previous_${key}`} value={dates[key] ?? ""} />
            </div>
          ))}
        </div>
        <div className="milestone-actions">
          <button className="button button-primary" disabled={pending}>
            {pending ? "Saving…" : "Save milestone dates"}
          </button>
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.success && <p className="form-success" role="status">Milestone dates saved.</p>}
        </div>
      </form>
    </section>
  );
}
