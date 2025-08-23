-- Fix optimization_reason column to allow longer text
-- This migration updates the existing price_optimization_suggestions table

-- First, check if the table exists and has the old column type
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'price_optimization_suggestions') THEN
        -- Check if the column exists and is VARCHAR(255)
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'price_optimization_suggestions' 
            AND column_name = 'optimization_reason' 
            AND data_type = 'character varying' 
            AND character_maximum_length = 255
        ) THEN
            -- Alter the column to TEXT
            ALTER TABLE price_optimization_suggestions 
            ALTER COLUMN optimization_reason TYPE TEXT;
            
            RAISE NOTICE 'Successfully updated optimization_reason column from VARCHAR(255) to TEXT';
        ELSE
            RAISE NOTICE 'optimization_reason column is already TEXT or does not exist';
        END IF;
    ELSE
        RAISE NOTICE 'price_optimization_suggestions table does not exist';
    END IF;
END $$; 