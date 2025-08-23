-- Laybye Orders Table
CREATE TABLE IF NOT EXISTS public.laybye_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    cashier_id UUID NULL,
    branch_id UUID NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_orders_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_orders_order_number_key UNIQUE (order_number),
    CONSTRAINT laybye_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT laybye_orders_status_check CHECK (status IN ('active', 'completed', 'cancelled', 'expired'))
);

-- Add missing remaining_amount column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'laybye_orders' 
        AND column_name = 'remaining_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.laybye_orders 
        ADD COLUMN remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- Laybye Items Table
CREATE TABLE IF NOT EXISTS public.laybye_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_items_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_items_laybye_id_fkey FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE,
    CONSTRAINT laybye_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT laybye_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT laybye_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT laybye_items_total_price_check CHECK (total_price >= 0)
);

-- Laybye Payments Table
CREATE TABLE IF NOT EXISTS public.laybye_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT laybye_payments_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_payments_laybye_id_fkey FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE,
    CONSTRAINT laybye_payments_amount_check CHECK (amount > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer_id ON public.laybye_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_status ON public.laybye_orders (status);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_due_date ON public.laybye_orders (due_date);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_created_at ON public.laybye_orders (created_at);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_branch_id ON public.laybye_orders (branch_id);

CREATE INDEX IF NOT EXISTS idx_laybye_items_laybye_id ON public.laybye_items (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_items_product_id ON public.laybye_items (product_id);

CREATE INDEX IF NOT EXISTS idx_laybye_payments_laybye_id ON public.laybye_payments (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_payment_date ON public.laybye_payments (payment_date);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_laybye_orders_updated_at ON public.laybye_orders;
DROP TRIGGER IF EXISTS update_laybye_items_updated_at ON public.laybye_items;
DROP TRIGGER IF EXISTS update_laybye_payments_updated_at ON public.laybye_payments;

CREATE TRIGGER update_laybye_orders_updated_at
    BEFORE UPDATE ON public.laybye_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laybye_items_updated_at
    BEFORE UPDATE ON public.laybye_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laybye_payments_updated_at
    BEFORE UPDATE ON public.laybye_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update remaining_amount when payments are added
CREATE OR REPLACE FUNCTION update_laybye_remaining_amount()
RETURNS TRIGGER AS $$
DECLARE
    total_payments NUMERIC(12, 2);
    order_total NUMERIC(12, 2);
    new_remaining NUMERIC(12, 2);
BEGIN
    -- Get the total amount for this laybye order
    SELECT total_amount INTO order_total
    FROM laybye_orders
    WHERE id = NEW.laybye_id;
    
    -- Calculate total payments for this laybye order
    SELECT COALESCE(SUM(amount), 0) INTO total_payments
    FROM laybye_payments
    WHERE laybye_id = NEW.laybye_id;
    
    -- Calculate new remaining amount
    new_remaining := order_total - total_payments;
    
    -- Update the laybye order
    UPDATE laybye_orders
    SET 
        remaining_amount = new_remaining,
        status = CASE
            WHEN new_remaining <= 0 THEN 'completed'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.laybye_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic remaining amount updates
DROP TRIGGER IF EXISTS trigger_update_laybye_remaining_amount ON public.laybye_payments;
CREATE TRIGGER trigger_update_laybye_remaining_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.laybye_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_laybye_remaining_amount();

-- Enable Row Level Security (RLS)
ALTER TABLE public.laybye_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laybye_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laybye_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust as needed for your authentication setup)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.laybye_orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.laybye_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.laybye_payments;

CREATE POLICY "Enable all operations for authenticated users" ON public.laybye_orders
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.laybye_items
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.laybye_payments
    FOR ALL USING (true);
