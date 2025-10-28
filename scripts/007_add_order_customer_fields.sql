-- Add customer name and phone columns to orders table (idempotent)
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Optional: index on phone for faster lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);