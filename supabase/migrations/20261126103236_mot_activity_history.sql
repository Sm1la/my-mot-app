create table public.mot_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  owner_key text references public.demo_workspaces (owner_key) on delete cascade,
  happened_at timestamptz not null default clock_timestamp(),
  record_type text not null check (record_type in ('file', 'purchaser', 'project')),
  operation text not null check (operation in ('created', 'updated', 'deleted')),
  file_id uuid,
  label text not null,
  file_ref text,
  changes jsonb not null,
  check ((user_id is not null)::integer + (owner_key is not null)::integer = 1)
);

create index mot_activity_user_idx on public.mot_activity (user_id, happened_at desc, id desc);
create index mot_activity_demo_idx on public.mot_activity (owner_key, happened_at desc, id desc);
create index mot_activity_file_idx on public.mot_activity (file_id, happened_at desc, id desc);
alter table public.mot_activity enable row level security;

revoke all on public.mot_activity from public, anon, authenticated;
grant select (id, happened_at, record_type, operation, file_id, label, file_ref, changes)
  on public.mot_activity to anon, authenticated;

create policy mot_activity_staff on public.mot_activity for select to authenticated
  using (user_id = (select auth.uid()));
create policy mot_activity_demo on public.mot_activity for select to anon
  using (owner_key = (select mot_private.demo_owner_key()));

-- Only database triggers can write the audit row, using the owner of the affected record.
create function mot_private.record_mot_activity() returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  before_row jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  after_row jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  record_data jsonb := case when tg_op = 'DELETE' then before_row else after_row end;
  staff_id uuid := (record_data ->> 'user_id')::uuid;
  demo_owner text := record_data ->> 'owner_key';
  record_kind text;
  parent_id uuid;
  reference text;
  record_label text;
  diff jsonb;
begin
  -- Workspace removal cascades through history and should not produce new retained entries.
  if staff_id is not null then
    if not exists (select 1 from auth.users where id = staff_id) then return null; end if;
  elsif demo_owner is not null then
    if not exists (select 1 from public.demo_workspaces where owner_key = demo_owner) then return null; end if;
  else
    return null;
  end if;

  case tg_table_name
    when 'files', 'demo_files' then
      record_kind := 'file';
      parent_id := (record_data ->> 'id')::uuid;
      reference := record_data ->> 'file_ref';
      record_label := coalesce(nullif(record_data ->> 'unit_no', ''), reference);
    when 'purchasers', 'demo_purchasers' then
      record_kind := 'purchaser';
      parent_id := (record_data ->> 'file_id')::uuid;
      record_label := record_data ->> 'name';
      if staff_id is not null then
        select file_ref into reference from public.files where id = parent_id and user_id = staff_id;
      else
        select file_ref into reference from public.demo_files where id = parent_id and owner_key = demo_owner;
      end if;
    else
      record_kind := 'project';
      record_label := record_data ->> 'name';
  end case;

  before_row := jsonb_strip_nulls(before_row) - array['id', 'user_id', 'owner_key', 'created_at', 'file_id'];
  after_row := jsonb_strip_nulls(after_row) - array['id', 'user_id', 'owner_key', 'created_at', 'file_id'];
  select jsonb_object_agg(key, jsonb_build_object('from', before_row -> key, 'to', after_row -> key))
  into diff
  from jsonb_object_keys(before_row || after_row) as field(key)
  where (before_row -> key) is distinct from (after_row -> key);

  if diff is not null then
    insert into public.mot_activity (user_id, owner_key, record_type, operation, file_id, label, file_ref, changes)
    values (staff_id, demo_owner, record_kind,
      case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
      parent_id, record_label, reference, diff);
  end if;
  return null;
end;
$$;

revoke all on function mot_private.record_mot_activity() from public, anon, authenticated;

create trigger files_mot_activity after insert or update or delete on public.files
  for each row execute function mot_private.record_mot_activity();
create trigger demo_files_mot_activity after insert or update or delete on public.demo_files
  for each row execute function mot_private.record_mot_activity();
create trigger purchasers_mot_activity after insert or update or delete on public.purchasers
  for each row execute function mot_private.record_mot_activity();
create trigger demo_purchasers_mot_activity after insert or update or delete on public.demo_purchasers
  for each row execute function mot_private.record_mot_activity();
create trigger projects_mot_activity after insert or update or delete on public.projects
  for each row execute function mot_private.record_mot_activity();
create trigger demo_projects_mot_activity after insert or update or delete on public.demo_projects
  for each row execute function mot_private.record_mot_activity();
