# KQS POS Supabase Setup Guide

This guide will help you set up Supabase for the KQS POS system.

## Prerequisites

1. A Supabase account (free tier is sufficient to start)
2. Your project URL and API keys

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Choose a name (e.g., "kqs-pos")
5. Set a database password
6. Choose a region close to your users
7. Wait for the project to be created

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=KQS POS
NEXT_PUBLIC_APP_VERSION=1.0.0
```

Replace `your_project_url_here` and `your_anon_key_here` with your actual values.

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `setup-database.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the script

This will create all the necessary tables:
- `branches` - Store locations
- `categories` - Product categories
- `products` - Product catalog
- `customers` - Customer information
- `sales` - Sales transactions
- `sale_items` - Items in sales
- `laybye_orders` - Laybye orders
- `laybye_items` - Items in laybye orders
- `laybye_payments` - Laybye payments
- `refunds` - Refund transactions
- `refund_items` - Items being refunded
- `stock_movements` - Stock movement history
- `business_settings` - Business configuration

## Step 5: Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all the tables listed
3. Check that sample data was inserted:
   - Categories (Clothing, Shoes, Accessories, etc.)
   - Sample products (Summer Dress, Slim Fit Jeans, etc.)
   - Business settings

## Step 6: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the products page
3. You should see the sample products loaded from Supabase
4. Try adding a new product to test the integration

## Troubleshooting

### "Error fetching branches" Error
This error occurs when the `branches` table doesn't exist. The application will automatically create default branches, but you can also run the setup script to ensure all tables exist.

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure your IP is not blocked by Supabase

### Missing Data
If you don't see any products:
1. Check the **Table Editor** in Supabase
2. Verify the `products` table has data
3. Check the browser console for any errors

## Next Steps

Once the basic setup is working:

1. **Authentication**: Set up user authentication for admin access
2. **Storage**: Configure file storage for product images
3. **Real-time**: Enable real-time subscriptions for live updates
4. **Backups**: Set up automated database backups
5. **Monitoring**: Configure error tracking and performance monitoring

## Security Notes

- The current setup uses basic RLS policies that allow all operations
- For production, you should implement proper authentication and authorization
- Consider enabling additional security features like:
  - Row Level Security with proper policies
  - API rate limiting
  - Database backups
  - Audit logging

## Support

If you encounter any issues:
1. Check the Supabase documentation
2. Review the browser console for errors
3. Check the Supabase dashboard logs
4. Ensure all environment variables are set correctly 