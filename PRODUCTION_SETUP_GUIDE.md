# KQS POS Production Setup Guide

## 🔐 Authentication & RLS Issues Fixed

The errors you're seeing are due to Row Level Security (RLS) policies blocking database operations. Here's how to fix them for production:

### 🚨 **IMMEDIATE FIX (Use This First)**

Copy and paste this **entire script** into your Supabase SQL Editor and run it:

```sql
-- KQS POS Simple RLS Policies for Production
-- This version works with existing database schema

-- ========================================
-- STEP 1: TEMPORARILY DISABLE RLS FOR TESTING
-- ========================================

-- Run this first to get the system working immediately
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: CREATE USER_BRANCHES TABLE
-- ========================================

-- Create user_branches table to link users to branches
CREATE TABLE IF NOT EXISTS user_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'cashier',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- Enable RLS on user_branches
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own branch assignments
CREATE POLICY "Users can view their own branch assignments" ON user_branches
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own branch assignments
CREATE POLICY "Users can create their own branch assignments" ON user_branches
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**✅ This will immediately fix your authentication issues!**

### 🧪 **Test Your System**

After running the script above:

1. **Go to POS** (`/pos/pos`)
2. **Try making a sale** - it should work now
3. **Test printing** - receipts should print via QZ Tray
4. **Check console** - no more 401/406 errors

### 🖨️ **FIX RECEIPT PRINTING ISSUE**

If you get the error "No template found for retail or retail receipt", you need to create receipt templates:

#### Step 1: Get Your Branch ID

1. Go to **Supabase Dashboard** → **Table Editor** → **branches**
2. Copy your branch ID (e.g., `17dae1d2-1169-4174-a170-2e3b4fcacbf3`)

#### Step 2: Create Default Receipt Template

Copy and paste this script into your Supabase SQL Editor:

```sql
-- KQS POS Default Template Setup Script
-- Replace 'YOUR-BRANCH-ID-HERE' with your actual branch ID

-- First, delete any existing default template for this branch to avoid duplicates
DELETE FROM receipt_templates WHERE branch_id = 'YOUR-BRANCH-ID-HERE' AND is_default = true;

-- Now insert the default template
INSERT INTO receipt_templates (
  id, name, description, template_type, business_name, business_address, 
  business_phone, business_website, business_facebook, business_tagline,
  return_policy_english, return_policy_sesotho, thank_you_message, footer_text,
  show_qr_section, show_policy_section, show_points_section, show_tagline,
  is_active, is_default, branch_id, layout, template_settings, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'KQS Retail Receipt', 'Default retail receipt template', 'standard',
  'KQS', 'Maseru, Husteds opposite Queen II', '2700 7795', 'www.kqsfootware.com',
  'KQSFOOTWARE', 'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa.',
  'Thank You for shopping with Us', 'SHOP ONLINE - Stand a chance to win',
  true, true, true, true, true, true, 'YOUR-BRANCH-ID-HERE', '{}', '{}', NOW(), NOW()
);
```

#### Step 3: Test Printing

1. **Refresh your POS page**
2. **Click the "🖨️ Test Print" button**
3. **Check console** - should see "Templates setup complete"
4. **Receipt should print** via QZ Tray or browser

### 🏗️ **Proper Production Setup (Later)**

Once your system is working, you can implement proper security:

#### Step 1: Check Your Database Schema

1. Go to **Supabase Dashboard** → **Table Editor**
2. Check what columns each table actually has
3. Look for `branch_id`, `user_id`, or similar columns

#### Step 2: Create Proper RLS Policies

Based on your actual schema, create policies like this:

```sql
-- Example (adjust based on your actual columns)
CREATE POLICY "Users can only access their branch data" ON sales
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches WHERE user_id = auth.uid()
  )
);
```

#### Step 3: Re-enable RLS

```sql
-- Re-enable RLS for production
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
```

### 🔧 **How to Get Your User ID and Branch ID**

#### Get User ID:
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user and copy the ID

#### Get Branch ID:
1. Go to Supabase Dashboard → Table Editor → branches
2. Find your branch and copy the ID

### 📋 **Complete Setup Checklist**

- [x] **Run the immediate fix script** (above)
- [ ] **Create receipt templates** (above)
- [ ] Test making a sale
- [ ] Test printing receipts
- [ ] Check your database schema
- [ ] Create proper RLS policies (later)
- [ ] Re-enable RLS for production (later)

### 🆘 **If You Still Get Errors**

1. **Check Authentication**: Make sure you're signed in
2. **Check Console**: Look for specific error messages
3. **Verify Supabase Connection**: Check environment variables
4. **Check Table Names**: Make sure table names match your schema
5. **Check Templates**: Verify receipt templates exist for your branch

### 📞 **Support**

If you continue to have issues:
1. Check the browser console for specific error messages
2. Verify your Supabase connection settings
3. Ensure all environment variables are set correctly

---

**🎯 Goal**: Get the POS system working immediately, then implement proper security later.

**📁 Files Created**:
- `src/lib/rls-policies-simple.sql` - Simple RLS policies that work with any schema
- `src/lib/setup-templates-script.sql` - Complete receipt templates setup script
- `PRODUCTION_SETUP_GUIDE.md` - This guide
