/*
Transactional bulk replace of products.
Requires env SUPABASE_DB_URL pointing to the Supabase Postgres connection string.
This script will:
- Validate input products
- Ensure supporting schema (missing columns, related_products table)
- Delete all existing products (cascades will clear dependent rows)
- Insert new products, categories, images, and relations
- Verify the final state
*/

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

function getEnvUrl() {
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing SUPABASE_DB_URL (or DATABASE_URL) environment variable')
  }
  return url
}

function readProductsJson() {
  const file = path.resolve(__dirname, 'new_products.json')
  if (!fs.existsSync(file)) {
    throw new Error(`Products JSON not found at ${file}`)
  }
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.products)) {
    throw new Error('JSON must have { "products": [...] }')
  }
  return parsed.products
}

function validateProducts(products) {
  const errors = []
  products.forEach((p, i) => {
    const prefix = `Product[${i}]`
    if (!p.name_ar && !p.name_en && !p.name) errors.push(`${prefix}: name_ar/name_en/name is required`)
    if (!p.sku) errors.push(`${prefix}: sku is required`)
    const hasPrice = (p.base_price != null) || (p.price != null) || (p.pricing && p.pricing.base_price != null)
    if (!hasPrice) errors.push(`${prefix}: base_price or price is required`)
    if (!p.category || (!p.category.name_ar && !p.category.id)) errors.push(`${prefix}: category.name_ar or category.id is required`)
    if (!Array.isArray(p.images)) errors.push(`${prefix}: images must be an array`)
    if (p.inventory) {
      if (p.inventory.stock_quantity != null && p.inventory.stock_quantity < 0) errors.push(`${prefix}: stock_quantity cannot be negative`)
      if (p.inventory.reorder_threshold != null && p.inventory.reorder_threshold < 0) errors.push(`${prefix}: reorder_threshold cannot be negative`)
    }
  })
  if (errors.length) {
    const err = new Error(`Validation failed with ${errors.length} issues`) 
    err.details = errors
    throw err
  }
}

async function ensureSupportingSchema(client) {
  // Create related_products table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.related_products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      related_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      relation_type text DEFAULT 'related',
      created_at timestamptz DEFAULT now(),
      UNIQUE(product_id, related_product_id)
    );
  `)

  // Add missing columns to products
  await client.query(`
    ALTER TABLE public.products
      ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR',
      ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reorder_threshold integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;
  `)
}

async function upsertCategory(client, category) {
  if (category.id) return category.id
  const nameAr = category.name_ar || category.name
  const nameEn = category.name_en || null
  // Try find by Arabic name
  const { rows: existing } = await client.query(
    'SELECT id FROM public.categories WHERE name_ar = $1 LIMIT 1',
    [nameAr]
  )
  if (existing.length) return existing[0].id
  const { rows } = await client.query(
    `INSERT INTO public.categories (name_ar, name_en, is_active, display_order)
     VALUES ($1, $2, true, COALESCE((SELECT COALESCE(MAX(display_order),0)+1 FROM public.categories), 0))
     RETURNING id`,
    [nameAr, nameEn]
  )
  return rows[0].id
}

async function insertProduct(client, product, categoryId) {
  const nameAr = product.name_ar || product.name || null
  const nameEn = product.name_en || null
  const shortDescAr = product.short_description_ar || null
  const descAr = product.description_ar || product.description || null
  const descEn = product.description_en || null
  const sku = product.sku
  const basePrice = product.base_price != null ? product.base_price : product.price
  const discount = product.pricing?.discount_amount || 0
  const finalPrice = basePrice != null ? Number(basePrice) - Number(discount || 0) : null
  const currency = product.pricing?.currency || product.currency || 'SAR'
  const statusMap = { available: 'available', sold_out: 'sold_out', hidden: 'hidden' }
  const availability = statusMap[(product.inventory?.availability_status || 'available').toLowerCase()] || 'available'
  const stockQty = product.inventory?.stock_quantity ?? 0
  const reorderThreshold = product.inventory?.reorder_threshold ?? 0
  const priorityOrder = product.priority_order ?? 0
  const isSeasonal = !!product.is_seasonal
  const allowNotes = product.allow_customer_notes ?? true
  const specifications = product.specifications ? JSON.stringify(product.specifications) : '{}'
  const isAvailable = availability === 'available'

  const { rows } = await client.query(
    `INSERT INTO public.products (
      category_id, name_ar, name_en, description_ar, description_en, short_description_ar,
      price, base_price, currency, status, priority_order, is_seasonal,
      allow_customer_notes, sku, stock_quantity, reorder_threshold, specifications,
      is_available, active
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,
      $18,true
    ) RETURNING id`,
    [
      categoryId, nameAr, nameEn, descAr, descEn, shortDescAr,
      finalPrice, basePrice, currency, availability, priorityOrder, isSeasonal,
      allowNotes, sku, stockQty, reorderThreshold, specifications,
      isAvailable
    ]
  )
  return rows[0].id
}

async function insertImages(client, productId, images) {
  if (!Array.isArray(images) || images.length === 0) return
  // insert with first image as main
  for (let i = 0; i < images.length; i++) {
    const url = typeof images[i] === 'string' ? images[i] : images[i]?.image_url
    if (!url) continue
    await client.query(
      `INSERT INTO public.product_images (product_id, image_url, alt_text, is_main, display_order)
       VALUES ($1,$2,$3,$4,$5)`,
      [productId, url, null, i === 0, i]
    )
  }
}

async function insertRelations(client, productsBySku, relationsBySku) {
  for (const sku of Object.keys(relationsBySku)) {
    const fromId = productsBySku.get(sku)
    if (!fromId) continue
    const relatedSkus = relationsBySku[sku]
    for (const rsku of relatedSkus) {
      const toId = productsBySku.get(rsku)
      if (!toId) continue
      if (fromId === toId) continue
      await client.query(
        `INSERT INTO public.related_products (product_id, related_product_id)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [fromId, toId]
      )
    }
  }
}

async function main() {
  const products = readProductsJson()
  validateProducts(products)

  const client = new Client({ connectionString: getEnvUrl(), ssl: { rejectUnauthorized: false } })
  await client.connect()

  try {
    await client.query('BEGIN')
    await client.query('SET search_path TO public')

    await ensureSupportingSchema(client)

    // Clear existing products (dependent rows will be removed via cascade FKs where defined)
    await client.query('DELETE FROM public.products')

    const productsBySku = new Map()
    const relationsBySku = {}

    // Insert categories/products/images
    for (const p of products) {
      const categoryId = await upsertCategory(client, p.category || {})
      const productId = await insertProduct(client, p, categoryId)
      productsBySku.set(p.sku, productId)
      await insertImages(client, productId, p.images || [])
      if (Array.isArray(p.related_skus) && p.related_skus.length) {
        relationsBySku[p.sku] = p.related_skus
      }
    }

    // Insert relations after all products exist
    await insertRelations(client, productsBySku, relationsBySku)

    // Verification
    const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS count FROM public.products')
    const count = countRows[0]?.count || 0

    await client.query('COMMIT')

    console.log(`Bulk replace complete. Inserted products: ${count}`)

    // Output sampling
    const { rows: sample } = await client.query('SELECT id, name_ar, sku, price, currency, stock_quantity FROM public.products ORDER BY priority_order, name_ar LIMIT 10')
    console.table(sample)
  } catch (err) {
    console.error('Error during bulk replace:', err.message)
    if (err.details) console.error(err.details)
    try { await client.query('ROLLBACK') } catch(e) {}
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  main()
}