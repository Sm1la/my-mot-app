# Form 14A signing tracker

A Form 14A signing tracker with a public demo and a private staff workspace.

## Run locally

1. Install dependencies with Bun (`bun install`).
2. Link this project to Vercel and pull its development variables (`vercel link`, then `vercel env pull .env.local`).
3. Apply the SQL migrations in `supabase/migrations/` to the connected Supabase project in filename order.
4. Set the Supabase Auth site URL to the deployed app URL and add `<app-url>/auth/callback` to its allowed redirect URLs.
5. Run `bun dev` and open `http://localhost:3000`.

Visitors can open the home page and try the tracker without signing in. Each demo starts with sample files and saves changes in a separate workspace identified by a browser cookie. The cookie lasts 30 days. Use sample data only in the demo.

Staff can sign in from the sidebar to work with their own property files. Supabase row-level security separates staff records from demo records and keeps each workspace scoped to its owner.

## Core workflow

- Create a property file with its reference and address.
- Add each purchaser who needs to sign Form 14A.
- Mark purchasers as signed and record the signing date automatically.
- Flag follow-up and keep the chase note with the purchaser.
- Filter files, review completion, and reopen the record after refreshing.

## Environment variables

The browser uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL`. They are pulled from the linked Vercel project into `.env.local`; do not commit that file. The Supabase service-role key is not used by this app.
