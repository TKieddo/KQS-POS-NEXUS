-- Disable the loyalty tier trigger that's automatically resetting tiers
-- This trigger is causing manual tier updates to be overridden

-- Drop the trigger that's causing the issue
DROP TRIGGER IF EXISTS trigger_update_loyalty_tier ON public.loyalty_accounts;

-- Also drop the function to prevent it from being recreated
DROP FUNCTION IF EXISTS update_loyalty_tier();

-- Verify the trigger is gone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_loyalty_tier' 
    AND tgrelid = 'public.loyalty_accounts'::regclass
  ) THEN
    RAISE NOTICE 'Successfully disabled loyalty tier trigger';
  ELSE
    RAISE NOTICE 'Trigger still exists - manual intervention may be needed';
  END IF;
END $$; 