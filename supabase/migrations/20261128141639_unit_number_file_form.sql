alter table public.files
  alter column file_ref drop not null,
  alter column property_address drop not null,
  add constraint files_unit_or_reference_check
    check (file_ref is not null or coalesce(char_length(btrim(unit_no)), 0) between 1 and 80);

alter table public.demo_files
  alter column file_ref drop not null,
  alter column property_address drop not null,
  add constraint demo_files_unit_or_reference_check
    check (file_ref is not null or coalesce(char_length(btrim(unit_no)), 0) between 1 and 80);

-- Keep historical activity intact and use unit numbers to label new entries.
create or replace function mot_private.record_mot_activity() returns trigger
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
      reference := coalesce(nullif(record_data ->> 'unit_no', ''), record_data ->> 'file_ref');
      record_label := reference;
    when 'purchasers', 'demo_purchasers' then
      record_kind := 'purchaser';
      parent_id := (record_data ->> 'file_id')::uuid;
      record_label := record_data ->> 'name';
      if staff_id is not null then
        select coalesce(nullif(unit_no, ''), file_ref) into reference from public.files where id = parent_id and user_id = staff_id;
      else
        select coalesce(nullif(unit_no, ''), file_ref) into reference from public.demo_files where id = parent_id and owner_key = demo_owner;
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
