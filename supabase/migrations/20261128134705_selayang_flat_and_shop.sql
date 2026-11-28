alter table public.files
  add column property_type text check (
    property_type is null
    or (property_type in ('flat', 'shop') and block_id is not null and block_id in ('mawar', 'teratai'))
  );

alter table public.demo_files
  add column property_type text check (
    property_type is null
    or (property_type in ('flat', 'shop') and block_id is not null and block_id in ('mawar', 'teratai'))
  );
