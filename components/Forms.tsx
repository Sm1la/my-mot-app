"use client";

import { Fragment, useActionState, useState } from "react";
import { WorkspaceField } from "@/components/Sidebar";
import { addPurchaserAction, updatePurchaserAction } from "@/lib/actions/purchasers";
import { createFileAction, deleteFileAction, updateFileAction } from "@/lib/actions/files";
import { deletePurchaserAction } from "@/lib/actions/purchasers";
import { getProjectBlocks, type BlockId } from "@/lib/project-blocks";
import type { ActionState, ProjectDirectory, Purchaser, TransferFile } from "@/lib/types";

const initialState: ActionState = {};

export function FileForm({ file, directory, projectId, blockId }: { file?: TransferFile; directory: ProjectDirectory; projectId?: string; blockId?: BlockId }) {
  const action = file ? updateFileAction : createFileAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedProject = file?.project_id ?? projectId;
  const selectedBlock = file?.block_id ?? blockId;
  const selectedLocation = selectedProject ? `${selectedProject}${selectedBlock ? `:${selectedBlock}` : ""}` : "";
  return (
    <form action={formAction} className="form-stack">
      <WorkspaceField />
      {file && <input type="hidden" name="id" value={file.id} />}
      <label className="field"><span>File reference <b>*</b></span><input name="file_ref" defaultValue={file?.file_ref ?? ""} placeholder="e.g. PT-2024-0200" required maxLength={80} /></label>
      <label className="field"><span>Property address <b>*</b></span><input name="property_address" defaultValue={file?.property_address ?? ""} placeholder="Street, town or city" required maxLength={300} /></label>
      <label className="field">
        <span>Project or tower <em>Optional</em></span>
        <select name="project_location" defaultValue={selectedLocation}>
          <option value="">No project</option>
          {directory.companies.map((company) => {
            const projects = directory.projects.filter((project) => project.company_id === company.id);
            if (!projects.length) return null;
            return <optgroup key={company.id} label={company.name}>
              {projects.map((project) => <Fragment key={project.id}>
                <option value={project.id}>{project.name}</option>
                {getProjectBlocks(project).map((block) => <option key={block.id} value={`${project.id}:${block.id}`}>{project.name} / {block.name}</option>)}
              </Fragment>)}
            </optgroup>;
          })}
        </select>
      </label>
      <div className="register-fields">
        <label className="field"><span>Unit No. <em>Optional</em></span><input name="unit_no" defaultValue={file?.unit_no ?? ""} maxLength={80} /></label>
        <label className="field"><span>SPA Date <em>Optional</em></span><input name="spa_date" type="date" min="0001-01-01" max="9999-12-31" defaultValue={file?.spa_date ?? ""} /></label>
        <label className="field"><span>Title No. <em>Optional</em></span><input name="title_no" defaultValue={file?.title_no ?? ""} maxLength={120} /></label>
        <label className="field"><span>MOT Lawyer <em>Optional</em></span><input name="lawyer_name" defaultValue={file?.lawyer_name ?? ""} maxLength={180} /></label>
        {!file && <>
          <label className="field"><span>MOT Received Date <em>Optional</em></span><input name="mot_received_on" type="date" min="0001-01-01" max="9999-12-31" /></label>
          <label className="field"><span>Date Released Title <em>Optional</em></span><input name="title_released_on" type="date" min="0001-01-01" max="9999-12-31" /></label>
        </>}
      </div>
      <label className="field"><span>Remarks <em>Optional</em></span><textarea name="notes" defaultValue={file?.notes ?? ""} rows={4} maxLength={2000} /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">Changes saved.</p>}
      <div className="form-actions"><button className="button button-primary" disabled={pending}>{pending ? "Saving…" : file ? "Save changes" : "Create file"}</button></div>
    </form>
  );
}

export function AddPurchaserForm({ fileId, multiple = false }: { fileId: string; multiple?: boolean }) {
  const [state, formAction, pending] = useActionState(addPurchaserAction, initialState);
  const [extraFields, setExtraFields] = useState(0);
  return (
    <form action={formAction} className={multiple ? "form-stack batch-purchaser-form" : "add-purchaser-form"}>
      <WorkspaceField />
      <input type="hidden" name="file_id" value={fileId} />
      {multiple ? <div className="register-fields">
        {Array.from({ length: 3 + extraFields }, (_, index) => (
          <label key={index} className="field"><span>Purchaser {index + 1} name</span><input name="name" maxLength={180} /></label>
        ))}
      </div> : <>
        <label className="sr-only" htmlFor="purchaser-name">Purchaser full name</label>
        <input id="purchaser-name" name="name" placeholder="Enter purchaser’s full name" required maxLength={180} />
      </>}
      <div className={multiple ? "batch-purchaser-actions" : undefined}>
        <button className="button button-primary" disabled={pending}>{pending ? "Adding…" : multiple ? "Add purchasers" : "+ Add purchaser"}</button>
        {multiple && <button type="button" className="button button-secondary" onClick={() => setExtraFields((count) => count + 1)}>+ Add another name</button>}
      </div>
      {state.error && <p className="form-error form-error-wide" role="alert">{state.error}</p>}
    </form>
  );
}

export function DeleteFileButton({ id, purchaserCount }: { id: string; purchaserCount: number }) {
  return <form action={deleteFileAction} onSubmit={(event) => {
    if (!window.confirm(`Delete this file and its ${purchaserCount} purchaser${purchaserCount === 1 ? "" : "s"}? This can’t be undone.`)) event.preventDefault();
  }}><WorkspaceField /><input type="hidden" name="id" value={id} /><button className="button button-danger-quiet">Delete file</button></form>;
}

export function DeletePurchaserButton({ id, fileId, name }: { id: string; fileId: string; name: string }) {
  return <form action={deletePurchaserAction} onSubmit={(event) => {
    if (!window.confirm(`Remove ${name} from this file?`)) event.preventDefault();
  }}><WorkspaceField /><input type="hidden" name="id" value={id} /><input type="hidden" name="file_id" value={fileId} /><button className="icon-action danger-text" aria-label={`Delete ${name}`} title="Delete purchaser">×</button></form>;
}

export function EditFileDetails({ file, directory }: { file: TransferFile; directory: ProjectDirectory }) {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <button className="button button-secondary" onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Close edit" : "Edit file"}</button>
    {isOpen && <div className="inline-editor"><h3>Edit file details</h3><FileForm file={file} directory={directory} /></div>}
  </>;
}

export function EditPurchaserForm({ purchaser, fileId }: { purchaser: Purchaser; fileId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updatePurchaserAction, initialState);
  return <>
    <button className="icon-action" aria-label={`Edit ${purchaser.name}`} title="Edit purchaser" onClick={() => setIsOpen(!isOpen)}>✎</button>
    {isOpen && <div className="purchaser-editor"><form action={formAction} className="form-stack">
      <WorkspaceField />
      <input type="hidden" name="id" value={purchaser.id} /><input type="hidden" name="file_id" value={fileId} />
      <label className="field"><span>Purchaser name</span><input name="name" defaultValue={purchaser.name} required maxLength={180} /></label>
      <label className="field"><span>Follow-up note <em>Optional</em></span><textarea name="follow_up_notes" defaultValue={purchaser.follow_up_notes ?? ""} rows={2} maxLength={1000} /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">Changes saved.</p>}
      <button className="button button-primary button-small" disabled={pending}>{pending ? "Saving…" : "Save purchaser"}</button>
    </form></div>}
  </>;
}
