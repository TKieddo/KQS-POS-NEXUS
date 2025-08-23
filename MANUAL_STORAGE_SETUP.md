# Manual Storage Setup Guide

This guide will help you manually create storage buckets and configure them properly.

## 🚀 Quick Setup (2 Steps)

### Step 1: Create Buckets Manually

1. **Go to Supabase Dashboard**
2. **Click "Storage"** in the left sidebar
3. **Click "Create a new bucket"**
4. **Create these 5 buckets:**

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `backups` | ❌ No | Database backups |
| `exports` | ❌ No | Data exports |
| `product-images` | ✅ Yes | Product images |
| `receipts` | ❌ No | Receipt images |
| `documents` | ❌ No | General documents |

**For each bucket:**
- Enter the exact name (case-sensitive)
- Set **Public** to `No` (except `product-images` which should be `Yes`)
- Click **"Create bucket"**

### Step 2: Run Configuration Migration

1. **Go to SQL Editor** in Supabase Dashboard
2. **Copy and paste** the contents of `configure-storage-buckets.sql`
3. **Click "Run"**

## ✅ Verification

After running the migration, you should see:

```sql
-- Expected results:
-- 1. "Current storage buckets" - should show 5 total_buckets
-- 2. "Storage policies created successfully" - should show 6 total_policies
-- 3. "Configuration Complete" - final status
```

## 🔧 Test the Setup

1. **Go to Admin → Settings → Data Management**
2. **Click "Create Storage Buckets"** (should show success)
3. **Click "Test Backup"** to verify everything works
4. **Check browser console** for successful backup messages

## 🎯 Expected Console Output

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

## 🚨 Troubleshooting

### "Bucket not found" error
- Make sure bucket names match exactly (case-sensitive)
- Check that all 5 buckets were created
- Verify bucket names: `backups`, `exports`, `product-images`, `receipts`, `documents`

### "Permission denied" error
- Make sure you're logged in as an admin
- Try refreshing the page
- Check that the migration ran successfully

### Migration errors
- If you get permission errors, try running the migration in smaller parts
- Check that you have admin access to the Supabase project

## 📁 Final Structure

After setup, your storage will have:
```
storage/
├── backups/          # Database backups (private)
├── exports/          # Data exports (private)
├── product-images/   # Product images (public)
├── receipts/         # Receipt images (private)
└── documents/        # General documents (private)
```

## 🎉 Success!

Once you see the expected console output, your backup system is fully functional and ready to use! 