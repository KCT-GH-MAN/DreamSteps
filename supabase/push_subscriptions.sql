create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  reminder_time time not null default '20:00',
  morning_reminder_time time not null default '06:00',
  evening_reflection_time time not null default '21:00',
  reengage_after_days integer not null default 3 check (reengage_after_days between 1 and 30),
  timezone text not null default 'Asia/Bangkok',
  language text not null default 'vi' check (language in ('vi', 'en')),
  last_sent_date date,
  last_morning_sent_date date,
  last_evening_sent_date date,
  last_reengage_sent_date date,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions
  add column if not exists morning_reminder_time time not null default '06:00',
  add column if not exists evening_reflection_time time not null default '21:00',
  add column if not exists reengage_after_days integer not null default 3 check (reengage_after_days between 1 and 30),
  add column if not exists last_morning_sent_date date,
  add column if not exists last_evening_sent_date date,
  add column if not exists last_reengage_sent_date date,
  add column if not exists last_seen_at timestamptz not null default now();

update public.push_subscriptions
set
  evening_reflection_time = coalesce(evening_reflection_time, reminder_time),
  last_evening_sent_date = coalesce(last_evening_sent_date, last_sent_date),
  last_seen_at = coalesce(last_seen_at, updated_at, now());

create index if not exists push_subscriptions_reminder_idx
  on public.push_subscriptions (reminder_time, last_sent_date);

create index if not exists push_subscriptions_morning_idx
  on public.push_subscriptions (morning_reminder_time, last_morning_sent_date);

create index if not exists push_subscriptions_evening_idx
  on public.push_subscriptions (evening_reflection_time, last_evening_sent_date);

create index if not exists push_subscriptions_last_seen_idx
  on public.push_subscriptions (last_seen_at, last_reengage_sent_date);

alter table public.push_subscriptions enable row level security;

-- Keep this table private. Server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS.
drop policy if exists "No client access to push subscriptions" on public.push_subscriptions;
