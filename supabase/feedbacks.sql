-- Run this in the Supabase SQL Editor for the project used by FlamePredict.
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  page_path text not null check (char_length(page_path) <= 500),
  selected_text text not null check (char_length(selected_text) between 1 and 5000),
  comment text not null check (char_length(trim(comment)) between 1 and 3000),
  display_name text not null default 'Anonymous' check (char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

alter table public.feedbacks enable row level security;

revoke all on table public.feedbacks from public, anon, authenticated;
grant select on table public.feedbacks to anon;
grant insert (page_path, selected_text, comment, display_name)
  on table public.feedbacks to anon;

drop policy if exists "Anyone can read feedback" on public.feedbacks;
create policy "Anyone can read feedback"
  on public.feedbacks for select to anon using (true);

drop policy if exists "Anyone can submit feedback" on public.feedbacks;
create policy "Anyone can submit feedback"
  on public.feedbacks for insert to anon
  with check (
    char_length(page_path) <= 500
    and char_length(selected_text) between 1 and 5000
    and char_length(trim(comment)) between 1 and 3000
    and char_length(display_name) <= 80
  );
