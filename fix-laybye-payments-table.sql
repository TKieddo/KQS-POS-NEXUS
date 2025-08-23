-- Create or fix laybye_payments table structure
CREATE TABLE IF NOT EXISTS public.laybye_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_payments_pkey PRIMARY KEY (id)
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Add laybye_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'laybye_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN laybye_id UUID NOT NULL;
    END IF;

    -- Add amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add payment_method if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'payment_method'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'cash';
    END IF;

    -- Add payment_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'payment_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN notes TEXT NULL;
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_payments' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key to laybye_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'laybye_payments' 
        AND constraint_name = 'laybye_payments_laybye_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_payments 
        ADD CONSTRAINT laybye_payments_laybye_id_fkey 
        FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
    -- Add payment method check constraint
    BEGIN
        ALTER TABLE public.laybye_payments 
        ADD CONSTRAINT laybye_payments_payment_method_check 
        CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mpesa', 'ecocash', 'deposit', 'other'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add amount check constraint
    BEGIN
        ALTER TABLE public.laybye_payments 
        ADD CONSTRAINT laybye_payments_amount_check 
        CHECK (amount >= 0);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_laybye_payments_laybye_id ON public.laybye_payments USING btree (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_payment_date ON public.laybye_payments USING btree (payment_date);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_payment_method ON public.laybye_payments USING btree (payment_method);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_laybye_payments_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_laybye_payments_updated_at ON laybye_payments;

CREATE TRIGGER update_laybye_payments_updated_at
    BEFORE UPDATE ON laybye_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_laybye_payments_updated_at_column();

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_payments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Laybye payments table structure complete!' as result;
