-- Create default admin user
-- This script creates a default admin user for testing purposes
-- You should change the email and ensure this user exists in Supabase Auth

-- First, you need to create this user in Supabase Auth dashboard or via API
-- Email: admin@maghen.com
-- Password: admin123 (change this in production!)

-- Then run this script to add the user to admin_users table
-- Replace 'your-user-id-here' with the actual UUID from auth.users table

-- Example: If you created a user with email admin@maghen.com in Supabase Auth,
-- you can find their ID in the auth.users table and use it here

-- For now, we'll create a placeholder entry that you can update
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT 
  auth.uid(),
  'admin@maghen.com',
  'مدير النظام',
  'admin',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Alternative: If you want to create for a specific user ID
-- Uncomment and replace with actual user ID:
-- INSERT INTO admin_users (id, email, full_name, role, is_active) VALUES
--   ('your-actual-user-id-from-auth-users', 'admin@maghen.com', 'مدير النظام', 'admin', true)
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   role = EXCLUDED.role,
--   is_active = EXCLUDED.is_active;