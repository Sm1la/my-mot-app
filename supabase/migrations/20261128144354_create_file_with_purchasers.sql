create function public.create_file_with_purchasers(file_details jsonb, purchaser_names text[])
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  details public.files := jsonb_populate_record(null::public.files, file_details);
  new_file_id uuid;
  staff_id uuid := auth.uid();
begin
  if exists (
    select 1 from unnest(purchaser_names) as purchaser(name)
    where name is null or char_length(btrim(name)) not between 1 and 180
  ) then
    raise exception using errcode = '22023', message = 'Invalid purchaser name';
  end if;

  if current_user = 'anon' then
    insert into public.demo_files
      (unit_no, project_id, block_id, property_type, spa_date, title_no, lawyer_name, mot_received_on, title_released_on, notes)
    values
      (details.unit_no, details.project_id, details.block_id, details.property_type, details.spa_date, details.title_no,
       details.lawyer_name, details.mot_received_on, details.title_released_on, details.notes)
    returning id into new_file_id;

    insert into public.demo_purchasers (file_id, name)
    select new_file_id, btrim(name) from unnest(purchaser_names) as purchaser(name);
  elsif current_user = 'authenticated' and staff_id is not null then
    insert into public.files
      (user_id, unit_no, project_id, block_id, property_type, spa_date, title_no, lawyer_name, mot_received_on, title_released_on, notes)
    values
      (staff_id, details.unit_no, details.project_id, details.block_id, details.property_type, details.spa_date, details.title_no,
       details.lawyer_name, details.mot_received_on, details.title_released_on, details.notes)
    returning id into new_file_id;

    insert into public.purchasers (user_id, file_id, name)
    select staff_id, new_file_id, btrim(name) from unnest(purchaser_names) as purchaser(name);
  else
    raise insufficient_privilege;
  end if;

  return new_file_id;
end;
$$;

revoke all on function public.create_file_with_purchasers(jsonb, text[]) from public, anon, authenticated, service_role;
grant execute on function public.create_file_with_purchasers(jsonb, text[]) to anon, authenticated;
