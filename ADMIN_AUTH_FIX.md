# 🔧 ADMIN AUTHENTICATION FIX GUIDE

## 🚨 Issues Fixed:

1. **Missing security_settings table** (404 error)
2. **RLS policy issues** with users table (406/403 errors)
3. **User profile creation** failing
4. **Old auth service** still being used

## 📋 Steps to Fix Admin Authentication:

### Step 1: Run the Security Settings Migration

1. **Copy and paste `create_security_settings.sql`** into Supabase SQL Editor
2. **Execute the script** - This creates the missing security_settings table

### Step 2: Verify Database Setup

Run this SQL to check your current setup:

```sql
-- Check if all required tables exist
SELECT 
  'user_roles' as table_name,
  COUNT(*) as record_count
FROM public.user_roles
UNION ALL
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM public.users
UNION ALL
SELECT 
  'security_settings' as table_name,
  COUNT(*) as record_count
FROM public.security_settings
UNION ALL
SELECT 
  'branches' as table_name,
  COUNT(*) as record_count
FROM public.branches;
```

### Step 3: Create Supabase Auth User

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add User"**
3. Create: `tsebisohenrytuke@gmail.com` (password: `admin123`)

### Step 4: Test Admin Login

1. Visit `http://localhost:3002/admin`
2. Login with `tsebisohenrytuke@gmail.com` + `admin123`
3. The system will automatically create a user profile with super_admin role

## 🔍 What Was Fixed:

### 1. **Security Settings Table**
- Created missing `security_settings` table
- Added proper RLS policies
- Inserted default settings for all branches

### 2. **Updated Auth Service**
- LoginForm and login page now use unified auth service
- Automatic user profile creation for new Supabase Auth users
- Better error handling

### 3. **User Profile Auto-Creation**
- When a Supabase Auth user logs in for the first time
- System automatically creates a profile in `public.users` table
- Assigns super_admin role by default

## 🎯 Expected Flow:

1. **User logs in** with Supabase Auth credentials
2. **System checks** if user exists in `public.users` table
3. **If not found**, creates default profile with super_admin role
4. **User gets access** to admin dashboard

## 🚨 If Still Having Issues:

### Check RLS Policies:
```sql
-- Verify RLS is working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_roles', 'security_settings');
```

### Check User Creation:
```sql
-- See if user was created
SELECT 
  u.email,
  u.full_name,
  r.name as role_name,
  u.is_active
FROM public.users u
JOIN public.user_roles r ON r.id = u.role_id
WHERE u.email = 'tsebisohenrytuke@gmail.com';
```

## 🎉 Success Indicators:

- ✅ No more 404 errors for security_settings
- ✅ No more 406/403 errors for users table
- ✅ User profile automatically created
- ✅ Admin dashboard access granted
- ✅ "User signed in successfully" message in console

**Run the security_settings migration and test the admin login again!** 🚀
