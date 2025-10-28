# Supabase Database Setup Guide for Table Management

## Overview
This guide will help you set up the database tables needed for the table management system in your Supabase project.

## Steps to Run the Database Schema

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (Rish Tea project)

### 2. Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click on "New query" to create a new SQL script

### 3. Run the Database Schema Script
1. Copy the entire content from `scripts/004_dashboard_tables.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

### 4. Verify Tables Creation
After running the script, verify that the following tables were created:

#### Core Tables:
- `tables` - Restaurant table management
- `customers` - Customer information
- `staff_profiles` - Staff management
- `reviews` - Customer reviews
- `discounts` - Discount management
- `upsell_rules` - Upsell suggestions
- `events` - Event management
- `event_rsvps` - Event reservations
- `maintenance_requests` - Table maintenance
- `order_history` - Order audit trail

#### Views:
- `table_dashboard` - Dashboard view for table status

### 5. Check Table Structure
You can verify the tables were created correctly by running:

```sql
-- Check if tables table exists and has correct structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tables' 
ORDER BY ordinal_position;

-- Check if table_dashboard view exists
SELECT * FROM table_dashboard LIMIT 5;
```

### 6. Insert Sample Data (Optional)
To test the system, you can insert some sample tables:

```sql
-- Insert sample tables
INSERT INTO tables (number, zone, capacity, status) VALUES
(1, 'main', 4, 'available'),
(2, 'main', 2, 'available'),
(3, 'outdoor', 6, 'available'),
(4, 'vip', 8, 'available'),
(5, 'family', 4, 'maintenance');
```

## Troubleshooting

### Common Issues:

1. **Permission Errors**: Make sure you're logged in as the project owner or have admin privileges.

2. **Table Already Exists**: If you see "table already exists" errors, the script uses `CREATE TABLE IF NOT EXISTS` so it should be safe to run multiple times.

3. **RLS Policy Errors**: If you get Row Level Security policy errors, make sure the `admin_users` table exists from previous scripts.

### Verification Commands:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table_dashboard view
SELECT * FROM table_dashboard;

-- Count records in tables
SELECT COUNT(*) as table_count FROM tables;
```

## Next Steps

After successfully running the database script:

1. The table management API endpoints are already created (`/api/tables/` and `/api/tables/status/`)
2. The table management UI component is integrated into the admin dashboard
3. You can test the complete functionality by:
   - Adding new tables
   - Updating table status
   - Viewing the table dashboard
   - Managing table information

## Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Ensure all previous migration scripts have been run
4. Check that RLS policies are properly configured

The table management system should now be fully functional with database backend support!