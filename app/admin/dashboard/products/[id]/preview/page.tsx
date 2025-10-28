import { createClient } from "@/lib/supabase/server"
import ProductPreview from "@/components/product-preview"
import { notFound } from "next/navigation"

export default async function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get product with all related data
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name_ar,
        name_en,
        color
      ),
      product_images (
        id,
        image_url,
        alt_text,
        is_main,
        display_order
      ),
      product_sizes (
        id,
        name_ar,
        name_en,
        price,
        display_order,
        is_active
      ),
      product_add_ons (
        id,
        add_on_id,
        is_active,
        display_order,
        add_ons (
          id,
          name_ar,
          name_en,
          description_ar,
          description_en,
          price
        )
      ),
      product_options (
        id,
        name_ar,
        name_en,
        type,
        is_required,
        display_order,
        is_active,
        product_option_values (
          id,
          value_ar,
          value_en,
          extra_price,
          display_order,
          is_active
        )
      )
    `)
    .eq("id", id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProductPreview product={product} />
    </div>
  )
}