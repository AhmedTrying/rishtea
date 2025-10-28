import { createClient } from "@/lib/supabase/server"
import EnhancedProductForm from "@/components/enhanced-product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  // Get add-ons
  const { data: addOns } = await supabase
    .from("add_ons")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <EnhancedProductForm 
        categories={categories || []} 
        addOns={addOns || []}
        mode="create"
      />
    </div>
  )
}
