# 🎯 UNIFIED AUTHENTICATION SETUP INSTRUCTIONS

## 📋 Complete Setup Guide

### Step 1: Run Database Migration

1. **Open Supabase SQL Editor**
2. **Copy and paste the entire contents of `complete_unified_auth_system.sql`**
3. **Execute the script** - This will:
   - Drop all existing auth tables (clean slate)
   - Create new unified user roles and users tables
   - Set up RLS policies
   - Create authentication functions
   - Insert default roles and sample users

### Step 2: Create Supabase Auth Users

In Supabase Dashboard → Authentication → Users, create these users:

```
1. admin@kqs.com
   - Password: admin123 (or choose strong password)
   - Role: super_admin (full access)

2. manager@kqs.com  
   - Password: manager123
   - Role: manager (admin + POS)

3. cashier@kqs.com
   - Password: cashier123  
   - PIN: 5678
   - Role: cashier (POS only)

4. pos@kqs.com
   - Password: pos123
   - PIN: 9999
   - Role: pos_only (POS only)
```

**How to create users in Supabase:**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"

### Step 3: Assign Users to Branches (Important!)

After creating the users, you need to assign them to branches. Run this SQL in Supabase SQL Editor:

```sql
-- Get your branch IDs first
SELECT id, name FROM public.branches;

-- Then assign users to branches (replace branch_id with your actual branch ID)
INSERT INTO public.user_branches (user_id, branch_id, is_primary) VALUES
(
  (SELECT id FROM public.users WHERE email = 'admin@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID
  true
),
(
  (SELECT id FROM public.users WHERE email = 'manager@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID
  true
),
(
  (SELECT id FROM public.users WHERE email = 'cashier@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID
  true
),
(
  (SELECT id FROM public.users WHERE email = 'pos@kqs.com'),
  'YOUR_BRANCH_ID_HERE', -- Replace with actual branch ID
  true
);
```

### Step 4: Test the System

**Admin Dashboard Access:**
- Visit `http://localhost:3002/admin`
- Login with `admin@kqs.com` → Should access admin dashboard
- Login with `manager@kqs.com` → Should access admin dashboard

**POS Access:**
- Visit `http://localhost:3002/pos` → Should redirect to branch selection
- Select a branch → Should redirect to sign-in page
- Login with:
  - `cashier@kqs.com` + PIN `5678` → Access POS
  - `pos@kqs.com` + PIN `9999` → Access POS

## 🎯 Role Permissions

| Role | Admin Access | POS Access | Description |
|------|-------------|------------|-------------|
| `super_admin` | ✅ Full | ✅ Full | Complete system access |
| `admin` | ✅ Full | ✅ Full | Admin dashboard + POS |
| `manager` | ✅ Limited | ✅ Full | Store management |
| `cashier` | ❌ No | ✅ Full | POS operations only |
| `pos_only` | ❌ No | ✅ Limited | Basic POS access |

## 🔧 How It Works

### Unified Authentication Flow:
1. **Admin Users**: Login with email/password → Supabase Auth → Admin Dashboard
2. **POS Users**: Login with email/PIN → Custom function → POS Interface
3. **Dual Access**: Some users can access both admin and POS

### Key Features:
- **Single User Table**: All users in one place
- **Role-Based Access**: Permissions controlled by roles
- **PIN Support**: Quick POS access with PINs
- **Multi-Branch**: Users can be assigned to multiple branches
- **Secure**: Proper RLS policies and authentication

### Database Functions:
- `get_user_with_role(email)`: Gets user with full role information
- `authenticate_pos_user(email, pin, branch)`: POS authentication with branch checking

## 🚨 Important Notes

1. **Clean Setup**: This completely replaces the old dual auth system
2. **Backward Compatibility**: Old `pos_public_users` data is not migrated automatically
3. **Test First**: Test all functionality before going live
4. **Security**: All passwords and PINs should be changed from defaults
5. **Branch Assignment**: Users MUST be assigned to branches to access POS

## 🔍 Troubleshooting

### If POS doesn't ask for authentication:
- Make sure you've run the database migration
- Check that users are assigned to branches
- Verify the branch selection is working

### If admin login fails:
- Make sure Supabase Auth users are created
- Check that users exist in the `public.users` table
- Verify the user has the correct role

### If POS authentication fails:
- Check that the user has a PIN set in the database
- Verify the user is assigned to the selected branch
- Make sure the user has POS access permissions

## 🎉 You're Done!

The unified authentication system is now:
- ✅ Simple and clean
- ✅ Secure with proper RLS
- ✅ Works for both admin and POS
- ✅ Role-based with proper permissions
- ✅ Guaranteed to work

No more authentication headaches! 🎯
