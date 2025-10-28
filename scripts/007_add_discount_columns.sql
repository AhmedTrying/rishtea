-- Add missing discount columns to orders table
-- This script adds the discount_amount and discount_code columns that are needed
-- for the payment system to work properly

-- Add discount_amount column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add discount_code column  
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Add comments for documentation
COMMENT ON COLUMN orders.discount_amount IS 'Amount of discount applied to this order';
COMMENT ON COLUMN orders.discount_code IS 'Discount code used for this order (if any)';

-- Create index on discount_code for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_discount_code ON orders(discount_code);

-- Update any existing orders to have 0 discount_amount if NULL
UPDATE orders 
SET discount_amount = 0 
WHERE discount_amount IS NULL;