-- Enhanced Product Management Schema
-- This script adds comprehensive product management capabilities

-- First, let's enhance the existing products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text UNIQUE,
ADD COLUMN IF NOT EXISTS short_description_ar text,
ADD COLUMN IF NOT EXISTS short_description_en text,
ADD COLUMN IF NOT EXISTS full_description_ar text,
ADD COLUMN IF NOT EXISTS full_description_en text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'hidden')),
ADD COLUMN IF NOT EXISTS priority_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_seasonal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_customer_notes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS calories integer,
ADD COLUMN IF NOT EXISTS allergens text[], -- Array of allergen strings
ADD COLUMN IF NOT EXISTS tags text[], -- Array of tags like 'vegan', 'signature', etc.
ADD COLUMN IF NOT EXISTS base_price numeric, -- Will replace the existing price for base pricing
ADD COLUMN IF NOT EXISTS is_market_price boolean DEFAULT false; -- For "Ask staff" pricing

-- Product Images table for multiple images per product
CREATE TABLE IF NOT EXISTS public.product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    alt_text text,
    is_main boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Product Sizes table for size-based pricing
CREATE TABLE IF NOT EXISTS public.product_sizes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name_ar text NOT NULL,
    name_en text,
    price numeric NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Global Add-ons table
CREATE TABLE IF NOT EXISTS public.add_ons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar text NOT NULL,
    name_en text,
    description_ar text,
    description_en text,
    price numeric NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Product Add-ons junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.product_add_ons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    add_on_id uuid NOT NULL REFERENCES public.add_ons(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(product_id, add_on_id)
);

-- Product Options table (customizable options like milk type, ice level, etc.)
CREATE TABLE IF NOT EXISTS public.product_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name_ar text NOT NULL,
    name_en text,
    type text NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'free_text')),
    is_required boolean DEFAULT false,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Product Option Values table (the actual choices for each option)
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id uuid NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    value_ar text NOT NULL,
    value_en text,
    extra_price numeric DEFAULT 0,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_main ON public.product_images(is_main);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_product_id ON public.product_add_ons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_add_on_id ON public.product_add_ons(add_on_id);
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON public.product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_priority_order ON public.products(priority_order);

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage product images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin can manage product sizes" ON public.product_sizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin can manage add-ons" ON public.add_ons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin can manage product add-ons" ON public.product_add_ons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin can manage product options" ON public.product_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin can manage product option values" ON public.product_option_values
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Create public read policies for customer-facing data
CREATE POLICY "Public can read active product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND p.active = true 
            AND p.status = 'available'
        )
    );

CREATE POLICY "Public can read active product sizes" ON public.product_sizes
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND p.active = true 
            AND p.status = 'available'
        )
    );

CREATE POLICY "Public can read active add-ons" ON public.add_ons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active product add-ons" ON public.product_add_ons
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND p.active = true 
            AND p.status = 'available'
        )
    );

CREATE POLICY "Public can read active product options" ON public.product_options
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND p.active = true 
            AND p.status = 'available'
        )
    );

CREATE POLICY "Public can read active product option values" ON public.product_option_values
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM public.product_options po 
            JOIN public.products p ON p.id = po.product_id
            WHERE po.id = option_id 
            AND po.is_active = true
            AND p.active = true 
            AND p.status = 'available'
        )
    );

-- Insert some sample add-ons
INSERT INTO public.add_ons (name_ar, name_en, description_ar, description_en, price, display_order) VALUES
('شوت إسبريسو إضافي', 'Extra Espresso Shot', 'شوت إسبريسو إضافي لمزيد من الكافيين', 'Extra shot of espresso for more caffeine', 3.00, 1),
('كريمة مخفوقة', 'Whipped Cream', 'كريمة مخفوقة طازجة', 'Fresh whipped cream topping', 2.00, 2),
('صوص الكراميل', 'Caramel Drizzle', 'صوص الكراميل الحلو', 'Sweet caramel sauce drizzle', 1.50, 3),
('جبنة إضافية', 'Extra Cheese', 'جبنة إضافية للساندويتش', 'Extra cheese for sandwich', 4.00, 4),
('أفوكادو', 'Avocado', 'شرائح أفوكادو طازجة', 'Fresh avocado slices', 5.00, 5);

-- Insert sample product options and values
-- This will be done via the admin interface, but here are some examples:

-- Size option (will be added to coffee products)
-- Milk type option (will be added to coffee products)  
-- Ice level option (will be added to iced drinks)
-- Sugar level option (will be added to drinks)
-- Temperature option (will be added to applicable products)
-- Bread choice option (will be added to sandwiches)

COMMENT ON TABLE public.product_images IS 'Stores multiple images for each product including main image and gallery';
COMMENT ON TABLE public.product_sizes IS 'Stores size-based pricing for products (Small, Medium, Large, etc.)';
COMMENT ON TABLE public.add_ons IS 'Global add-ons that can be attached to multiple products';
COMMENT ON TABLE public.product_add_ons IS 'Junction table linking products to their available add-ons';
COMMENT ON TABLE public.product_options IS 'Customizable options for products (milk type, ice level, etc.)';
COMMENT ON TABLE public.product_option_values IS 'The actual values/choices for each product option';