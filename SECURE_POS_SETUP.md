# Secure POS Customer Access Setup

## 🔒 Security Concerns & Solutions

You're absolutely right to be concerned about security! Here are the secure approaches:

## 🛡️ Option 1: Secure RLS Policies (Recommended)

### Step 1: Create Secure RLS Policies
Run this in your Supabase SQL Editor:

```sql
-- Keep RLS enabled for security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Remove existing policies
DROP POLICY IF EXISTS "pos_customer_read_access" ON public.customers;
DROP POLICY IF EXISTS "pos_customer_full_access" ON public.customers;

-- Create secure policies for authenticated users only
CREATE POLICY "pos_customer_read_access" ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "pos_customer_insert_access" ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "pos_customer_update_access" ON public.customers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "pos_customer_delete_access" ON public.customers
    FOR DELETE
    TO authenticated
    USING (true);
```

### Step 2: Use Service Role Key (Most Secure)
Create `src/lib/supabase-pos.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

// Service role client for POS operations (bypasses RLS securely)
export const supabasePos = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This is secure server-side
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Step 3: Add Environment Variable
Add to your `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get the service role key from:**
- Supabase Dashboard → Settings → API → Service Role Key

## 🛡️ Option 2: API Route Protection (Most Secure)

### Step 1: Create API Route
Create `src/app/api/customers/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database access
    const supabaseAdmin = createRouteHandlerClient({ cookies }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 2: Update CustomerSelectionModal
```typescript
const fetchCustomers = async () => {
  setLoading(true)
  try {
    const response = await fetch('/api/customers')
    if (!response.ok) {
      throw new Error('Failed to fetch customers')
    }
    const { data } = await response.json()
    setCustomers(data || [])
    setFilteredCustomers(data || [])
  } catch (error) {
    console.error('Error fetching customers:', error)
    setError('Failed to fetch customers')
  } finally {
    setLoading(false)
  }
}
```

## 🛡️ Option 3: Branch-Based Security (Advanced)

If you want branch-specific access:

```sql
-- Allow users to only see customers from their assigned branches
CREATE POLICY "branch_customer_access" ON public.customers
    FOR ALL
    TO authenticated
    USING (
        branch_id IN (
            SELECT branch_id FROM user_branch_assignments 
            WHERE user_id = auth.uid()
        )
        OR branch_id IS NULL
    );
```

## 🔐 Security Best Practices

1. **Never expose service role key in client-side code**
2. **Use API routes for sensitive operations**
3. **Implement proper authentication checks**
4. **Log all customer data access**
5. **Regular security audits**

## 🚀 Quick Setup (Choose One)

### For Immediate Testing:
```sql
-- Temporary: Disable RLS (use only for testing)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
```

### For Production:
Use **Option 1** or **Option 2** above.

## ✅ Security Checklist

- [ ] RLS policies configured
- [ ] Service role key secured
- [ ] API routes protected
- [ ] Authentication verified
- [ ] Error handling implemented
- [ ] Logging enabled

## 🎯 Recommended Approach

**For your POS system, I recommend Option 1** (Secure RLS + Service Role) because:
- ✅ Maintains database security
- ✅ Works with your custom auth
- ✅ Allows POS functionality
- ✅ Prevents unauthorized access
- ✅ Easy to implement

This way, your customer data remains protected while your POS can still access it securely!
