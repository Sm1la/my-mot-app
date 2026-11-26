alter table public.files
  add column mot_received_on date,
  add column mot_executed_on date,
  add column title_released_on date,
  add column title_registered_on date;

alter table public.demo_files
  add column mot_received_on date,
  add column mot_executed_on date,
  add column title_released_on date,
  add column title_registered_on date;
