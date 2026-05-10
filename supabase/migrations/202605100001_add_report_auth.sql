alter table public.reports
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.reports enable row level security;

drop policy if exists "Anyone can read reports" on public.reports;
create policy "Anyone can read reports"
  on public.reports for select
  using (true);

drop policy if exists "Users can insert their own reports" on public.reports;
create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
  on public.reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid() = user_id);
