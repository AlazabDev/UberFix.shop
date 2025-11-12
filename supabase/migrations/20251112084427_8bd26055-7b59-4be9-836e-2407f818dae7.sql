-- جدول سجل تاريخ القفل
create table if not exists public.app_control_history (
  id uuid primary key default gen_random_uuid(),
  is_locked boolean not null,
  message text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.app_control_history enable row level security;

create policy "Admins can view lock history"
  on public.app_control_history for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert lock history"
  on public.app_control_history for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- تحديث سياسات الكتابة لجدول app_control للـadmins فقط
drop policy if exists write_all_temp on public.app_control;

create policy "Admins can update app control"
  on public.app_control for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- دالة لتسجيل التغييرات تلقائياً
create or replace function log_app_control_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_control_history (is_locked, message, changed_by)
  values (new.is_locked, new.message, auth.uid());
  return new;
end;
$$;

create trigger on_app_control_update
  after update on public.app_control
  for each row
  execute function log_app_control_change();