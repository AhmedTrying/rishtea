-- Customization Options Schema
-- This script creates tables for admin-manageable product customization options

-- Create customization_groups table (e.g., "Sugar Level", "Ice Level", "Size", "Add-ons")
CREATE TABLE IF NOT EXISTS customization_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  type TEXT DEFAULT 'single_choice' CHECK (type IN ('single_choice', 'multiple_choice', 'quantity')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customization_options table (e.g., "No Sugar", "Little", "Normal", "Extra")
CREATE TABLE IF NOT EXISTS customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES customization_groups(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Additional cost for this option
  icon TEXT, -- Emoji or icon identifier
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_customization_groups table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS product_customization_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID REFERENCES customization_groups(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, group_id)
);

-- Create category_customization_groups table (apply to all products in category)
CREATE TABLE IF NOT EXISTS category_customization_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  group_id UUID REFERENCES customization_groups(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, group_id)
);

-- Enable Row Level Security
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_customization_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customization_groups
CREATE POLICY "Anyone can view active customization groups"
  ON customization_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage customization groups"
  ON customization_groups FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for customization_options
CREATE POLICY "Anyone can view active customization options"
  ON customization_options FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage customization options"
  ON customization_options FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for product_customization_groups
CREATE POLICY "Anyone can view product customization groups"
  ON product_customization_groups FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product customization groups"
  ON product_customization_groups FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for category_customization_groups
CREATE POLICY "Anyone can view category customization groups"
  ON category_customization_groups FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage category customization groups"
  ON category_customization_groups FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create indexes for better performance
CREATE INDEX idx_customization_options_group ON customization_options(group_id);
CREATE INDEX idx_product_customization_groups_product ON product_customization_groups(product_id);
CREATE INDEX idx_product_customization_groups_group ON product_customization_groups(group_id);
CREATE INDEX idx_category_customization_groups_category ON category_customization_groups(category_id);
CREATE INDEX idx_category_customization_groups_group ON category_customization_groups(group_id);

-- Insert default customization groups and options
INSERT INTO customization_groups (name_ar, name_en, description_ar, description_en, type, is_required, display_order) VALUES
  ('مستوى السكر', 'Sugar Level', 'اختر مستوى السكر المفضل', 'Choose your preferred sugar level', 'single_choice', true, 1),
  ('مستوى الثلج', 'Ice Level', 'اختر مستوى الثلج المفضل', 'Choose your preferred ice level', 'single_choice', true, 2),
  ('الحجم', 'Size', 'اختر حجم المشروب', 'Choose drink size', 'single_choice', false, 3),
  ('إضافات', 'Add-ons', 'إضافات اختيارية', 'Optional add-ons', 'multiple_choice', false, 4)
ON CONFLICT DO NOTHING;

-- Insert sugar level options
INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'بدون سكر',
  'No Sugar',
  '🚫',
  1,
  0
FROM customization_groups g WHERE g.name_en = 'Sugar Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'قليل',
  'Little',
  '🟡',
  2,
  0
FROM customization_groups g WHERE g.name_en = 'Sugar Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'عادي',
  'Normal',
  '🟠',
  3,
  0
FROM customization_groups g WHERE g.name_en = 'Sugar Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'كثير',
  'Extra',
  '🔴',
  4,
  0
FROM customization_groups g WHERE g.name_en = 'Sugar Level'
ON CONFLICT DO NOTHING;

-- Insert ice level options
INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'بدون ثلج',
  'No Ice',
  '🚫',
  1,
  0
FROM customization_groups g WHERE g.name_en = 'Ice Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'قليل',
  'Little',
  '🧊',
  2,
  0
FROM customization_groups g WHERE g.name_en = 'Ice Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'عادي',
  'Normal',
  '❄️',
  3,
  0
FROM customization_groups g WHERE g.name_en = 'Ice Level'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'كثير',
  'Extra',
  '🧊❄️',
  4,
  0
FROM customization_groups g WHERE g.name_en = 'Ice Level'
ON CONFLICT DO NOTHING;

-- Insert size options
INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'صغير',
  'Small',
  '☕',
  1,
  0
FROM customization_groups g WHERE g.name_en = 'Size'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'متوسط',
  'Medium',
  '🥤',
  2,
  5.00
FROM customization_groups g WHERE g.name_en = 'Size'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'كبير',
  'Large',
  '🪣',
  3,
  10.00
FROM customization_groups g WHERE g.name_en = 'Size'
ON CONFLICT DO NOTHING;

-- Insert add-on options
INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'حليب إضافي',
  'Extra Milk',
  '🥛',
  1,
  3.00
FROM customization_groups g WHERE g.name_en = 'Add-ons'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'شوت إسبريسو',
  'Espresso Shot',
  '☕',
  2,
  8.00
FROM customization_groups g WHERE g.name_en = 'Add-ons'
ON CONFLICT DO NOTHING;

INSERT INTO customization_options (group_id, name_ar, name_en, icon, display_order, price_modifier)
SELECT 
  g.id,
  'كريمة مخفوقة',
  'Whipped Cream',
  '🍦',
  3,
  5.00
FROM customization_groups g WHERE g.name_en = 'Add-ons'
ON CONFLICT DO NOTHING;