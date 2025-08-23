-- =====================================================
-- Add Branch-Based RLS Policies for Users
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON users;

-- Create branch-based RLS policies

-- Policy for viewing users: Users can only see users from their own branch
CREATE POLICY "Users can view users from their branch" ON users
    FOR SELECT USING (
        -- Admin users can see all users
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
        OR
        -- Regular users can only see users from their own branch
        (
            branch_id = (
                SELECT branch_id FROM users WHERE id = auth.uid()
            )
            OR branch_id IS NULL -- Allow seeing users without branch assignment
        )
    );

-- Policy for inserting users: Only admins can create users
CREATE POLICY "Only admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Policy for updating users: Users can update their own profile, admins can update any user
CREATE POLICY "Users can update own profile or admins can update any" ON users
    FOR UPDATE USING (
        -- Users can update their own profile
        auth.uid() = id
        OR
        -- Admins can update any user
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Policy for deleting users: Only admins can delete users
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Add branch-based policies for other tables

-- Products: Users can only see products from their branch
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
CREATE POLICY "Users can view products from their branch" ON products
    FOR SELECT USING (
        -- Admin users can see all products
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
        OR
        -- Regular users can only see products from their branch
        branch_id = (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
        OR branch_id IS NULL -- Allow seeing products without branch assignment
    );

-- Customers: Users can only see customers from their branch
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
CREATE POLICY "Users can view customers from their branch" ON customers
    FOR SELECT USING (
        -- Admin users can see all customers
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
        OR
        -- Regular users can only see customers from their branch
        branch_id = (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
        OR branch_id IS NULL -- Allow seeing customers without branch assignment
    );

-- Sales: Users can only see sales from their branch
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
CREATE POLICY "Users can view sales from their branch" ON sales
    FOR SELECT USING (
        -- Admin users can see all sales
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = auth.uid() AND ur.name = 'admin'
        )
        OR
        -- Regular users can only see sales from their branch
        branch_id = (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
        OR branch_id IS NULL -- Allow seeing sales without branch assignment
    );

-- Create a function to get current user's branch
CREATE OR REPLACE FUNCTION get_current_user_branch()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN user_roles ur ON u.role_id = ur.id
        WHERE u.id = auth.uid() AND ur.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 