-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('tax_rate', '15', 'Tax rate percentage for orders'),
  ('payment_methods', '["cash", "card"]', 'Available payment methods'),
  ('shop_name_ar', 'شاي ريش', 'Shop name in Arabic'),
  ('shop_name_en', 'Rish Tea', 'Shop name in English'),
  ('currency', 'SAR', 'Currency code'),
  ('min_order_amount', '0', 'Minimum order amount')
ON CONFLICT (key) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name_ar, name_en, display_order) VALUES
  ('شاي ساخن', 'Hot Tea', 1),
  ('قهوة', 'Coffee', 2),
  ('مشروبات باردة', 'Cold Drinks', 3),
  ('حلويات', 'Desserts', 4)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name_ar, name_en, description_ar, description_en, price, image_url, display_order)
SELECT 
  c.id,
  'شاي أسود',
  'Black Tea',
  'شاي أسود تقليدي',
  'Traditional black tea',
  15.00,
  '/black-tea.png',
  1
FROM categories c WHERE c.name_en = 'Hot Tea'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name_ar, name_en, description_ar, description_en, price, image_url, display_order)
SELECT 
  c.id,
  'شاي أخضر',
  'Green Tea',
  'شاي أخضر منعش',
  'Refreshing green tea',
  18.00,
  '/cup-of-green-tea.png',
  2
FROM categories c WHERE c.name_en = 'Hot Tea'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name_ar, name_en, description_ar, description_en, price, image_url, display_order)
SELECT 
  c.id,
  'شاي بالنعناع',
  'Mint Tea',
  'شاي بالنعناع الطازج',
  'Fresh mint tea',
  20.00,
  '/mint-tea.png',
  3
FROM categories c WHERE c.name_en = 'Hot Tea'
ON CONFLICT DO NOTHING;
