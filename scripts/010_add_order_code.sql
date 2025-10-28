-- 010_add_order_code.sql
-- Purpose: introduce short human-friendly order_code (e.g., 0001, A001)
-- Strategy: keep UUID id as primary key; add unique text order_code generated via sequence

-- Create a dedicated sequence for order codes if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND c.relname = 'orders_code_seq' AND n.nspname = 'public'
  ) THEN
    CREATE SEQUENCE public.orders_code_seq START 1 INCREMENT 1 OWNED BY NONE;
  END IF;
END $$;

-- Add order_code column with sequence and default value
ALTER TABLE public.orders 
ADD COLUMN order_code text UNIQUE DEFAULT ('A' || LPAD(nextval('public.orders_code_seq')::text, 4, '0'));

-- Backfill missing codes for existing rows
UPDATE public.orders o
SET order_code = 'A' || LPAD(nextval('public.orders_code_seq')::text, 4, '0')
WHERE o.order_code IS NULL;

-- Optional: quick lookup index (redundant with unique index, kept for clarity)
-- CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);

-- Notes:
-- - If you want a prefix such as 'A', you can later update inserts to set
--   order_code = 'A' || LPAD(nextval('public.orders_code_seq')::text, 4, '0'),
--   or implement a trigger/function that derives the prefix from context.
-- - We intentionally do NOT change primary key type; UUID id remains stable for relations.