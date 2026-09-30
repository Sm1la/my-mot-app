# Form 14A signing tracker

A private workspace for conveyancing teams to track property files, purchaser signatures, and follow-up notes.

## Run locally

1. Install dependencies with Bun (`bun install`).
2. Link this project to Vercel and pull its development variables (`vercel link`, then `vercel env pull .env.local`).
3. Apply `supabase/migrations/0001_init.sql` and `supabase/migrations/0002_owner_scoped_access.sql` to the connected Supabase project, in order, using its SQL editor.
4. Set the Supabase Auth site URL to the deployed app URL and add `<app-url>/auth/callback` to its allowed redirect URLs.
5. Run `bun dev` and open `http://localhost:3000`.

The first login receives a small set of sample files so the signing tracker is immediately explorable. Users can edit or remove those files. Every created file and purchaser belongs to the signed-in Supabase user; row-level security enforces that ownership.

## Core workflow

- Create a property file with its reference and address.
- Add each purchaser who needs to sign Form 14A.
- Mark purchasers as signed and record the signing date automatically.
- Flag follow-up and keep the chase note with the purchaser.
- Filter files, review completion, and reopen the record after refreshing.

## Environment variables

The browser uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL`. They are pulled from the linked Vercel project into `.env.local`; do not commit that file. The Supabase service-role key is not used by this app.
