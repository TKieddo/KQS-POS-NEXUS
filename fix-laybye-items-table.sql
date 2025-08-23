-- Create or fix laybye_items table structure
CREATE TABLE IF NOT EXISTS public.laybye_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_items_pkey PRIMARY KEY (id)
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Add laybye_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'laybye_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN laybye_id UUID NOT NULL;
    END IF;

    -- Add product_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'product_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN product_id UUID NOT NULL;
    END IF;

    -- Add quantity if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'quantity'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Add unit_price if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'unit_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add total_price if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'total_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_items' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key to laybye_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'laybye_items' 
        AND constraint_name = 'laybye_items_laybye_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD CONSTRAINT laybye_items_laybye_id_fkey 
        FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'laybye_items' 
        AND constraint_name = 'laybye_items_product_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_items 
        ADD CONSTRAINT laybye_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_laybye_items_laybye_id ON public.laybye_items USING btree (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_items_product_id ON public.laybye_items USING btree (product_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_laybye_items_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_laybye_items_updated_at ON laybye_items;

CREATE TRIGGER update_laybye_items_updated_at
    BEFORE UPDATE ON laybye_items
    FOR EACH ROW
    EXECUTE FUNCTION update_laybye_items_updated_at_column();

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_items' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Laybye items table structure complete!' as result;
