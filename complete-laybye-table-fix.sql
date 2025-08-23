-- Complete laybye_orders table structure fix
-- This ensures all required columns exist with proper defaults

-- First, check if the table exists, if not create it
CREATE TABLE IF NOT EXISTS public.laybye_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_orders_pkey PRIMARY KEY (id)
);

-- Add missing columns one by one with IF NOT EXISTS equivalent
DO $$ 
BEGIN 
    -- Add order_number if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'order_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN order_number VARCHAR(50) NOT NULL DEFAULT 'LAY-' || EXTRACT(EPOCH FROM NOW())::text;
    END IF;

    -- Add subtotal if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'subtotal'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add tax_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'tax_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add discount_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'discount_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add remaining_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'remaining_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add branch_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'branch_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN branch_id UUID NULL;
    END IF;

    -- Add cashier_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'cashier_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN cashier_id UUID NULL;
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN notes TEXT NULL;
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add unique constraint on order_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'laybye_orders' 
        AND constraint_name = 'laybye_orders_order_number_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD CONSTRAINT laybye_orders_order_number_key UNIQUE (order_number);
    END IF;

    -- Add status check constraint
    BEGIN
        ALTER TABLE public.laybye_orders 
        ADD CONSTRAINT laybye_orders_status_check 
        CHECK (status IN ('active', 'completed', 'cancelled', 'expired'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign key to customers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'laybye_orders' 
        AND constraint_name = 'laybye_orders_customer_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD CONSTRAINT laybye_orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update any existing records that might have NULL values in required fields
UPDATE public.laybye_orders 
SET 
    subtotal = COALESCE(subtotal, total_amount),
    tax_amount = COALESCE(tax_amount, 0.00),
    discount_amount = COALESCE(discount_amount, 0.00),
    remaining_amount = COALESCE(remaining_amount, total_amount - deposit_amount),
    order_number = COALESCE(order_number, 'LAY-' || id::text)
WHERE subtotal IS NULL 
   OR tax_amount IS NULL 
   OR discount_amount IS NULL 
   OR remaining_amount IS NULL 
   OR order_number IS NULL;

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Laybye orders table structure complete!' as result;
