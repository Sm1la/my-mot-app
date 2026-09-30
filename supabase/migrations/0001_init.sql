create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  file_ref text not null,
  property_address text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, file_ref)
);

create unique index if not exists files_legacy_file_ref_key
  on public.files (file_ref) where user_id is null;

create table if not exists public.purchasers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  file_id uuid not null references public.files(id) on delete cascade,
  name text not null,
  signing_status text not null default 'pending' check (signing_status in ('pending', 'signed')),
  signing_date date,
  follow_up_needed boolean not null default false,
  follow_up_notes text,
  created_at timestamptz not null default now(),
  unique (file_id, name)
);

alter table public.files enable row level security;
drop policy if exists "files_v1_read" on public.files;
create policy "files_v1_read" on public.files for select using (true);
drop policy if exists "files_v1_write" on public.files;
create policy "files_v1_write" on public.files for all using (true) with check (true);

alter table public.purchasers enable row level security;
drop policy if exists "purchasers_v1_read" on public.purchasers;
create policy "purchasers_v1_read" on public.purchasers for select using (true);
drop policy if exists "purchasers_v1_write" on public.purchasers;
create policy "purchasers_v1_write" on public.purchasers for all using (true) with check (true);

insert into public.files (file_ref, property_address, status, notes) values
  ('PT-2024-0137', '12 Oak Avenue, Leeds', 'open', 'Standard residential transfer. Two joint purchasers.'),
  ('PT-2024-0152', '34 Kings Road, Manchester', 'open', 'Trustee purchase — three parties on title.'),
  ('PT-2024-0168', '7 Station Lane, York', 'closed', 'Completed transfer. All forms signed.')
on conflict do nothing;

insert into public.purchasers (file_id, name, signing_status, signing_date, follow_up_needed, follow_up_notes)
select f.id, seed.name, seed.signing_status, seed.signing_date, seed.follow_up_needed, seed.follow_up_notes
from (values
  ('PT-2024-0137', 'John Smith', 'signed', '2024-06-15'::date, false, null::text),
  ('PT-2024-0137', 'Mary Smith', 'pending', null::date, true, 'Solicitor chasing — no response since 10 June.'),
  ('PT-2024-0152', 'David Brown', 'signed', '2024-06-20'::date, false, null::text),
  ('PT-2024-0152', 'Sarah Brown', 'pending', null::date, false, null::text),
  ('PT-2024-0152', 'James Wilson (trustee)', 'pending', null::date, true, 'Trustee not yet contacted.'),
  ('PT-2024-0168', 'Robert Taylor', 'signed', '2024-05-10'::date, false, null::text),
  ('PT-2024-0168', 'Emma Taylor', 'signed', '2024-05-10'::date, false, null::text)
) as seed(file_ref, name, signing_status, signing_date, follow_up_needed, follow_up_notes)
join public.files f on f.file_ref = seed.file_ref
on conflict (file_id, name) do nothing;
