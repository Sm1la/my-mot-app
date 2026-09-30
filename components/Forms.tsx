"use client";

import { useActionState, useState } from "react";
import { addPurchaserAction, updatePurchaserAction } from "@/lib/actions/purchasers";
import { createFileAction, deleteFileAction, updateFileAction } from "@/lib/actions/files";
import { deletePurchaserAction } from "@/lib/actions/purchasers";
import type { ActionState, Purchaser, TransferFile } from "@/lib/types";

const initialState: ActionState = {};

export function FileForm({ file }: { file?: TransferFile }) {
  const action = file ? updateFileAction : createFileAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="form-stack">
      {file && <input type="hidden" name="id" value={file.id} />}
      <label className="field"><span>File reference <b>*</b></span><input name="file_ref" defaultValue={file?.file_ref ?? ""} placeholder="e.g. PT-2024-0200" required maxLength={80} /></label>
      <label className="field"><span>Property address <b>*</b></span><input name="property_address" defaultValue={file?.property_address ?? ""} placeholder="Street, town or city" required maxLength={300} /></label>
      <label className="field"><span>Notes <em>Optional</em></span><textarea name="notes" defaultValue={file?.notes ?? ""} placeholder="Add any useful context about this transfer" rows={4} maxLength={2000} /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">Changes saved.</p>}
      <div className="form-actions"><button className="button button-primary" disabled={pending}>{pending ? "Saving…" : file ? "Save changes" : "Create file"}</button></div>
    </form>
  );
}

export function AddPurchaserForm({ fileId }: { fileId: string }) {
  const [state, formAction, pending] = useActionState(addPurchaserAction, initialState);
  return (
    <form action={formAction} className="add-purchaser-form">
      <input type="hidden" name="file_id" value={fileId} />
      <label className="sr-only" htmlFor="purchaser-name">Purchaser full name</label>
      <input id="purchaser-name" name="name" placeholder="Enter purchaser’s full name" required maxLength={180} />
      <button className="button button-primary" disabled={pending}>{pending ? "Adding…" : "+ Add purchaser"}</button>
      {state.error && <p className="form-error form-error-wide" role="alert">{state.error}</p>}
    </form>
  );
}

export function DeleteFileButton({ id, purchaserCount }: { id: string; purchaserCount: number }) {
  return <form action={deleteFileAction} onSubmit={(event) => {
    if (!window.confirm(`Delete this file and its ${purchaserCount} purchaser${purchaserCount === 1 ? "" : "s"}? This can’t be undone.`)) event.preventDefault();
  }}><input type="hidden" name="id" value={id} /><button className="button button-danger-quiet">Delete file</button></form>;
}

export function DeletePurchaserButton({ id, fileId, name }: { id: string; fileId: string; name: string }) {
  return <form action={deletePurchaserAction} onSubmit={(event) => {
    if (!window.confirm(`Remove ${name} from this file?`)) event.preventDefault();
  }}><input type="hidden" name="id" value={id} /><input type="hidden" name="file_id" value={fileId} /><button className="icon-action danger-text" aria-label={`Delete ${name}`} title="Delete purchaser">×</button></form>;
}

export function EditFileDetails({ file }: { file: TransferFile }) {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <button className="button button-secondary" onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Close edit" : "Edit file"}</button>
    {isOpen && <div className="inline-editor"><h3>Edit file details</h3><FileForm file={file} /></div>}
  </>;
}

export function EditPurchaserForm({ purchaser, fileId }: { purchaser: Purchaser; fileId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updatePurchaserAction, initialState);
  return <>
    <button className="icon-action" aria-label={`Edit ${purchaser.name}`} title="Edit purchaser" onClick={() => setIsOpen(!isOpen)}>✎</button>
    {isOpen && <div className="purchaser-editor"><form action={formAction} className="form-stack">
      <input type="hidden" name="id" value={purchaser.id} /><input type="hidden" name="file_id" value={fileId} />
      <label className="field"><span>Purchaser name</span><input name="name" defaultValue={purchaser.name} required maxLength={180} /></label>
      <label className="field"><span>Follow-up note <em>Optional</em></span><textarea name="follow_up_notes" defaultValue={purchaser.follow_up_notes ?? ""} rows={2} maxLength={1000} /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">Changes saved.</p>}
      <button className="button button-primary button-small" disabled={pending}>{pending ? "Saving…" : "Save purchaser"}</button>
    </form></div>}
  </>;
}
