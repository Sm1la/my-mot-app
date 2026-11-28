import Link from "next/link";
import { RegistrationToggle } from "@/components/RegistrationToggle";
import { formatDate } from "@/lib/dates";
import type { FileWithPurchasers } from "@/lib/types";

const columns = ["No.", "Unit No.", "Purchaser Name", "SPA Date", "Title No", "MOT Lawyer", "MOT Received Date", "Date Released Title", "Registered", "Remarks"];

function RegisterDate({ value }: { value: string | null }) {
  return value ? <time dateTime={value}>{formatDate(value)}</time> : "—";
}

export function ProjectRegister({ files, hasFiles }: { files: FileWithPurchasers[]; hasFiles: boolean }) {
  return (
    <div className="table-card register-scroll" role="region" aria-label="Project register" tabIndex={0}>
      <table className="project-register" aria-label="MOT project register">
        <thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>
          {files.length === 0 && <tr><td className="register-empty" colSpan={columns.length}>{hasFiles ? "No files match these filters." : "No units recorded. Add a file to get started."}</td></tr>}
          {files.map((file, index) => (
            <tr key={file.id}>
              <td>{index + 1}</td>
              <th scope="row">
                <Link href={`/files/${file.id}`}>{file.unit_no || file.file_ref || "Set unit number"}</Link>
              </th>
              <td>{file.purchasers.length ? <ul>{file.purchasers.map((purchaser) => <li key={purchaser.id}>{purchaser.name}</li>)}</ul> : "—"}</td>
              <td className="register-date"><RegisterDate value={file.spa_date} /></td>
              <td>{file.title_no || "—"}</td>
              <td>{file.lawyer_name || "—"}</td>
              <td className="register-date"><RegisterDate value={file.mot_received_on} /></td>
              <td className="register-date"><RegisterDate value={file.title_released_on} /></td>
              <td><RegistrationToggle fileId={file.id} label={file.unit_no || file.file_ref || "Unnumbered unit"} date={file.title_registered_on} /></td>
              <td className="register-remarks">{file.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
