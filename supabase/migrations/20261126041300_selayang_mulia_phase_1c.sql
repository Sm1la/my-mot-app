create or replace function public.ensure_standard_projects() returns void
language plpgsql security invoker
set search_path = ''
as $$
declare
  project_names constant text[] := array['Phase 1', 'Phase 1B', 'Phase 1C', 'Low Cost Flat and Shop'];
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
