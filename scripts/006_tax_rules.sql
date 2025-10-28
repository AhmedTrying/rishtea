-- Create tax_rules table for conditional tax management
CREATE TABLE IF NOT EXISTS tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tax_rate DECIMAL(5,2) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority rules are applied first
  
  -- Condition fields
  min_order_amount DECIMAL(10,2), -- Minimum order amount to apply this tax
  max_order_amount DECIMAL(10,2), -- Maximum order amount to apply this tax
  dining_type TEXT CHECK (dining_type IN ('dine_in', 'takeaway', 'reservation', 'all')), -- Which dining types this applies to
  specific_tables INTEGER[], -- Array of specific table numbers (null means all tables)
  exclude_tables INTEGER[], -- Array of table numbers to exclude
  time_start TIME, -- Start time for time-based conditions
  time_end TIME, -- End time for time-based conditions
  days_of_week INTEGER[], -- Array of days (0=Sunday, 1=Monday, etc.) null means all days
  customer_type TEXT CHECK (customer_type IN ('regular', 'vip', 'staff', 'all')), -- Customer type conditions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tax_rules_active ON tax_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_rules_priority ON tax_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_tax_rules_dining_type ON tax_rules(dining_type);

-- Enable Row Level Security
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tax_rules (admins can manage, public can read active rules)
CREATE POLICY "Anyone can view active tax rules"
  ON tax_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tax rules"
  ON tax_rules FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Insert default tax rule (15% VAT for all orders)
INSERT INTO tax_rules (
  name, 
  description, 
  tax_rate, 
  dining_type, 
  priority,
  is_active
) VALUES (
  'VAT (15%)',
  'Standard Value Added Tax for all orders',
  15.00,
  'all',
  1,
  true
) ON CONFLICT DO NOTHING;

-- Insert sample conditional tax rules
INSERT INTO tax_rules (
  name, 
  description, 
  tax_rate, 
  min_order_amount,
  dining_type, 
  priority,
  is_active
) VALUES (
  'High Value Order Tax',
  'Additional tax for orders above 500 SAR',
  5.00,
  500.00,
  'all',
  2,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO tax_rules (
  name, 
  description, 
  tax_rate, 
  dining_type, 
  time_start,
  time_end,
  priority,
  is_active
) VALUES (
  'Peak Hours Service Tax',
  'Additional service tax during peak hours (7PM-10PM)',
  3.00,
  'dine_in',
  '19:00:00',
  '22:00:00',
  3,
  false
) ON CONFLICT DO NOTHING;