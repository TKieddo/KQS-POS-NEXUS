-- Add variant support to branch_allocations table
-- This allows allocating individual product variants to branches

-- Step 1: Add variant_id column to branch_allocations
ALTER TABLE branch_allocations 
ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- Step 2: Drop the existing unique constraint that only considers product_id and branch_id
ALTER TABLE branch_allocations 
DROP CONSTRAINT IF EXISTS unique_product_branch_allocation;

-- Step 3: Add new unique constraints using partial indexes
-- This allows multiple allocations per product+branch combination if they're different variants
-- But prevents duplicate allocations for the same product+variant+branch combination

-- For variant-specific allocations (where variant_id IS NOT NULL)
CREATE UNIQUE INDEX unique_variant_allocation 
ON branch_allocations (product_id, branch_id, variant_id) 
WHERE variant_id IS NOT NULL;

-- For product-level allocations (where variant_id IS NULL)  
CREATE UNIQUE INDEX unique_product_allocation 
ON branch_allocations (product_id, branch_id) 
WHERE variant_id IS NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branch_allocations_variant ON branch_allocations(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_branch_allocations_product_variant ON branch_allocations(product_id, variant_id);

-- Step 5: Update the BranchAllocation interface type by adding variant_id to the select queries
-- This is handled in the TypeScript code

-- Step 6: Add some sample data for testing (optional)
-- You can uncomment this section to add test variant allocations

/*
-- Sample variant allocation (uncomment if you want test data)
-- Assuming you have the test product with variants from the previous script

DO $$
DECLARE
    test_product_id UUID;
    test_branch_id UUID;
    variant_red_small_id UUID;
    variant_blue_medium_id UUID;
BEGIN
    -- Get test product ID
    SELECT id INTO test_product_id FROM products WHERE sku = 'TEST-TSHIRT-001' LIMIT 1;
    
    -- Get a branch ID (not central warehouse)
    SELECT id INTO test_branch_id FROM branches WHERE id != '00000000-0000-0000-0000-000000000001' LIMIT 1;
    
    -- Get variant IDs
    SELECT id INTO variant_red_small_id FROM product_variants WHERE sku = 'TEST-TSHIRT-001-SM-RED' LIMIT 1;
    SELECT id INTO variant_blue_medium_id FROM product_variants WHERE sku = 'TEST-TSHIRT-001-MD-BLUE' LIMIT 1;
    
    -- Insert variant-specific allocations if we have the data
    IF test_product_id IS NOT NULL AND test_branch_id IS NOT NULL AND variant_red_small_id IS NOT NULL THEN
        INSERT INTO branch_allocations (product_id, branch_id, variant_id, allocated_quantity, notes)
        VALUES 
            (test_product_id, test_branch_id, variant_red_small_id, 5, 'Test allocation for red small variant'),
            (test_product_id, test_branch_id, variant_blue_medium_id, 8, 'Test allocation for blue medium variant')
        ON CONFLICT (product_id, branch_id, variant_id) DO NOTHING;
        
        RAISE NOTICE 'Test variant allocations created!';
    ELSE
        RAISE NOTICE 'Test data not found - skipping sample allocations';
    END IF;
END $$;
*/

-- Step 7: Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'branch_allocations' 
AND column_name = 'variant_id';

-- Step 8: Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'branch_allocations' 
AND constraint_type = 'UNIQUE';

RAISE NOTICE 'Branch allocations table has been updated to support variant-level allocations!';
