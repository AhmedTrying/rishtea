-- Fix infinite recursion in admin_users RLS policy
-- This script removes problematic RLS policies and creates a simple, safe policy

-- First, disable RLS temporarily to clean up
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can insert their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can delete their own data" ON admin_users;
DROP POLICY IF EXISTS "Users can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a simple, safe policy that allows authenticated users to read admin_users
-- This avoids recursion by not referencing the admin_users table in the policy condition
CREATE POLICY "Allow authenticated users to read admin_users" ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role to manage admin_users (for server-side operations)
CREATE POLICY "Allow service role full access to admin_users" ON admin_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'admin_users';