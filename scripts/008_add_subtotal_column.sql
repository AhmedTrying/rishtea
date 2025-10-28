-- Migration: Add subtotal column to orders table
-- This script adds the subtotal column to store the pre-tax amount

-- Add subtotal column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN public.orders.subtotal IS 'Subtotal amount before taxes and after discounts';

-- Update existing orders to calculate subtotal (total_amount - tax_amount)
UPDATE public.orders 
SET subtotal = COALESCE(total_amount - COALESCE(tax_amount, 0), 0)
WHERE subtotal IS NULL OR subtotal = 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_subtotal ON public.orders(subtotal);