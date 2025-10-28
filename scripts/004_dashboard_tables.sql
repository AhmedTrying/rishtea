-- Dashboard Integration: Additional Tables
-- This script adds tables needed for the dashboard functionality

-- Create tables table for restaurant table management
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL,
  zone TEXT DEFAULT 'main',
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_profiles table
CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'kitchen')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  applies_to TEXT DEFAULT 'order' CHECK (applies_to IN ('order', 'product', 'category')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upsell_rules table
CREATE TABLE IF NOT EXISTS upsell_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_product TEXT NOT NULL,
  suggested_product TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  number_of_guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_history table for audit trail
CREATE TABLE IF NOT EXISTS order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(id),
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing tables to match dashboard schema
-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_in_kitchen BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add missing columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dining_type TEXT DEFAULT 'dine_in' CHECK (dining_type IN ('dine_in', 'takeaway', 'delivery', 'reservation'));

-- Update settings table to match dashboard needs
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cafe_name TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS system_config JSONB DEFAULT '{}';

-- Enable Row Level Security for new tables
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tables
CREATE POLICY "Anyone can view available tables" ON tables FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage tables" ON tables FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for customers
CREATE POLICY "Admins can view customers" ON customers FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for staff_profiles
CREATE POLICY "Admins can view staff" ON staff_profiles FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage staff" ON staff_profiles FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for discounts
CREATE POLICY "Admins can view discounts" ON discounts FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage discounts" ON discounts FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for upsell_rules
CREATE POLICY "Admins can view upsell rules" ON upsell_rules FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage upsell rules" ON upsell_rules FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for event_rsvps
CREATE POLICY "Anyone can create RSVPs" ON event_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view RSVPs" ON event_rsvps FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage RSVPs" ON event_rsvps FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for maintenance_requests
CREATE POLICY "Staff can view maintenance requests" ON maintenance_requests FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Staff can create maintenance requests" ON maintenance_requests FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Admins can manage maintenance requests" ON maintenance_requests FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for order_history
CREATE POLICY "Admins can view order history" ON order_history FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
CREATE POLICY "Staff can create order history" ON order_history FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_profiles(email);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_history(order_id);

-- Create a view for table dashboard
CREATE OR REPLACE VIEW table_dashboard AS
SELECT 
  t.number as table_number,
  t.status,
  t.is_available,
  o.id as current_order_id,
  o.total_amount as order_total,
  o.status as order_status,
  CASE 
    WHEN o.created_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 || ' minutes'
    ELSE NULL 
  END as time_occupied,
  t.zone,
  t.capacity
FROM tables t
LEFT JOIN orders o ON o.table_number = t.number AND o.status IN ('pending', 'preparing')
ORDER BY t.number;