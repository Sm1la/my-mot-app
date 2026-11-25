create schema mot_private;
revoke all on schema mot_private from public, anon, authenticated;
grant usage on schema mot_private to anon;

-- PostgREST supplies the request headers. Only a hash of the browser token is stored.
create function mot_private.demo_owner_key() returns text
language sql stable security invoker
set search_path = ''
as $$
  select case when token ~ '^[0-9a-f]{64}$'
    then pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(token, 'UTF8')), 'hex')
  end
  from (
    select nullif(pg_catalog.current_setting('request.headers', true), '')::jsonb
      ->> 'x-mot-demo-token' as token
  ) request
$$;

revoke all on function mot_private.demo_owner_key() from public, anon, authenticated;
grant execute on function mot_private.demo_owner_key() to anon;

create table public.demo_workspaces (
  owner_key text primary key default mot_private.demo_owner_key(),
  created_at timestamptz not null default now()
);

create table public.demo_files (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null default mot_private.demo_owner_key()
    references public.demo_workspaces (owner_key) on delete cascade,
  file_ref text not null check (char_length(btrim(file_ref)) between 1 and 80),
  property_address text not null check (char_length(btrim(property_address)) between 1 and 300),
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  unique (owner_key, file_ref),
  unique (owner_key, id)
);

create table public.demo_purchasers (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null default mot_private.demo_owner_key(),
  file_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 180),
  signing_status text not null default 'pending' check (signing_status in ('pending', 'signed')),
  signing_date date,
  follow_up_needed boolean not null default false,
  follow_up_notes text check (char_length(follow_up_notes) <= 1000),
  created_at timestamptz not null default now(),
  unique (file_id, name),
  foreign key (owner_key, file_id) references public.demo_files (owner_key, id) on delete cascade
);

create index demo_purchasers_owner_file_idx on public.demo_purchasers (owner_key, file_id);

alter table public.demo_workspaces enable row level security;
alter table public.demo_files enable row level security;
alter table public.demo_purchasers enable row level security;

revoke all on public.demo_workspaces, public.demo_files, public.demo_purchasers from public, anon, authenticated;
grant select, insert on public.demo_workspaces to anon;
grant select, insert, update, delete on public.demo_files, public.demo_purchasers to anon;

create policy demo_workspace_owner on public.demo_workspaces for all to anon
  using (owner_key = (select mot_private.demo_owner_key()))
  with check (owner_key = (select mot_private.demo_owner_key()));
create policy demo_file_owner on public.demo_files for all to anon
  using (owner_key = (select mot_private.demo_owner_key()))
  with check (owner_key = (select mot_private.demo_owner_key()));
create policy demo_purchaser_owner on public.demo_purchasers for all to anon
  using (owner_key = (select mot_private.demo_owner_key()))
  with check (owner_key = (select mot_private.demo_owner_key()));

-- Create and seed each workspace in one transaction, including concurrent first visits.
create function public.seed_demo_workspace() returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  insert into public.demo_workspaces default values on conflict (owner_key) do nothing;
  if not found then
    return;
  end if;

  with sample_files as (
    insert into public.demo_files (file_ref, property_address, status, notes) values
      ('DEMO-001', '12 Example Avenue, Kuala Lumpur', 'open', 'Sample transfer with two purchasers.'),
      ('DEMO-002', '34 Sample Road, Petaling Jaya', 'open', 'Sample transfer with three purchasers.'),
      ('DEMO-003', '7 Example Lane, Shah Alam', 'closed', 'Sample transfer with signatures complete.')
    returning id, file_ref
  )
  insert into public.demo_purchasers (file_id, name, signing_status, signing_date, follow_up_needed, follow_up_notes)
  select sample_files.id, sample.name, sample.status, sample.signing_date, sample.follow_up, sample.note
  from (values
    ('DEMO-001', 'Sample Purchaser A', 'signed', date '2026-01-14', false, null::text),
    ('DEMO-001', 'Sample Purchaser B', 'pending', null::date, true, 'Check whether the purchaser is available this week.'),
    ('DEMO-002', 'Sample Purchaser C', 'signed', date '2026-01-16', false, null),
    ('DEMO-002', 'Sample Purchaser D', 'pending', null, false, null),
    ('DEMO-002', 'Sample Purchaser E', 'pending', null, false, null),
    ('DEMO-003', 'Sample Purchaser F', 'signed', date '2026-01-10', false, null),
    ('DEMO-003', 'Sample Purchaser G', 'signed', date '2026-01-10', false, null)
  ) as sample(file_ref, name, status, signing_date, follow_up, note)
  join sample_files using (file_ref);
end;
$$;

revoke all on function public.seed_demo_workspace() from public, anon, authenticated;
grant execute on function public.seed_demo_workspace() to anon;
