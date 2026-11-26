create function public.ensure_standard_projects() returns void
language plpgsql security invoker
set search_path = ''
as $$
declare
  project_names constant text[] := array['Phase 1', 'Phase 1B', 'Low Cost Flat and Shop'];
begin
  perform public.ensure_aira_project();
  if current_user = 'authenticated' then
    insert into public.projects (user_id, company_id, name)
    select (select auth.uid()), 'selayang-mulia', name
    from unnest(project_names) as standard(name)
    on conflict (user_id, company_id, lower(btrim(name))) do nothing;
  elsif current_user = 'anon' then
    insert into public.demo_projects (company_id, name)
    select 'selayang-mulia', name
    from unnest(project_names) as standard(name)
    on conflict (owner_key, company_id, lower(btrim(name))) do nothing;
  end if;
end;
$$;

revoke all on function public.ensure_standard_projects() from public, anon, authenticated;
grant execute on function public.ensure_standard_projects() to anon, authenticated;

alter table public.files
  drop constraint files_check,
  add constraint files_project_block_check
    check (block_id is null or (project_id is not null and block_id in ('tower-a', 'tower-b', 'mawar', 'teratai')));
alter table public.demo_files
  drop constraint demo_files_check,
  add constraint demo_files_project_block_check
    check (block_id is null or (project_id is not null and block_id in ('tower-a', 'tower-b', 'mawar', 'teratai')));

alter function mot_private.check_aira_file_block() rename to check_file_project_block;

create or replace function mot_private.check_file_project_block() returns trigger
language plpgsql security invoker
set search_path = ''
as $$
declare
  project_company text;
  project_name text;
begin
  if new.block_id is null then
    return new;
  end if;

  if tg_table_name = 'files' then
    select company_id, lower(btrim(name)) into project_company, project_name
    from public.projects where id = new.project_id and user_id = new.user_id;
  else
    select company_id, lower(btrim(name)) into project_company, project_name
    from public.demo_projects where id = new.project_id and owner_key = new.owner_key;
  end if;

  if (project_company = 'selangor-properties' and project_name = 'aira residence damansara'
      and new.block_id in ('tower-a', 'tower-b'))
    or (project_company = 'selayang-mulia' and project_name = 'low cost flat and shop'
      and new.block_id in ('mawar', 'teratai')) then
    return new;
  end if;

  raise exception 'The chosen block does not belong to this project' using errcode = '23514';
end;
$$;

alter trigger check_aira_file_block on public.files rename to check_file_project_block;
alter trigger check_aira_demo_file_block on public.demo_files rename to check_demo_file_project_block;
