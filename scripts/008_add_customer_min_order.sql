-- Add per-customer minimum order amount
-- Idempotent migration: safe to run multiple times

ALTER TABLE IF EXISTS public.customers
  ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10, 2) DEFAULT 0;

-- Optional index to query customers by phone quickly
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

COMMENT ON COLUMN public.customers.min_order_amount IS 'Minimum order total required for this customer';