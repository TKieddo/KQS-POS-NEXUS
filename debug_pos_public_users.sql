-- Debug POS Public Users Issue
-- Run these queries to identify the problem

-- 1. Check all POS public users
SELECT 
  id,
  username,
  role,
  is_active,
  created_at
FROM public.pos_public_users
ORDER BY created_at DESC;

-- 2. Check all branch assignments for POS users
SELECT 
  ppu.username,
  ppu.is_active,
  ppub.user_id,
  ppub.branch_id,
  b.name as branch_name
FROM public.pos_public_user_branches ppub
LEFT JOIN public.pos_public_users ppu ON ppub.user_id = ppu.id
LEFT JOIN public.branches b ON ppub.branch_id = b.id
ORDER BY ppu.username, b.name;

-- 3. Count branches per user (should match what you selected)
SELECT 
  ppu.username,
  COUNT(ppub.branch_id) as branch_count,
  array_agg(b.name ORDER BY b.name) as branch_names
FROM public.pos_public_users ppu
LEFT JOIN public.pos_public_user_branches ppub ON ppu.id = ppub.user_id
LEFT JOIN public.branches b ON ppub.branch_id = b.id
GROUP BY ppu.id, ppu.username
ORDER BY ppu.username;

-- 4. Check all available branches
SELECT id, name, is_active 
FROM public.branches 
ORDER BY name;

-- 5. Test the pos_sign_in function manually
-- Replace 'your_username', 'your_pin', and 'branch_id_here' with actual values
-- SELECT public.pos_sign_in('your_username', 'your_pin', 'branch_id_here'::uuid);

-- 6. Clear ALL branch assignments (DANGER: only run if you want to reset)
-- DELETE FROM public.pos_public_user_branches;

-- 7. Delete a specific user and recreate (replace 'username_here')
-- DELETE FROM public.pos_public_users WHERE username = 'username_here';
