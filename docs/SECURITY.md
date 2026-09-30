# Security

## Secret handling
- Supabase service key (if needed for server actions) lives ONLY in server-side env vars — never in client bundle.
- Client uses anon key via `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe for browser.
- No secrets in `.env.local` committed to repo.

## Permission model
- **v1 (demo-first)**: RLS enabled but permissive — all reads/writes allowed so anonymous visitors can view and interact with seed data. No login wall.
- **Lock-down sprint**: replace permissive policies with `auth.uid() = user_id` on every table. Users see only their own files and purchasers. Server actions validate ownership before any mutation.
- Agent (later) inherits the logged-in user's permissions — can only act on rows where `user_id = auth.uid()`.

## Approved-tools rule
- All mutations go through named server actions in `lib/actions/`. No raw SQL from client components.
- Later AI actions use named tools only (`suggest_purchasers`, `accept_suggestion`, etc.) — never a generic `run_any` or `send_any`.

## Audit principle
- Every create/update/delete of a file or purchaser goes through a server action that can be logged.
- v1: rely on Supabase default logging + `created_at` timestamps.
- Later: explicit `audit_logs` table for all mutations.

## Data safety
- Deleting a file cascade-deletes its purchasers (app-level guard in v1; DB cascade at lock-down).
- No destructive action fires without a confirmation step in the UI.
- Form submissions are validated server-side before DB write.