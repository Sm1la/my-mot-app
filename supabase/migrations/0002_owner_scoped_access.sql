alter table public.files
  drop constraint if exists files_user_id_fkey;
alter table public.files
  add constraint files_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.purchasers
  drop constraint if exists purchasers_user_id_fkey;
alter table public.purchasers
  add constraint purchasers_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

drop policy if exists "files_v1_read" on public.files;
drop policy if exists "files_v1_write" on public.files;
drop policy if exists "purchasers_v1_read" on public.purchasers;
drop policy if exists "purchasers_v1_write" on public.purchasers;
drop policy if exists "files_owner_select" on public.files;
drop policy if exists "files_owner_insert" on public.files;
drop policy if exists "files_owner_update" on public.files;
drop policy if exists "files_owner_delete" on public.files;
drop policy if exists "purchasers_owner_select" on public.purchasers;
drop policy if exists "purchasers_owner_insert" on public.purchasers;
drop policy if exists "purchasers_owner_update" on public.purchasers;
drop policy if exists "purchasers_owner_delete" on public.purchasers;

create policy "files_owner_select" on public.files
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "files_owner_insert" on public.files
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "files_owner_update" on public.files
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "files_owner_delete" on public.files
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "purchasers_owner_select" on public.purchasers
  for select to authenticated using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.files f where f.id = file_id and f.user_id = (select auth.uid()))
  );
create policy "purchasers_owner_insert" on public.purchasers
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.files f where f.id = file_id and f.user_id = (select auth.uid()))
  );
create policy "purchasers_owner_update" on public.purchasers
  for update to authenticated using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.files f where f.id = file_id and f.user_id = (select auth.uid()))
  ) with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.files f where f.id = file_id and f.user_id = (select auth.uid()))
  );
create policy "purchasers_owner_delete" on public.purchasers
  for delete to authenticated using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.files f where f.id = file_id and f.user_id = (select auth.uid()))
  );
