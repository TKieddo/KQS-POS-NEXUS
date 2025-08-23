-- Enhanced POS Sign-in Function with Better Debugging
-- Run this in Supabase SQL Editor to replace the existing function

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
  v_debug_info jsonb;
begin
  -- Find active user by username (case-insensitive)
  select *
  into v_user
  from public.pos_public_users
  where lower(username) = lower(p_username)
    and is_active = true
  limit 1;

  -- Debug: Log attempt details (you can check Supabase logs)
  raise notice 'POS Sign-in attempt: username=%, branch_id=%, user_found=%', 
    p_username, p_branch_id, found;

  if not found then
    raise notice 'User not found or inactive: %', p_username;
    return null;
  end if;

  -- Verify PIN (bcrypt)
  if extensions.crypt(p_pin, v_user.pin_hash) <> v_user.pin_hash then
    raise notice 'Invalid PIN for user: %', p_username;
    return null;
  end if;

  -- Check branch assignment with debugging
  select exists(
    select 1
    from public.pos_public_user_branches ub
    where ub.user_id = v_user.id
      and ub.branch_id = p_branch_id
  ) into v_allowed;

  -- Debug: Check what branches this user is assigned to
  select jsonb_agg(
    jsonb_build_object(
      'branch_id', ub.branch_id,
      'branch_name', b.name
    )
  ) into v_debug_info
  from public.pos_public_user_branches ub
  left join public.branches b on b.id = ub.branch_id
  where ub.user_id = v_user.id;

  raise notice 'User % branches: %, requested branch: %, access allowed: %', 
    v_user.username, v_debug_info, p_branch_id, v_allowed;

  if not v_allowed then
    raise notice 'User % not assigned to branch %', v_user.username, p_branch_id;
    return null;
  end if;

  return jsonb_build_object(
    'user_id', v_user.id,
    'username', v_user.username,
    'role', v_user.role
  );
end;
$$;
