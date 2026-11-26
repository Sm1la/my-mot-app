alter table public.files
  add column lawyer_name text check (char_length(lawyer_name) <= 180);

alter table public.demo_files
  add column lawyer_name text check (char_length(lawyer_name) <= 180);
