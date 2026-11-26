"use client";

import { useActionState } from "react";
import { WorkspaceField } from "@/components/Sidebar";
import { createProjectAction } from "@/lib/actions/projects";
import type { ActionState, Company } from "@/lib/types";

const initialState: ActionState = {};

export function ProjectForm({ companies, companyId }: { companies: Company[]; companyId?: string }) {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);
  return (
    <form action={formAction} className="form-card form-stack">
      <WorkspaceField />
      <label className="field">
        <span>Company</span>
        <select name="company_id" defaultValue={companyId ?? ""} required>
          <option value="" disabled>Choose a company</option>
          {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
      </label>
      <label className="field"><span>Project name</span><input name="name" maxLength={160} required /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <div className="form-actions"><button className="button button-primary" disabled={pending}>{pending ? "Adding…" : "Add project"}</button></div>
    </form>
  );
}
