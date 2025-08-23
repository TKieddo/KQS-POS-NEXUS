-- Rename loyalty_customers table to customers
-- This fixes the foreign key constraint issue

-- First, let's check if the table exists and what it's called
DO $$
BEGIN
  -- Check if loyalty_customers exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loyalty_customers' AND table_schema = 'public') THEN
    -- Rename loyalty_customers to customers
    ALTER TABLE public.loyalty_customers RENAME TO customers;
    RAISE NOTICE 'Successfully renamed loyalty_customers to customers';
  ELSE
    RAISE NOTICE 'loyalty_customers table does not exist';
  END IF;
  
  -- Check if customers already exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    RAISE NOTICE 'customers table already exists';
  ELSE
    RAISE NOTICE 'customers table does not exist';
  END IF;
END $$; 