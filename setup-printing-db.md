# Printing System Database Setup Guide

## 🚀 Quick Setup

### Step 1: Run the Database Schema

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your KQS POS project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Schema**
   - Copy the entire contents of `printing-schema-simple.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

### Step 2: Verify Tables Created

Run this query to check if tables were created successfully:

```sql
SELECT 
    table_name,
    'Created' as status
FROM information_schema.tables 
WHERE table_name IN ('printing_settings', 'printers', 'receipt_templates', 'print_jobs', 'receipt_history')
AND table_schema = 'public';
```

### Step 3: Check Default Templates

Run this query to verify default templates were created:

```sql
SELECT 
    name,
    template_type,
    is_active,
    created_at
FROM receipt_templates 
ORDER BY name;
```

## 🔧 Troubleshooting

### If you get "table does not exist" errors:

1. **Check if you're in the right project**
   - Make sure you're in your KQS POS Supabase project
   - Not a different project

2. **Check if the schema ran successfully**
   - Look for any error messages in the SQL Editor
   - Make sure all statements executed without errors

3. **Manual table creation**
   If the schema didn't run properly, you can create tables manually:

```sql
-- Create printing_settings table
CREATE TABLE IF NOT EXISTS printing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    receipt_template VARCHAR(50) DEFAULT 'standard',
    receipt_header TEXT DEFAULT 'Thank you for shopping with us!',
    receipt_footer TEXT DEFAULT 'No refunds after 7 days. T&Cs apply.',
    default_printer VARCHAR(100),
    paper_size VARCHAR(20) DEFAULT '80mm',
    paper_width INTEGER DEFAULT 80,
    print_logo BOOLEAN DEFAULT false,
    print_barcode BOOLEAN DEFAULT true,
    print_tax_breakdown BOOLEAN DEFAULT true,
    print_customer_info BOOLEAN DEFAULT true,
    print_cashier_info BOOLEAN DEFAULT true,
    print_time_date BOOLEAN DEFAULT true,
    print_receipt_number BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT true,
    print_copies INTEGER DEFAULT 1,
    slip_types JSONB DEFAULT '{}',
    custom_layouts JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create printers table
CREATE TABLE IF NOT EXISTS printers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('thermal', 'inkjet', 'laser', 'dot_matrix')),
    connection VARCHAR(20) NOT NULL CHECK (connection IN ('usb', 'network', 'bluetooth', 'serial')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    paper_size VARCHAR(20) DEFAULT '80mm',
    is_default BOOLEAN DEFAULT false,
    ip_address INET,
    port INTEGER,
    driver_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipt_templates table
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('standard', 'compact', 'detailed', 'custom')),
    layout JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### If you get authentication errors:

1. **Check your Supabase environment variables**
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
   - Check your `.env.local` file

2. **Verify user authentication**
   - Make sure you're logged in to the app
   - Check if the user has a `branch_id` assigned

### If the printing page still shows errors:

1. **Check browser console**
   - Open Developer Tools (F12)
   - Look for any JavaScript errors
   - Check the Network tab for failed API calls

2. **Test database connection**
   Run this query in Supabase to test if you can access the tables:

```sql
SELECT COUNT(*) as printing_settings_count FROM printing_settings;
SELECT COUNT(*) as printers_count FROM printers;
SELECT COUNT(*) as templates_count FROM receipt_templates;
```

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **No console errors** in the browser
2. **Printing page loads** without errors
3. **Default templates** appear in the Templates tab
4. **Settings can be saved** without errors
5. **Preview functionality** works

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for specific error messages
2. **Verify your Supabase project** is the correct one
3. **Ensure all environment variables** are set correctly
4. **Try refreshing the page** after running the schema
5. **Check if you're logged in** to the application

The printing system is designed to gracefully handle missing tables and will show default settings until the database is properly set up. 