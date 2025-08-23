# Storage Setup Guide

Due to permission limitations in Supabase, we need to create storage buckets manually. Here's the step-by-step process:

## 🚨 Permission Issue

The error `must be owner of table objects` occurs because storage bucket creation via SQL requires admin privileges. We'll use a hybrid approach.

## 📋 Step-by-Step Setup

### Step 1: Create Storage Buckets Manually

1. **Go to Supabase Dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "Create a new bucket"**
4. **Create these 5 buckets:**

| Bucket Name | Public | Purpose | File Size Limit |
|-------------|--------|---------|-----------------|
| `backups` | ❌ Private | Database backups | 500MB |
| `exports` | ❌ Private | Data exports | 500MB |
| `product-images` | ✅ Public | Product images | 10MB |
| `receipts` | ❌ Private | Receipt images | 10MB |
| `documents` | ❌ Private | General documents | 50MB |

**For each bucket:**
- Set **Public** to `false` (except `product-images` which should be `true`)
- Leave **File size limit** as default
- Click **"Create bucket"**

### Step 2: Run the Minimal Migration

1. **Go to SQL Editor** in Supabase Dashboard
2. **Copy and paste** the contents of `create-storage-policies-only.sql`
3. **Click "Run"**

This will:
- Create storage policies for existing buckets
- Set up RLS for the buckets
- Skip any permission-granting operations

### Step 3: Test the Setup

1. **Go to Admin → Settings → Data Management**
2. **Click "Create Storage Buckets"** (should show success)
3. **Click "Test Backup"** to verify everything works
4. **Check the console** for successful bucket detection

## ✅ Verification

After setup, you should see:

```sql
-- Run this in SQL Editor to verify
SELECT 
    name as bucket_name,
    public,
    created_at
FROM storage.buckets
WHERE name IN ('backups', 'exports', 'product-images', 'receipts', 'documents')
ORDER BY name;
```

Expected result: 5 buckets listed

## 🔧 Troubleshooting

### "Bucket already exists" error
This is normal - the migration handles existing buckets gracefully.

### "Permission denied" for bucket creation
- Make sure you're logged in as an admin
- Try creating buckets one by one
- Check if you have the necessary role permissions

### Buckets not appearing in the app
1. **Refresh the page**
2. **Check browser console** for errors
3. **Verify bucket names** match exactly
4. **Run the simplified migration** again

## 🎯 Expected Console Output

After successful setup:
```
Checking if backups bucket exists...
Available buckets: [backups, exports, product-images, receipts, documents]
Backups bucket already exists
Current user ID: [user-id]
Backup record created: [backup-id]
Starting backup operation for backup ID: [backup-id]
Creating database backup...
Database backup completed
Creating backup file...
Backup file created, size: X bytes
Uploading backup file: backup_[filename].json
Backup file uploaded successfully
Backup completed successfully for ID: [backup-id]
```

## 📁 File Structure

After setup, your storage will have:
```
storage/
├── backups/          # Database backups (private)
├── exports/          # Data exports (private)
├── product-images/   # Product images (public)
├── receipts/         # Receipt images (private)
└── documents/        # General documents (private)
```

## 🚀 Next Steps

1. **Create the buckets manually** (Step 1)
2. **Run the simplified migration** (Step 2)
3. **Test the backup system** (Step 3)
4. **Verify backup files** appear in the `backups` bucket

The backup system will now work properly with all storage buckets configured! 