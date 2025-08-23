# Storage Buckets Migration

This migration creates all the required storage buckets for the KQS POS system.

## 🚀 Quick Setup

### Option 1: Run Migration (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `create-storage-buckets-migration.sql`**
4. **Click "Run"**

### Option 2: Manual Creation

If the migration fails, create buckets manually:

1. **Go to Storage in Supabase Dashboard**
2. **Click "Create a new bucket"**
3. **Create these buckets:**

| Bucket Name | Public | Purpose | File Size Limit |
|-------------|--------|---------|-----------------|
| `backups` | ❌ Private | Database backups | 500MB |
| `exports` | ❌ Private | Data exports | 500MB |
| `product-images` | ✅ Public | Product images | 10MB |
| `receipts` | ❌ Private | Receipt images | 10MB |
| `documents` | ❌ Private | General documents | 50MB |

## 📋 What the Migration Creates

### Storage Buckets
- **backups**: For storing database backups (JSON format)
- **exports**: For storing data exports (CSV, JSON, Excel, PDF)
- **product-images**: For storing product images (public access)
- **receipts**: For storing receipt images (private)
- **documents**: For storing general documents (private)

### Security Policies
- **Authenticated users** can access private buckets
- **Public read access** for product images
- **Proper file type restrictions** for each bucket
- **File size limits** to prevent abuse

## ✅ Verification

After running the migration, you should see:

```sql
-- Verify buckets were created
SELECT 
    'Storage buckets created successfully' as status,
    COUNT(*) as total_buckets,
    COUNT(CASE WHEN public = true THEN 1 END) as public_buckets,
    COUNT(CASE WHEN public = false THEN 1 END) as private_buckets
FROM storage.buckets
WHERE name IN ('backups', 'exports', 'product-images', 'receipts', 'documents');
```

Expected result: 5 buckets total (1 public, 4 private)

## 🔧 Testing

After running the migration:

1. **Go to Admin → Settings → Data Management**
2. **Click "Test Backup"**
3. **Check the console** for successful bucket detection
4. **Verify backup files** appear in the `backups` bucket

## 🚨 Troubleshooting

### "Bucket already exists" error
This is normal - the migration uses `ON CONFLICT DO NOTHING` to handle existing buckets.

### "Permission denied" error
Make sure you're running the migration as a Supabase admin or service role.

### Buckets not appearing in the app
1. **Refresh the page**
2. **Check browser console** for any errors
3. **Verify bucket names** match exactly: `backups`, `exports`, etc.

## 📁 File Structure

```
storage/
├── backups/          # Database backups
├── exports/          # Data exports
├── product-images/   # Product images (public)
├── receipts/         # Receipt images
└── documents/        # General documents
```

## 🔒 Security Notes

- **Private buckets** require authentication
- **Public bucket** (product-images) allows public read access
- **File type restrictions** prevent malicious uploads
- **Size limits** prevent storage abuse
- **RLS policies** ensure proper access control 