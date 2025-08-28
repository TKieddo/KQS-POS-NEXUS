-- Disable RLS on ALL tables in the database
-- This is a comprehensive fix for all 401 authorization errors

-- Get all tables with RLS enabled and disable them
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
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', table_record.schemaname, table_record.tablename);
        RAISE NOTICE 'Disabled RLS on table: %.%', table_record.schemaname, table_record.tablename;
    END LOOP;
END $$;

-- Grant all permissions to authenticated users on all tables
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL ON %I.%I TO authenticated', table_record.schemaname, table_record.tablename);
        RAISE NOTICE 'Granted permissions on table: %.%', table_record.schemaname, table_record.tablename;
    END LOOP;
END $$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant all on all sequences
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL ON SEQUENCE %I.%I TO authenticated', seq_record.schemaname, seq_record.sequencename);
        RAISE NOTICE 'Granted permissions on sequence: %.%', seq_record.schemaname, seq_record.sequencename;
    END LOOP;
END $$;

-- Verify RLS is disabled on all tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS STILL ENABLED' ELSE 'RLS DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show count of tables with RLS still enabled
SELECT 
    COUNT(*) as tables_with_rls_still_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
