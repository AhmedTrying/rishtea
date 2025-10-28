-- Fix admin user issue
-- This script will properly add the authenticated user to admin_users table

-- First, let's see what users exist in auth.users
-- You should run this in Supabase SQL Editor

-- Step 1: Check existing auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check existing admin_users
SELECT * FROM admin_users;

-- Step 3: If you see your user in auth.users but not in admin_users, 
-- replace 'YOUR_USER_ID_HERE' with the actual ID from auth.users
-- and run this INSERT:

-- INSERT INTO admin_users (id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'admin@maghen.com',
--   'مدير النظام',
--   'admin',
--   true
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   role = EXCLUDED.role,
--   is_active = EXCLUDED.is_active;

-- Alternative: If you want to add ALL auth users as admins (for testing):
-- INSERT INTO admin_users (id, email, full_name, role, is_active)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', 'مدير النظام'),
--   'admin',
--   true
-- FROM auth.users
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   role = EXCLUDED.role,
--   is_active = EXCLUDED.is_active;