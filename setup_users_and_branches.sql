-- =====================================================
-- SETUP USERS AND BRANCH ASSIGNMENTS
-- Run this after the main migration
-- =====================================================

-- 1. First, let's see what branches you have
SELECT 'Available Branches:' as info;
SELECT id, name, address FROM public.branches;

-- 2. Let's see what users we have
SELECT 'Available Users:' as info;
SELECT email, full_name, role_id, pos_pin FROM public.users;

-- 3. Let's see what roles we have
SELECT 'Available Roles:' as info;
SELECT name, display_name, can_access_admin, can_access_pos FROM public.user_roles;

-- 4. Check if users are already assigned to branches
SELECT 'Current Branch Assignments:' as info;
SELECT 
  u.email,
  u.full_name,
  b.name as branch_name,
  ub.is_primary
FROM public.user_branches ub
JOIN public.users u ON u.id = ub.user_id
JOIN public.branches b ON b.id = ub.branch_id;

-- 5. If you need to assign users to branches, run this (replace YOUR_BRANCH_ID with actual branch ID)
-- First, get your branch ID from step 1 above, then uncomment and run:

/*
INSERT INTO public.user_branches (user_id, branch_id, is_primary) VALUES
(
  (SELECT id FROM public.users WHERE email = 'admin@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID from step 1
  true
),
(
  (SELECT id FROM public.users WHERE email = 'manager@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID from step 1
  true
),
(
  (SELECT id FROM public.users WHERE email = 'cashier@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID from step 1
  true
),
(
  (SELECT id FROM public.users WHERE email = 'pos@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID from step 1
  true
);
*/

-- 6. Test the authentication functions
SELECT 'Testing Authentication Functions:' as info;

-- Test get_user_with_role function
SELECT 'Testing get_user_with_role for admin@kqs.com:' as test;
SELECT public.get_user_with_role('admin@kqs.com');

-- Test POS authentication (replace with your actual branch ID)
SELECT 'Testing POS authentication for cashier@kqs.com:' as test;
-- SELECT public.authenticate_pos_user('cashier@kqs.com', '5678', 'YOUR_BRANCH_ID_HERE');

-- 7. Final verification
SELECT 'Setup Complete! Users ready for testing:' as status;
SELECT 
  u.email,
  u.full_name,
  r.display_name as role,
  u.pos_pin,
  CASE WHEN ub.user_id IS NOT NULL THEN '✅ Assigned' ELSE '❌ Not Assigned' END as branch_status
FROM public.users u
JOIN public.user_roles r ON r.id = u.role_id
LEFT JOIN public.user_branches ub ON ub.user_id = u.id
ORDER BY u.email;
