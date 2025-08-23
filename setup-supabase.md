# Supabase Setup Guide for KQS POS

This guide will help you set up your Supabase database with all the necessary tables, storage buckets, and initial data for the KQS POS system.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Set Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql` to create all tables
4. Run the contents of `supabase-storage-setup.sql` to set up storage buckets

### 4. Enable Row Level Security (RLS)
The storage setup script includes RLS policies, but make sure they're enabled in your Supabase dashboard.

## 📊 Database Tables Created

### Core Tables
- `categories` - Product categories
- `variant_option_types` - Types of variants (size, color, gender, brand, style)
- `variant_options` - All possible variant values
- `category_variant_configs` - Which variant types apply to which categories
- `products` - Main products table
- `product_variants` - Product variants (for products with multiple options)
- `product_variant_options` - Links variants to specific option values
- `product_images` - Multiple images per product/variant

### Business Tables
- `customers` - Customer information
- `sales` - Sales transactions
- `sale_items` - Individual items in sales
- `laybye_orders` - Laybye orders
- `laybye_items` - Items in laybye orders
- `laybye_payments` - Payments for laybye orders
- `refunds` - Refund transactions
- `refund_items` - Items being refunded
- `stock_movements` - Inventory tracking
- `business_settings` - Business configuration

## 🗄️ Storage Buckets

### Product Images (`product-images`)
- Public bucket for product images
- 5MB file size limit
- Supports: JPEG, PNG, WebP, GIF
- Organized by: `products/{productId}/{imageName}` or `products/{productId}/variants/{variantId}/{imageName}`

### Business Assets (`business-assets`)
- Public bucket for business assets (logos, receipts, etc.)
- 10MB file size limit
- Supports: JPEG, PNG, WebP, PDF
- Organized by: `{assetType}/{fileName}`

## 🔐 Security Policies

All tables have Row Level Security (RLS) enabled with policies that allow:
- **SELECT**: All authenticated users can view data
- **INSERT**: All authenticated users can create data
- **UPDATE**: All authenticated users can update data
- **DELETE**: All authenticated users can delete data

Storage buckets have policies for:
- Public read access
- Authenticated user upload/update/delete access

## 📋 Initial Data

The schema includes initial data for:

### Variant Option Types
- size, color, gender, brand, style

### Variant Options
- **Sizes**: XS, S, M, L, XL, XXL, XXXL, UK sizes 1-15, UK sizes 20-50, One Size
- **Colors**: 24 colors with hex codes
- **Genders**: Men, Women, Unisex, Boys, Girls
- **Brands**: 24 popular brands (Nike, Adidas, etc.)
- **Styles**: 10 style options (Casual, Formal, Sport, etc.)

### Categories
- Clothing, Shoes, Accessories, Electronics, Home & Garden, Sports, Beauty, Books

### Category Variant Configurations
- Clothing, Shoes, Accessories have size and color as required variants
- All categories have gender and brand as optional variants

### Business Settings
- Default business configuration with South African currency (ZAR)

## 🔧 Manual Setup Commands

If you prefer to run commands manually:

### 1. Create Storage Buckets
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-assets',
    'business-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);
```

### 2. Enable RLS
```sql
-- Run for each table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

## 🧪 Testing the Setup

After setup, you can test:

1. **Add a new product** with variants
2. **Upload product images** 
3. **Add new variant options** (sizes, colors, etc.)
4. **Create categories** and configure their variant types

## 🔄 Migration from Hardcoded Options

The system now:
- ✅ Stores all variant options in the database
- ✅ Allows dynamic addition of new options
- ✅ Supports category-specific variant configurations
- ✅ Handles multiple images per product/variant
- ✅ Provides proper storage for all assets

## 🆘 Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure you're authenticated in your app
2. **Storage Upload Failures**: Check file size limits and allowed MIME types
3. **Foreign Key Errors**: Ensure all referenced records exist

### Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify all environment variables are set correctly
3. Ensure all SQL scripts ran successfully

## 📈 Next Steps

After setup:
1. Configure your business settings
2. Add your first products and categories
3. Set up user authentication (if needed)
4. Configure any additional business rules

---

**Note**: This setup provides a complete, production-ready database structure for the KQS POS system. All hardcoded options have been moved to the database for full flexibility and customization. 