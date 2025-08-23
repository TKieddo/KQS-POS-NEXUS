-- Fix branch_allocations duplicates and add unique constraint
-- Run this in your Supabase SQL Editor

-- Step 1: Check for duplicates
SELECT 
  product_id, 
  branch_id, 
  COUNT(*) as duplicate_count
FROM branch_allocations 
GROUP BY product_id, branch_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Create a temporary table with the records we want to keep
-- (keeping the one with the highest allocated_quantity, or the most recent if equal)
CREATE TEMP TABLE temp_branch_allocations AS
SELECT DISTINCT ON (product_id, branch_id) 
  id,
  product_id,
  branch_id,
  allocated_quantity,
  notes,
  created_at,
  updated_at
FROM branch_allocations
ORDER BY product_id, branch_id, allocated_quantity DESC, created_at DESC;

-- Step 3: Delete all records from branch_allocations
DELETE FROM branch_allocations;

-- Step 4: Insert back only the records we want to keep
INSERT INTO branch_allocations (id, product_id, branch_id, allocated_quantity, notes, created_at, updated_at)
SELECT id, product_id, branch_id, allocated_quantity, notes, created_at, updated_at
FROM temp_branch_allocations;

-- Step 5: Drop the temporary table
DROP TABLE temp_branch_allocations;

-- Step 6: Now add the unique constraint
ALTER TABLE branch_allocations 
ADD CONSTRAINT unique_product_branch_allocation 
UNIQUE (product_id, branch_id);

-- Step 7: Verify the constraint was added and no duplicates remain
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'branch_allocations' 
AND constraint_type = 'UNIQUE';

-- Step 8: Verify no duplicates remain
SELECT 
  product_id, 
  branch_id, 
  COUNT(*) as count
FROM branch_allocations 
GROUP BY product_id, branch_id 
HAVING COUNT(*) > 1; 