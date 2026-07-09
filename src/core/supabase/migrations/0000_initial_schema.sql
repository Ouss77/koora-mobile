-- =====================================================
-- KOORA V1 - Database Schema (Supabase PostgreSQL)
-- =====================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =====================
-- ENUMS
-- =====================
create type public.user_role as enum ('user', 'admin');
create type public.match_status as enum ('upcoming', 'locked', 'finished');
create type public.match_result as enum ('team1', 'draw', 'team2');

-- =====================
-- USERS
-- =====================
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    username varchar(20) not null unique,
    role public.user_role not null default 'user',
    created_at timestamptz not null default now()
);

-- =====================
-- MATCHES
-- =====================
create table public.matches (
    id uuid primary key default gen_random_uuid(),
    team1 text not null,
    team2 text not null,
    kickoff_at timestamptz not null,
    status public.match_status not null default 'upcoming',
    result public.match_result,
    created_at timestamptz not null default now(),
    check (team1 <> team2)
);

-- =====================
-- PREDICTIONS
-- =====================
create table public.predictions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    match_id uuid not null references public.matches(id) on delete cascade,
    prediction public.match_result not null,
    points_awarded integer not null default 0 check (points_awarded >= 0),
    created_at timestamptz not null default now(),
    constraint uq_prediction unique(user_id, match_id)
);

-- =====================
-- INDEXES
-- =====================
create index idx_users_username on public.users(username);
create index idx_matches_kickoff on public.matches(kickoff_at);
create index idx_predictions_user on public.predictions(user_id);
create index idx_predictions_match on public.predictions(match_id);

-- =====================
-- RLS
-- =====================
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

create policy "Users can read own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Authenticated users can read matches"
on public.matches
for select
to authenticated
using (true);

create policy "Users manage own predictions"
on public.predictions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Admin policies should be added later using a role check function.
