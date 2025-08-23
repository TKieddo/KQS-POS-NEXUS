-- POS Public Users & Branch Assignment Migration
-- Safe to run multiple times (idempotent where possible)

-- 1) Extensions (for hashing and UUIDs)
create extension if not exists pgcrypto with schema extensions;

-- 2) Tables
create table if not exists public.pos_public_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  pin_hash text not null,
  role text not null default 'cashier',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique username (case-insensitive)
create unique index if not exists pos_public_users_username_uq
  on public.pos_public_users (lower(username));

create table if not exists public.pos_public_user_branches (
  user_id uuid not null references public.pos_public_users(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, branch_id)
);

-- 3) Tighten default privileges: deny anon/auth direct table access (RPC will be used)
revoke all on table public.pos_public_users from anon, authenticated, public;
revoke all on table public.pos_public_user_branches from anon, authenticated, public;

-- Allow service role to manage data (for admin dashboards, backend jobs)
grant all on table public.pos_public_users to service_role;
grant all on table public.pos_public_user_branches to service_role;

-- 4) Row Level Security
alter table public.pos_public_users enable row level security;
alter table public.pos_public_user_branches enable row level security;

-- Deny everything by default (no policies for anon/auth to read these tables directly)
drop policy if exists "pos_public_users_noop" on public.pos_public_users;
create policy "pos_public_users_noop"
on public.pos_public_users
for all
to public
using (false)
with check (false);

drop policy if exists "pos_public_user_branches_noop" on public.pos_public_user_branches;
create policy "pos_public_user_branches_noop"
on public.pos_public_user_branches
for all
to public
using (false)
with check (false);

-- 5) Helper function to set/update PIN (hashing via pgcrypto)
create or replace function public.pos_set_pin(p_user_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pos_public_users
  set
    pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
    updated_at = now()
  where id = p_user_id;
end;
$$;

-- Allow service role to call set pin; do NOT grant to anon
revoke all on function public.pos_set_pin(uuid, text) from public, anon, authenticated;
grant execute on function public.pos_set_pin(uuid, text) to service_role;

-- 6) RPC to sign-in (username + pin + branch)
-- Returns NULL on failure or a jsonb with minimal user info on success
create or replace function public.pos_sign_in(
  p_username text,
  p_pin text,
  p_branch_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.pos_public_users%rowtype;
  v_allowed boolean;
begin
  -- Find active user by username (case-insensitive)
  select *
  into v_user
  from public.pos_public_users
  where lower(username) = lower(p_username)
    and is_active = true
  limit 1;

  if not found then
    return null;
  end if;

  -- Verify PIN (bcrypt)
  if extensions.crypt(p_pin, v_user.pin_hash) <> v_user.pin_hash then
    return null;
  end if;

  -- Ensure user is assigned to the branch
  select exists(
    select 1
    from public.pos_public_user_branches ub
    where ub.user_id = v_user.id
      and ub.branch_id = p_branch_id
  ) into v_allowed;

  if not v_allowed then
    return null;
  end if;

  return jsonb_build_object(
    'user_id', v_user.id,
    'username', v_user.username,
    'role', v_user.role
  );
end;
$$;

-- Allow anon (public POS) and authenticated to execute the RPC
revoke all on function public.pos_sign_in(text, text, uuid) from public;
grant execute on function public.pos_sign_in(text, text, uuid) to anon, authenticated;

-- 7) Helper to create a POS public user and assign branches (service role only)
create or replace function public.pos_create_public_user(
  p_username text,
  p_pin text,
  p_role text default 'cashier',
  p_branch_ids uuid[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
    begin
  insert into public.pos_public_users (username, pin_hash, role, is_active)
  values (
    p_username,
    extensions.crypt(p_pin, extensions.gen_salt('bf')),
    coalesce(p_role, 'cashier'),
    true
  )
  returning id into v_user_id;

  -- Branch assignment is intentionally handled outside this function (by API)

  return v_user_id;
end;
$$;

revoke all on function public.pos_create_public_user(text, text, text, uuid[]) from public, anon, authenticated;
grant execute on function public.pos_create_public_user(text, text, text, uuid[]) to service_role;

-- 8) (Optional) Seed example user (replace branch UUID as needed)
-- select public.pos_create_public_user('cashier1', '1234', 'cashier', array['00000000-0000-0000-0000-000000000001']::uuid[]);


