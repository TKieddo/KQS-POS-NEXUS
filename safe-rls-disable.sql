-- Safe RLS Disable Script
-- This script only disables RLS on tables that actually exist

-- First, let's see what tables exist in your database
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Now disable RLS only on tables that exist and have RLS enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', table_record.schemaname, table_record.tablename);
            RAISE NOTICE 'Successfully disabled RLS on table: %.%', table_record.schemaname, table_record.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to disable RLS on table %.%: %', table_record.schemaname, table_record.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Grant permissions on all existing tables
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL ON %I.%I TO authenticated', table_record.schemaname, table_record.tablename);
            RAISE NOTICE 'Granted permissions on table: %.%', table_record.schemaname, table_record.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to grant permissions on table %.%: %', table_record.schemaname, table_record.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on sequences (only if they exist)
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL ON SEQUENCE %I.%I TO authenticated', seq_record.schemaname, seq_record.sequencename);
            RAISE NOTICE 'Granted permissions on sequence: %.%', seq_record.schemaname, seq_record.sequencename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to grant permissions on sequence %.%: %', seq_record.schemaname, seq_record.sequencename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Final verification - show all tables and their RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS STILL ENABLED' ELSE 'RLS DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count tables with RLS still enabled
SELECT 
    COUNT(*) as tables_with_rls_still_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
