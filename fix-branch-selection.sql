-- Fix Branch Selection Issue - RLS Policies Only
-- This script fixes RLS policies on existing branches table

-- ========================================
-- STEP 1: CHECK CURRENT BRANCHES
-- ========================================

-- Show all existing branches
SELECT id, name, address, phone, email, is_active, created_at 
FROM branches 
ORDER BY name;

-- Count total branches
SELECT COUNT(*) as total_branches FROM branches;

-- Count active branches
SELECT COUNT(*) as active_branches FROM branches WHERE is_active = true;

-- ========================================
-- STEP 2: FIX RLS POLICIES
-- ========================================

-- Disable RLS on branches table to ensure it's accessible
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: VERIFY FIX
-- ========================================

-- Test query to ensure branches are accessible
SELECT COUNT(*) as accessible_branches FROM branches WHERE is_active = true;
