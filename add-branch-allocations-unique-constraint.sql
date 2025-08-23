-- Add unique constraint to branch_allocations table
-- Run this in your Supabase SQL Editor

-- Add unique constraint to prevent duplicate allocations
ALTER TABLE branch_allocations 
ADD CONSTRAINT unique_product_branch_allocation 
UNIQUE (product_id, branch_id);

-- Clean up any existing duplicates (keep the one with the highest allocated_quantity)
DELETE FROM branch_allocations 
WHERE id NOT IN (
  SELECT DISTINCT ON (product_id, branch_id) id
  FROM branch_allocations
  ORDER BY product_id, branch_id, allocated_quantity DESC, created_at DESC
);

-- Verify the constraint was added
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'branch_allocations' 
AND constraint_type = 'UNIQUE'; 