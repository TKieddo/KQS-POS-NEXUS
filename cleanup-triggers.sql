-- Cleanup script to remove problematic triggers
-- Run this BEFORE running the main setup-database.sql

-- Drop any existing trigger functions that might cause conflicts
DROP FUNCTION IF EXISTS update_central_stock() CASCADE;
DROP FUNCTION IF EXISTS initialize_central_stock() CASCADE;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS update_central_stock_on_allocation ON branch_allocations;
DROP TRIGGER IF EXISTS initialize_central_stock_on_product ON products;

-- Drop any existing tables that might conflict
DROP TABLE IF EXISTS central_stock CASCADE;
DROP TABLE IF EXISTS branch_allocations CASCADE;

-- Now you can run setup-database.sql safely 