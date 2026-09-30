# Architecture

## Stack
Next.js (App Router) · Supabase (Postgres + RLS) · Vercel deployment.

## What to build now vs later
- **Now**: File CRUD, Purchaser CRUD, signing status toggle, follow-up flag, file list + detail views, demo seed data, responsive sidebar shell.
- **Later**: Auth + per-user RLS, follow-up reminders via email, file search, audit log, AI-assisted purchaser name extraction from file notes.

## Key user action flow
1. Staff opens File List → clicks "New File".
2. Enters file_ref + property_address + notes → file created.
3. On file detail page, adds purchasers by name.
4. Each purchaser shows "Pending" badge.
5. Staff clicks "Mark signed" → status flips to "Signed", signing_date set to today.
6. Staff toggles "Follow-up needed" on a purchaser, adds a note.
7. File list shows updated signed/total count badge.
8. Refresh confirms persistence.

## Responsive nav shell
Persistent left sidebar on desktop (Files, then per-file quick links). Collapses to hamburger menu on mobile. Current section highlighted. Two main pages: File List, File Detail.

## Layer plan
1. **Data layer** (`lib/data/`): all Supabase reads/writes for files + purchasers.
2. **App logic** (`lib/actions/`): server actions for create/update/delete file, add/update/delete purchaser, toggle signing, toggle follow-up.
3. **UI** (`app/` + `components/`): file list, file detail, purchaser table, forms, status badges.
4. **AI** (`lib/ai/`): later — parse free-text notes to suggest purchaser names.

## Why core runs without AI
The entire tracker is deterministic CRUD: create files, add purchasers, toggle status. No AI needed for any v1 action. AI added later only to pre-fill purchaser names from pasted notes.

## Repo structure
```
app/
  page.tsx                    # File List
  files/[id]/page.tsx         # File Detail
  files/new/page.tsx         # New File form
components/
  Sidebar.tsx
  FileCard.tsx
  PurchaserTable.tsx
  PurchaserForm.tsx
  StatusBadge.tsx
lib/
  data/files.ts              # data-access for files
  data/purchasers.ts         # data-access for purchasers
  actions/files.ts            # server actions: create/update/delete file
  actions/purchasers.ts       # server actions: add/update/delete/toggle purchaser
  ai/suggest-purchasers.ts   # later
  types.ts
supabase/
  client.ts
  middleware.ts
```

## Module map
| Module | Responsibility | Data it owns | Build order |
|--------|---------------|--------------|-------------|
| data/files | DB reads/writes for files | files table | 1 |
| data/purchasers | DB reads/writes for purchasers | purchasers table | 1 |
| actions/files | File create/update/delete + validation | calls data/files | 2 |
| actions/purchasers | Purchaser add/update/delete/toggle | calls data/purchasers | 2 |
| ui/file-list | File list page + filters | renders files | 3 |
| ui/file-detail | File detail + purchaser table | renders file+purchasers | 3 |
| ui/forms | New file + new purchaser forms | form state | 3 |
| ui/shell | Sidebar + responsive layout | nav state | 3 |