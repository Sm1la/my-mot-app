-- Create the browser workspace without inserting sample files.
create or replace function public.seed_demo_workspace() returns void
language sql security invoker
set search_path = ''
as $$
  insert into public.demo_workspaces default values on conflict (owner_key) do nothing;
$$;
