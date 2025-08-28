require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = `
-- Create split payment tables
-- This allows storing multiple payment methods per transaction

-- Table to store split payment details
CREATE TABLE IF NOT EXISTS split_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_split_payments_sale_id ON split_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_created_at ON split_payments(created_at);

-- Add RLS policies
ALTER TABLE split_payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations on split_payments" ON split_payments;
CREATE POLICY "Allow all operations on split_payments" ON split_payments
    FOR ALL USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_split_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_split_payments_updated_at_trigger ON split_payments;
CREATE TRIGGER update_split_payments_updated_at_trigger
    BEFORE UPDATE ON split_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_split_payments_updated_at();

-- Function to create a sale with split payments
CREATE OR REPLACE FUNCTION create_sale_with_split_payments(
    p_customer_id UUID,
    p_total_amount DECIMAL(10,2),
    p_payment_methods JSONB, -- Array of {method: string, amount: number}
    p_processed_by UUID,
    p_branch_id UUID,
    p_sale_items JSONB -- Array of sale items
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_payment JSONB;
    v_item JSONB;
BEGIN
    -- Create the sale record
    INSERT INTO sales (
        customer_id,
        total_amount,
        payment_method,
        payment_status,
        cash_amount,
        change_amount,
        processed_by,
        branch_id
    ) VALUES (
        p_customer_id,
        p_total_amount,
        'split_payment', -- Indicates this is a split payment
        'completed',
        NULL,
        NULL,
        p_processed_by,
        p_branch_id
    ) RETURNING id INTO v_sale_id;

    -- Insert split payments
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payment_methods)
    LOOP
        INSERT INTO split_payments (
            sale_id,
            payment_method,
            amount
        ) VALUES (
            v_sale_id,
            (v_payment->>'method')::TEXT,
            (v_payment->>'amount')::DECIMAL(10,2)
        );
    END LOOP;

    -- Insert sale items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
    LOOP
        INSERT INTO sale_items (
            sale_id,
            product_id,
            variant_id,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            v_sale_id,
            (v_item->>'product_id')::UUID,
            CASE 
                WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null' 
                THEN (v_item->>'variant_id')::UUID 
                ELSE NULL 
            END,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::DECIMAL(10,2),
            (v_item->>'total_price')::DECIMAL(10,2)
        );
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get split payments for a sale
CREATE OR REPLACE FUNCTION get_sale_split_payments(p_sale_id UUID)
RETURNS TABLE (
    payment_method TEXT,
    amount DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.payment_method,
        sp.amount
    FROM split_payments sp
    WHERE sp.sale_id = p_sale_id
    ORDER BY sp.created_at;
END;
$$ LANGUAGE plpgsql;
`

async function createSplitPaymentTables() {
  try {
    console.log('Creating split payment tables...')
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        if (error) {
          console.error('Error executing statement:', error)
        }
      }
    }
    
    console.log('Split payment tables created successfully!')
  } catch (error) {
    console.error('Error creating split payment tables:', error)
  }
}

createSplitPaymentTables()
