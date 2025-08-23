# Database Migration Guide

## Issue
The bulk price update functionality is failing with the error: `Error: Error creating bulk price update: {}`

This is because the required database tables for the pricing system have not been created yet.

## Solution

### Option 1: Manual Migration (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to the SQL Editor

2. **Run the Migration**
   - Copy the entire contents of `supabase-migration-product-pricing-complete.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration**
   - After running the migration, you should see the following tables created:
     - `bulk_price_updates`
     - `discount_management`
     - `price_optimization_suggestions`
     - `quick_actions_log`
     - `product_pricing_settings`
     - `product_pricing_rules`
     - `price_analysis_data`
     - `pricing_reports`
     - `import_export_history`

### Option 2: Using the Migration Script

1. **Install dotenv** (if not already installed):
   ```bash
   npm install dotenv
   ```

2. **Set up environment variables**:
   Create a `.env` file in your project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the migration script**:
   ```bash
   node apply-pricing-migration.js
   ```

### Option 3: Supabase CLI (if available)

If you have Supabase CLI set up:

1. **Start Supabase locally**:
   ```bash
   npx supabase start
   ```

2. **Apply the migration**:
   ```bash
   npx supabase db reset
   ```

## Verification

After applying the migration, you can verify it worked by:

1. **Checking the tables exist**:
   - Go to Supabase Dashboard → Table Editor
   - Look for the `bulk_price_updates` table

2. **Testing the functionality**:
   - Go to Admin → Settings → Product Pricing
   - Try using the "Bulk Price Update" quick action
   - It should now work without errors

## Troubleshooting

### If you get permission errors:
- Make sure you're using the correct database credentials
- Check that your Supabase project has the necessary permissions

### If tables already exist:
- The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- If you get errors about existing tables, you can safely ignore them

### If you need to reset:
- You can drop the tables and re-run the migration
- Be careful as this will delete any existing pricing data

## Support

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase connection is working
3. Ensure all environment variables are correctly set
4. Contact your system administrator for database access 