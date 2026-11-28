import { toggleFollowUp, toggleSigningStatus } from "@/lib/actions/purchasers";
import { formatDate } from "@/lib/dates";
import type { Purchaser } from "@/lib/types";
import { DeletePurchaserButton, EditPurchaserForm } from "@/components/Forms";
import { WorkspaceField } from "@/components/Sidebar";

export function PurchaserTable({ purchasers, fileId, releasedOn }: { purchasers: Purchaser[]; fileId: string; releasedOn: string | null }) {
  if (purchasers.length === 0) return <div className="empty-purchasers"><div className="empty-icon">♧</div><strong>No purchasers on this file yet</strong><span>Add the people who need to sign Form 14A.</span></div>;

  return <div className="table-scroll"><table className="purchaser-table">
    <thead><tr><th>Purchaser</th><th>Signing status</th><th>Follow-up</th><th><span className="sr-only">Actions</span></th></tr></thead>
    <tbody>{purchasers.map((purchaser) => <tr key={purchaser.id}>
      <td data-label="Purchaser">
        <div className="person-cell">
          <span className="avatar">{purchaser.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
          <span className="person-name">
            {purchaser.name}
            <small>{releasedOn ? `Title released ${formatDate(releasedOn)}` : purchaser.signing_status === "signed" && purchaser.signing_date ? `Signed ${formatDate(purchaser.signing_date)}` : "Form 14A"}</small>
          </span>
        </div>
      </td>
      <td data-label="Signing status">
        {releasedOn ? <span className="status-pill status-signed"><i />Signed</span> :
          <form action={toggleSigningStatus}><WorkspaceField /><input type="hidden" name="id" value={purchaser.id} /><input type="hidden" name="file_id" value={fileId} /><input type="hidden" name="next_status" value={purchaser.signing_status === "signed" ? "pending" : "signed"} /><button className={`status-pill status-button ${purchaser.signing_status === "signed" ? "status-signed" : "status-pending"}`} title={purchaser.signing_status === "signed" ? "Mark as pending" : "Mark as signed"}><i />{purchaser.signing_status === "signed" ? "Signed" : "Pending"}</button></form>}
      </td>
      <td data-label="Follow-up"><div className="followup-cell"><form action={toggleFollowUp}><WorkspaceField /><input type="hidden" name="id" value={purchaser.id} /><input type="hidden" name="file_id" value={fileId} /><input type="hidden" name="next_value" value={String(!purchaser.follow_up_needed)} /><button className={`followup-toggle ${purchaser.follow_up_needed ? "followup-on" : ""}`} aria-label={`${purchaser.follow_up_needed ? "Clear" : "Set"} follow-up for ${purchaser.name}`} title={purchaser.follow_up_needed ? "Follow-up needed" : "No follow-up needed"}><span /></button><span className={purchaser.follow_up_needed ? "followup-text-on" : "muted-text"}>{purchaser.follow_up_needed ? "Needed" : "None"}</span></form>{purchaser.follow_up_notes && <small className="followup-note">{purchaser.follow_up_notes}</small>}</div></td>
      <td className="row-actions"><EditPurchaserForm purchaser={purchaser} fileId={fileId} /><DeletePurchaserButton id={purchaser.id} fileId={fileId} name={purchaser.name} /></td>
    </tr>)}</tbody>
  </table></div>;
}
