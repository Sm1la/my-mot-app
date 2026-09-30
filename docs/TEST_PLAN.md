# Test Plan

## v1 success scenario (manual)
1. Open app (no login) → File List renders with 3 seeded files.
2. Click "New File" → enter file_ref `PT-2024-0200`, address `12 Oak Avenue, Leeds`, notes → Save.
3. File appears in list with "0/0 signed" badge.
4. Click into the new file → purchaser table is empty, shows "No purchasers yet."
5. Click "Add Purchaser" → enter `John Smith` → Save → row appears with "Pending" badge.
6. Add `Mary Smith` and `Jane Doe` the same way → 3 pending purchasers.
7. Click "Mark signed" on John Smith → badge changes to "Signed", signing_date shows today.
8. Toggle "Follow-up needed" on Mary Smith → badge appears, enter follow-up note `Chase solicitor`.
9. Return to File List → file badge now shows "1/3 signed".
10. Refresh browser → all data persists, counts and statuses unchanged.

## Empty states
- Delete all files → File List shows "No files yet. Create your first file." with a CTA button.
- Open a file with zero purchasers → shows "No purchasers on this file yet. Add a purchaser."

## Error cases
- Submit New File with empty file_ref → inline validation error, no DB write.
- Submit New File with empty property_address → inline validation error.
- Try to delete a file → confirmation dialog appears → cancel → file still exists; confirm → file + purchasers removed, list updates.
- Simulate network error (offline) on save → inline error message with retry button.

## Loading states
- File List shows skeleton cards while fetching.
- Purchaser table shows skeleton rows while fetching.

## Permission (post lock-down)
- User A creates a file → User B logs in → User B does NOT see User A's file in the list.
- User B tries to access User A's file URL directly → gets 403 or redirect to their own file list.