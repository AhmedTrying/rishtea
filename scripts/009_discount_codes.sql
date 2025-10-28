-- Create discount_codes table for managing promotional codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for discount_codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active discount codes (for validation)
CREATE POLICY "Allow public read access to active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Allow admin full access
CREATE POLICY "Allow admin full access to discount codes" ON discount_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.id = auth.uid() 
      AND staff.role = 'admin'
    )
  );

-- Add some sample discount codes
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at) VALUES
  ('WELCOME10', 'خصم 10% للعملاء الجدد', 'percentage', 10.00, 50.00, 20.00, 100, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'خصم 20 ريال', 'fixed', 20.00, 100.00, NULL, 50, NOW() + INTERVAL '15 days'),
  ('STUDENT15', 'خصم 15% للطلاب', 'percentage', 15.00, 30.00, 25.00, NULL, NOW() + INTERVAL '60 days');

-- Add columns to orders table to track discount usage
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Create function to update discount usage count
CREATE OR REPLACE FUNCTION update_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_code IS NOT NULL THEN
    UPDATE discount_codes 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE code = NEW.discount_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update usage count when order is created
DROP TRIGGER IF EXISTS update_discount_usage_trigger ON orders;
CREATE TRIGGER update_discount_usage_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_usage();