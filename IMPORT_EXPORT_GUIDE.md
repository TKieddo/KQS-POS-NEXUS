# Product Import/Export Guide

This guide explains how to use the product import/export system that supports products with variants, discounts, and all other features.

## 📋 Overview

The import/export system allows you to:
- **Import products** from CSV files with full variant support
- **Export products** to CSV files for backup or editing
- **Handle complex product structures** with multiple variants
- **Manage discounts** with expiration dates
- **Auto-create categories** if they don't exist

## 📥 Import Process

### Step 1: Download Template
1. Click "Import Products" in the products page
2. Click "Download Template" to get a sample CSV file
3. The template shows examples of:
   - Simple products without variants
   - Products with multiple variants
   - Products with discounts

### Step 2: Prepare Your CSV File

#### Required Fields
- `name` - Product name
- `sku` - Unique product identifier
- `price` - Selling price

#### Optional Fields
- `description` - Product description
- `barcode` - Product barcode
- `category_name` - Category (will be created if doesn't exist)
- `cost_price` - Cost price
- `stock_quantity` - Initial stock
- `min_stock_level` - Minimum stock level
- `max_stock_level` - Maximum stock level
- `unit` - Unit of measurement (piece, kg, etc.)
- `is_active` - Whether product is active (true/false)

#### Discount Fields
- `discount_amount` - Discount value
- `discount_type` - 'percentage' or 'fixed'
- `discount_description` - Description of the discount
- `discount_expires_at` - Expiration date (YYYY-MM-DDTHH:MM:SS)
- `is_discount_active` - Whether discount is active (true/false)

#### Variant Fields
- `has_variants` - Whether product has variants (true/false)
- `variant_sku` - Unique variant identifier
- `variant_barcode` - Variant barcode
- `variant_price` - Variant-specific price
- `variant_cost_price` - Variant-specific cost
- `variant_stock_quantity` - Variant stock
- `variant_min_stock_level` - Variant minimum stock
- `variant_max_stock_level` - Variant maximum stock
- `size` - Size option
- `color` - Color option
- `gender` - Gender option
- `brand` - Brand option
- `style` - Style option
- `variant_image_url` - Variant-specific image

### Step 3: Import Options

Choose one of three import modes:

1. **Add new products only** - Skips existing products
2. **Update existing products** - Updates products with matching SKUs
3. **Replace all products** - ⚠️ Destructive - replaces all existing products

### Step 4: Validation & Import

1. Upload your CSV file
2. Click "Validate File" to check for errors
3. Review validation results
4. Click "Import Products" to proceed

## 📤 Export Process

### Step 1: Export Products
1. Click "Export Products" in the products page
2. CSV file will be downloaded automatically
3. File includes all products with their variants

### Step 2: Edit & Re-import
1. Open the exported CSV file
2. Make your changes
3. Save the file
4. Use the import process to update products

## 📊 CSV Format Examples

### Simple Product (No Variants)
```csv
name,description,sku,barcode,category_name,price,cost_price,stock_quantity,min_stock_level,max_stock_level,unit,is_active,discount_amount,discount_type,discount_description,discount_expires_at,is_discount_active,has_variants,main_image_url,variant_sku,variant_barcode,variant_price,variant_cost_price,variant_stock_quantity,variant_min_stock_level,variant_max_stock_level,size,color,gender,brand,style,variant_image_url
"Basic T-Shirt","Comfortable cotton t-shirt","TSHIRT-001","123456789012","Clothing","29.99","15.00","50","5","100","piece","true","10","percentage","Summer Sale","2024-08-31T23:59:59","true","false","https://example.com/tshirt.jpg","","","","","","","","","","","",""
```

### Product with Variants
For products with variants, you need multiple rows:

**Main Product Row:**
```csv
"Premium Jeans","High-quality denim jeans","JEANS-001","123456789013","Clothing","89.99","45.00","0","2","50","piece","true","","","","","false","true","https://example.com/jeans.jpg","","","","","","","","","","","",""
```

**Variant Rows:**
```csv
"Premium Jeans","High-quality denim jeans","JEANS-001","123456789013","Clothing","89.99","45.00","0","2","50","piece","true","","","","","false","true","https://example.com/jeans.jpg","JEANS-001-32-BLUE","123456789014","89.99","45.00","15","2","20","32","Blue","Unisex","Premium Brand","Slim Fit","https://example.com/jeans-blue-32.jpg"
"Premium Jeans","High-quality denim jeans","JEANS-001","123456789013","Clothing","89.99","45.00","0","2","50","piece","true","","","","","false","true","https://example.com/jeans.jpg","JEANS-001-34-BLUE","123456789015","89.99","45.00","12","2","20","34","Blue","Unisex","Premium Brand","Slim Fit","https://example.com/jeans-blue-34.jpg"
```

### Product with Discount
```csv
"Wireless Headphones","Bluetooth wireless headphones with noise cancellation","HEADPHONES-001","123456789016","Electronics","199.99","120.00","25","3","50","piece","true","25","percentage","Black Friday Sale","2024-11-30T23:59:59","true","false","https://example.com/headphones.jpg","","","","","","","","","","","",""
```

## ⚠️ Important Notes

### Variant Handling
- **Same SKU**: All variants of a product must have the same main `sku`
- **Unique Variant SKUs**: Each variant must have a unique `variant_sku`
- **Stock Management**: For products with variants, set main `stock_quantity` to 0
- **Variant Options**: Use size, color, gender, brand, style fields for variant options

### Data Validation
- **Required Fields**: name, sku, price are mandatory
- **Numeric Fields**: price, cost_price, stock_quantity must be numbers
- **Boolean Fields**: is_active, is_discount_active, has_variants must be true/false
- **Date Format**: Use YYYY-MM-DDTHH:MM:SS for expiration dates

### Error Handling
- **Validation Errors**: Must be fixed before import
- **Warnings**: Can be ignored but should be reviewed
- **Duplicate SKUs**: Will be skipped in "add" mode, updated in "update" mode

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid CSV format"**
   - Check that your file is saved as CSV
   - Ensure all rows have the same number of columns
   - Use quotes around text fields with commas

2. **"Required field missing"**
   - Ensure name, sku, and price are filled for all products
   - Check for empty cells in required fields

3. **"Variant SKU required"**
   - For products with `has_variants=true`, fill in `variant_sku`
   - Each variant needs a unique variant SKU

4. **"Invalid date format"**
   - Use format: YYYY-MM-DDTHH:MM:SS
   - Example: 2024-12-31T23:59:59

5. **"Category not found"**
   - Categories will be auto-created if they don't exist
   - Use consistent category names

### Best Practices

1. **Test with Small Files**: Start with a few products to test the format
2. **Backup First**: Export existing products before large imports
3. **Use Template**: Always start with the downloaded template
4. **Validate First**: Always validate before importing
5. **Check Results**: Review import results for any issues

## 📞 Support

If you encounter issues:
1. Check the validation errors in the import modal
2. Review this guide for common solutions
3. Ensure your CSV format matches the examples
4. Try importing a smaller subset of products first 