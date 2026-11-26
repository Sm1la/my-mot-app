create table public.companies (
  id text primary key,
  name text not null unique,
  display_order smallint not null unique
);

insert into public.companies (id, name, display_order) values
  ('selangor-properties', 'Selangor Properties Sdn Bhd', 1),
  ('selayang-mulia', 'Selayang Mulia Sdn Bhd', 2),
  ('keruan-jaya', 'Keruan Jaya Sdn Bhd', 3);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id text not null references public.companies (id),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  unique (user_id, id)
);

create table public.demo_projects (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null default mot_private.demo_owner_key()
    references public.demo_workspaces (owner_key) on delete cascade,
  company_id text not null references public.companies (id),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  unique (owner_key, id)
);

create unique index projects_name_per_company
  on public.projects (user_id, company_id, lower(btrim(name)));
create unique index demo_projects_name_per_company
  on public.demo_projects (owner_key, company_id, lower(btrim(name)));

alter table public.files
  add column project_id uuid,
  add constraint files_project_requires_owner check (project_id is null or user_id is not null),
  add constraint files_project_owner_fkey
    foreign key (user_id, project_id) references public.projects (user_id, id);

alter table public.demo_files
  add column project_id uuid,
  add constraint demo_files_project_owner_fkey
    foreign key (owner_key, project_id) references public.demo_projects (owner_key, id);

create index files_project_id_idx on public.files (project_id) where project_id is not null;
create index demo_files_project_id_idx on public.demo_files (project_id) where project_id is not null;

alter table public.companies enable row level security;
alter table public.projects enable row level security;
alter table public.demo_projects enable row level security;

revoke all on public.companies, public.projects, public.demo_projects from public, anon, authenticated;
grant select on public.companies to anon, authenticated;
grant select, insert on public.projects to authenticated;
grant select, insert on public.demo_projects to anon;

create policy companies_read on public.companies for select to anon, authenticated using (true);
create policy projects_owner_read on public.projects for select to authenticated
  using (user_id = (select auth.uid()));
create policy projects_owner_create on public.projects for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy demo_projects_owner_read on public.demo_projects for select to anon
  using (owner_key = (select mot_private.demo_owner_key()));
create policy demo_projects_owner_create on public.demo_projects for insert to anon
  with check (owner_key = (select mot_private.demo_owner_key()));
