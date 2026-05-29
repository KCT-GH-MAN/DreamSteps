create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  reminder_time time not null default '20:00',
  timezone text not null default 'Asia/Bangkok',
  language text not null default 'vi' check (language in ('vi', 'en')),
  last_sent_date date,
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_reminder_idx
  on public.push_subscriptions (reminder_time, last_sent_date);

alter table public.push_subscriptions enable row level security;

-- Keep this table private. Server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS.
drop policy if exists "No client access to push subscriptions" on public.push_subscriptions;
