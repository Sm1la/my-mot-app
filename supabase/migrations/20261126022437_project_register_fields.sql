alter table public.files
  add column unit_no text check (char_length(unit_no) <= 80),
  add column spa_date date,
  add column title_no text check (char_length(title_no) <= 120);

alter table public.demo_files
  add column unit_no text check (char_length(unit_no) <= 80),
  add column spa_date date,
  add column title_no text check (char_length(title_no) <= 120);
