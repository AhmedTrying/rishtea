-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.add_ons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name_ar text NOT NULL UNIQUE,
  name_en text,
  description_ar text,
  description_en text,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT add_ons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'admin'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description_ar text,
  description_en text,
  color text DEFAULT '#3B82F6'::text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.category_customization_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  group_id uuid,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT category_customization_groups_pkey PRIMARY KEY (id),
  CONSTRAINT category_customization_groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT category_customization_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.customization_groups(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  loyalty_points integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customization_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  type text DEFAULT 'single_choice'::text CHECK (type = ANY (ARRAY['single_choice'::text, 'multiple_choice'::text, 'quantity'::text])),
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customization_groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customization_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  price_modifier numeric DEFAULT 0,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customization_options_pkey PRIMARY KEY (id),
  CONSTRAINT customization_options_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.customization_groups(id)
);
CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  amount numeric NOT NULL,
  type text DEFAULT 'percentage'::text CHECK (type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  applies_to text DEFAULT 'order'::text CHECK (applies_to = ANY (ARRAY['order'::text, 'product'::text, 'category'::text])),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  minimum_order_amount numeric DEFAULT 0,
  maximum_discount_amount numeric,
  code text UNIQUE,
  is_single_use boolean DEFAULT false,
  customer_eligibility text DEFAULT 'all'::text CHECK (customer_eligibility = ANY (ARRAY['all'::text, 'new_customers'::text, 'existing_customers'::text])),
  product_ids ARRAY,
  category_ids ARRAY,
  CONSTRAINT discounts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  number_of_guests integer DEFAULT 1,
  status text DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'pending'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_rsvps_pkey PRIMARY KEY (id),
  CONSTRAINT event_rsvps_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  image_url text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.maintenance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  staff_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_history_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  product_id uuid,
  product_name_ar text NOT NULL,
  product_name_en text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  customizations jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  customer_name text,
  customer_phone text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'preparing'::text, 'ready'::text, 'delivered'::text, 'cancelled'::text])),
  total_amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  payment_method text DEFAULT 'cash'::text CHECK (payment_method = ANY (ARRAY['cash'::text, 'card'::text])),
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  customer_id uuid,
  dining_type text DEFAULT 'dine_in'::text CHECK (dining_type = ANY (ARRAY['dine_in'::text, 'takeaway'::text, 'delivery'::text, 'reservation'::text])),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.product_add_ons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  add_on_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_add_ons_pkey PRIMARY KEY (id),
  CONSTRAINT product_add_ons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_add_ons_add_on_id_fkey FOREIGN KEY (add_on_id) REFERENCES public.add_ons(id)
);
CREATE TABLE public.product_customization_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  group_id uuid,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_customization_groups_pkey PRIMARY KEY (id),
  CONSTRAINT product_customization_groups_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_customization_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.customization_groups(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  is_main boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_option_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL,
  value_ar text NOT NULL,
  value_en text,
  extra_price numeric DEFAULT 0,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_option_values_pkey PRIMARY KEY (id),
  CONSTRAINT product_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id)
);
CREATE TABLE public.product_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  name_ar text NOT NULL,
  name_en text,
  type text NOT NULL CHECK (type = ANY (ARRAY['single_choice'::text, 'multi_choice'::text, 'free_text'::text])),
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_options_pkey PRIMARY KEY (id),
  CONSTRAINT product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_sizes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  name_ar text NOT NULL,
  name_en text,
  price numeric NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_sizes_pkey PRIMARY KEY (id),
  CONSTRAINT product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  price numeric NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  show_in_kitchen boolean DEFAULT true,
  active boolean DEFAULT true,
  sku text UNIQUE,
  short_description_ar text,
  short_description_en text,
  full_description_ar text,
  full_description_en text,
  status text DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'sold_out'::text, 'hidden'::text])),
  priority_order integer DEFAULT 0,
  is_seasonal boolean DEFAULT false,
  allow_customer_notes boolean DEFAULT true,
  calories integer,
  allergens ARRAY,
  tags ARRAY,
  base_price numeric,
  is_market_price boolean DEFAULT false,
  currency text DEFAULT 'SAR'::text,
  stock_quantity integer DEFAULT 0,
  reorder_threshold integer DEFAULT 0,
  specifications jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.related_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  related_product_id uuid NOT NULL,
  relation_type text DEFAULT 'related'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT related_products_pkey PRIMARY KEY (id),
  CONSTRAINT related_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT related_products_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  cafe_name text,
  location text,
  phone_number text,
  operating_hours jsonb DEFAULT '{}'::jsonb,
  system_config jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.staff_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text, 'kitchen'::text])),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  zone text DEFAULT 'main'::text,
  capacity integer DEFAULT 4,
  status text DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'occupied'::text, 'reserved'::text, 'maintenance'::text])),
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tables_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tax_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tax_rate numeric NOT NULL CHECK (tax_rate >= 0::numeric AND tax_rate <= 100::numeric),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  min_order_amount numeric,
  max_order_amount numeric,
  dining_type text CHECK (dining_type = ANY (ARRAY['dine_in'::text, 'takeaway'::text, 'reservation'::text, 'all'::text])),
  specific_tables ARRAY,
  exclude_tables ARRAY,
  time_start time without time zone,
  time_end time without time zone,
  days_of_week ARRAY,
  customer_type text CHECK (customer_type = ANY (ARRAY['regular'::text, 'vip'::text, 'staff'::text, 'all'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tax_rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.upsell_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trigger_product text NOT NULL,
  suggested_product text NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT upsell_rules_pkey PRIMARY KEY (id)
);