create function public.ensure_aira_project() returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    insert into public.projects (user_id, company_id, name)
    values ((select auth.uid()), 'selangor-properties', 'Aira Residence Damansara')
    on conflict (user_id, company_id, lower(btrim(name))) do nothing;
  elsif current_user = 'anon' then
    insert into public.demo_projects (company_id, name)
    values ('selangor-properties', 'Aira Residence Damansara')
    on conflict (owner_key, company_id, lower(btrim(name))) do nothing;
  end if;
end;
$$;

revoke all on function public.ensure_aira_project() from public, anon, authenticated;
grant execute on function public.ensure_aira_project() to anon, authenticated;

alter table public.files add column block_id text
  check (block_id is null or (project_id is not null and block_id in ('tower-a', 'tower-b')));
alter table public.demo_files add column block_id text
  check (block_id is null or (project_id is not null and block_id in ('tower-a', 'tower-b')));

create function mot_private.check_aira_file_block() returns trigger
language plpgsql security invoker
set search_path = ''
as $$
declare
  belongs_to_aira boolean;
begin
  if new.block_id is null then
    return new;
  end if;

  if tg_table_name = 'files' then
    select exists (
      select 1 from public.projects
      where id = new.project_id and user_id = new.user_id
        and company_id = 'selangor-properties' and lower(btrim(name)) = 'aira residence damansara'
    ) into belongs_to_aira;
  else
    select exists (
      select 1 from public.demo_projects
      where id = new.project_id and owner_key = new.owner_key
        and company_id = 'selangor-properties' and lower(btrim(name)) = 'aira residence damansara'
    ) into belongs_to_aira;
  end if;

  if not belongs_to_aira then
    raise exception 'The chosen tower does not belong to this project' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function mot_private.check_aira_file_block() from public, anon, authenticated;

create trigger check_aira_file_block before insert or update of project_id, block_id on public.files
  for each row execute function mot_private.check_aira_file_block();
create trigger check_aira_demo_file_block before insert or update of project_id, block_id on public.demo_files
  for each row execute function mot_private.check_aira_file_block();
