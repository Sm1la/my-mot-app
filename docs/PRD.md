# Form 14A Signing Tracker — PRD

## Problem
Conveyancing staff track which purchasers on a property transfer file have signed Form 14A using spreadsheets and notes. There is no at-a-glance view of who has signed and who still needs to.

## Target user
Conveyancing or admin staff managing property transfer files.

## Core objects
- **File** — a property transfer file. Fields: file_ref, property_address, status (open/closed), notes.
- **Purchaser** — a person on a file who must sign Form 14A. Fields: name, signing_status (pending/signed), signing_date, follow_up_needed (bool), follow_up_notes, file_id.

## MVP (v1) — checklist
- [ ] Staff can create a file (file_ref + property_address + notes).
- [ ] Staff can add one or more purchasers to a file.
- [ ] Staff can mark a purchaser as signed, with signing_date auto-set.
- [ ] Staff can toggle follow-up needed + add follow-up notes per purchaser.
- [ ] File list page: all files, each showing signed/total purchaser count.
- [ ] File detail page: purchaser table with status badges, signing date, follow-up flags.
- [ ] Filter files by status (all / open / closed) and by needs follow-up.
- [ ] Edit and delete files and purchasers.
- [ ] Seed demo data so app renders immediately without login.

## Non-goals (v1)
- No Form 14A preparation or document generation.
- No legal advice features.
- No e-signatures or signing integration.
- No automatic reminders or email/SMS sending.
- No document filing or storage.

## Success criteria
Staff create a file, add 3 purchasers, mark 1 as signed, flag 1 for follow-up — then open the file list and instantly see "1/3 signed" with a clear visual of who is outstanding and who needs chasing. All changes persist after refresh.