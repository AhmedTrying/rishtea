import { createClient } from "@/lib/supabase/server"
import MenuClient from "@/components/menu-client"

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  customization: {
    sugar: string
    ice: string
    notes: string
  }
}

async function fetchMenuCategories() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select(
      `
      *,
      products (
        *,
        product_images (
          image_url,
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
          add_on_id,
          is_active,
          display_order,
          add_ons (
            name_ar,
            name_en,
            price
          )
        )
      )
    `,
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  // Filter only available products and sort them
  return (
    categories?.map((category) => ({
      id: category.id,
      name: category.name_ar,
      items:
        category.products
          ?.filter((p: any) => p.status === 'available') // Use status instead of is_available
          .sort((a: any, b: any) => a.priority_order - b.priority_order) // Use priority_order instead of display_order
          .map((product: any) => {
            // Get all images sorted by display_order
            const sortedImages = product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || []

            // Sizes (active only, sorted)
            const sizes = (product.product_sizes || [])
              .filter((s: any) => s.is_active)
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((s: any) => ({ name: s.name_ar, price: Number(s.price) }))

            // Add-ons (active only, sorted)
            const addOns = (product.product_add_ons || [])
              .filter((pa: any) => pa.is_active && pa.add_ons)
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((pa: any) => ({ name: pa.add_ons.name_ar, price: Number(pa.add_ons.price) }))
            
            return {
              id: product.id, // Keep as string UUID from database
              name: product.name_ar,
              price: parseFloat(product.price) || 0, // Ensure price is a number
              description: product.short_description_ar || product.description_ar || "",
              image: sortedImages[0]?.image_url || product.image_url || "/placeholder.svg",
              images: sortedImages.length > 0 ? sortedImages.map((img: any) => img.image_url) : [product.image_url || "/placeholder.svg"],
              // Extended details for the product card/dialog
              fullDescription: product.full_description_ar || product.description_ar || "",
              calories: product.calories ?? null,
              sizes,
              addOns,
              allergens: product.allergens || [],
              tags: product.tags || [],
              category: category.name_ar,
            }
          }) || [],
    })) || []
  )
}

export default async function MenuPage() {
  const menuCategories = await fetchMenuCategories()

  return <MenuClient menuCategories={menuCategories} />
}
