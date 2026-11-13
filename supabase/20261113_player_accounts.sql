-- The Motor Trade: one encrypted-in-transit, account-owned cloud career per user.
-- Run this whole file ONCE in Supabase Dashboard > SQL Editor > New query.
-- No service_role keys belong in GitHub Pages, ever.

create table if not exists public.motor_trade_careers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  career jsonb not null,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint motor_trade_career_object check (jsonb_typeof(career) = 'object'),
  constraint motor_trade_career_size check (octet_length(career::text) <= 4194304)
);

alter table public.motor_trade_careers enable row level security;
revoke all on table public.motor_trade_careers from public, anon, authenticated;
grant select on table public.motor_trade_careers to authenticated;

drop policy if exists "Players read only their own careers" on public.motor_trade_careers;
create policy "Players read only their own careers"
  on public.motor_trade_careers for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Authenticated players have SELECT only. A SECURITY DEFINER function is the
-- sole write path and derives user_id from their verified auth JWT, never input.
-- This enforces atomic compare-and-swap revisions across browsers/devices.
create or replace function public.motor_trade_save_career(
  expected_user_id uuid, expected_revision bigint, new_career jsonb
) returns table (revision bigint, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  if expected_user_id is distinct from actor then
    raise exception 'Account session changed' using errcode='42501';
  end if;
  if expected_revision is null or expected_revision < 0 then
    raise exception 'Invalid expected revision' using errcode='22023';
  end if;
  if new_career is null or jsonb_typeof(new_career) <> 'object'
     or octet_length(new_career::text) > 4194304 then
    raise exception 'Invalid or oversized career save' using errcode='22023';
  end if;

  return query
  insert into public.motor_trade_careers as existing
    (user_id, career, revision, updated_at)
  values (actor, new_career, 1, now())
  on conflict (user_id) do update
    set career = excluded.career,
        revision = existing.revision + 1,
        updated_at = now()
    where existing.revision = expected_revision
  returning existing.revision, existing.updated_at;
  -- No row returned = another browser has already saved a different revision.
end;
$$;

revoke all on function public.motor_trade_save_career(uuid,bigint,jsonb)
  from public, anon, authenticated;
grant execute on function public.motor_trade_save_career(uuid,bigint,jsonb)
  to authenticated;

-- A read-only readiness probe tells the static website whether its database
-- migration exists. It reveals no game records, email addresses or user IDs.
create or replace function public.motor_trade_cloud_ready()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select true; $$;
revoke all on function public.motor_trade_cloud_ready() from public;
grant execute on function public.motor_trade_cloud_ready() to anon, authenticated;

-- Verify in Table Editor: public.motor_trade_careers has RLS enabled.
-- Verify in Authentication > URL Configuration:
-- Site URL: https://billz2026.github.io/TheMotorTrade/
-- Redirect URL: https://billz2026.github.io/TheMotorTrade/**
-- Keep email confirmation ON for real users.
