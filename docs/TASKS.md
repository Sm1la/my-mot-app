# Tasks

## Sprint 1 — Database + Core CRUD (v1 functional milestone)
**Goal**: Staff can create files, add purchasers, toggle signing status, and see everything at a glance — no login required.

- [ ] Create Supabase tables `files` + `purchasers` with constraints + seed data (migration SQL).
- [ ] Build `lib/data/files.ts` + `lib/data/purchasers.ts` data-access layer.
- [ ] Build server actions: create/update/delete file, add/update/delete purchaser, toggle signing, toggle follow-up.
- [ ] Build responsive sidebar shell (desktop sidebar / mobile hamburger).
- [ ] Build File List page with signed/total count badges + status filter.
- [ ] Build File Detail page with purchaser table, status badges, signing date, follow-up toggle.
- [ ] Build New File form + Add Purchaser inline form.
- [ ] Build Edit/Delete for files and purchasers with confirm dialogs.
- [ ] Seed 3 demo files with realistic purchasers (mix of signed/pending/follow-up).

**Definition of Done**: Staff can create a file, add 3 purchasers, mark 1 signed, flag 1 for follow-up, refresh the page, and see the correct signed/total count and status badges — all persisted in Supabase, no dead buttons, no login required.

## Sprint 2 — Polish + Edge Cases
**Goal**: Handle empty/error/loading states and refine UX.

- [ ] Loading skeletons for file list and purchaser table.
- [ ] Empty states: "No files yet — create your first file." / "No purchasers on this file yet."
- [ ] Error states: failed save shows inline error + retry.
- [ ] Filter by "needs follow-up" on file list.
- [ ] Sort file list by creation date + by completion %.
- [ ] Confirm file list is responsive on mobile.

**Definition of Done**: Every screen handles loading/empty/error gracefully; filters and sort work; no unhandled error states.

## Sprint 3 — Lock It Down
**Goal**: Add auth + per-user data isolation.

- [ ] Add Supabase Auth (email/password + magic link).
- [ ] Set `user_id` on file/purchaser create from `auth.uid()`.
- [ ] Replace permissive RLS with owner-scoped policies (`auth.uid() = user_id`).
- [ ] Redirect unauthenticated users to login; homepage is still the file list once logged in.
- [ ] Seed data visible only to a demo user.

**Definition of Done**: Logged-in user sees only their own files + purchasers; anonymous access blocked; no data leakage between users.

## Sprint 4 — Intelligence + Automation (later)
**Goal**: AI purchaser suggestions + follow-up scoring.

- [ ] `ai_suggestions` table + `suggest_purchasers` tool.
- [ ] Paste-notes → suggested purchaser names (low risk, auto-draft).
- [ ] File completion scoring + follow-up urgency ranking.
- [ ] Auto-close file when all purchasers signed (medium risk, light approval).

## Gantt
```
S1: DB + CRUD + UI     ████
S2: Polish + edges     ██
S3: Auth + RLS         ██
S4: AI + scoring      ████
```

**v1 functional milestone = end of Sprint 1.**