import { createClient } from "@/lib/supabase/server"
import CategoriesTable from "@/components/categories-table"
import AddCategoryDialog from "@/components/add-category-dialog"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الفئات</h1>
          <p className="text-muted-foreground mt-1">إدارة فئات المنتجات</p>
        </div>
        <AddCategoryDialog />
      </div>

      <CategoriesTable categories={categories || []} />
    </div>
  )
}
