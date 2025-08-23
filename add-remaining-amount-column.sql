-- Add missing remaining_amount column to laybye_orders table if it doesn't exist
DO $$ 
BEGIN 
    -- Check if remaining_amount column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'remaining_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
        
        -- Update existing records to calculate remaining amount from total - deposit
        UPDATE public.laybye_orders 
        SET remaining_amount = COALESCE(total_amount, 0) - COALESCE(deposit_amount, 0)
        WHERE remaining_amount = 0;
        
        RAISE NOTICE 'Added remaining_amount column to laybye_orders table';
    ELSE
        RAISE NOTICE 'remaining_amount column already exists in laybye_orders table';
    END IF;
END $$;
