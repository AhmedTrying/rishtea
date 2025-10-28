import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import ProductsTable from "@/components/products-table"
import { Suspense } from "react"

interface SearchParams {
  page?: string
  search?: string
  category?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams

  // Get all categories for filter dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  // Get all add-ons for product management
  const { data: addOns } = await supabase
    .from("add_ons")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة شاملة لجميع منتجات المقهى - القهوة، الطعام، الحلويات، والعروض الموسمية
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/dashboard/categories">
            <Button variant="outline" size="lg">
              إدارة الفئات
            </Button>
          </Link>
          <Link href="/admin/dashboard/add-ons">
            <Button variant="outline" size="lg">
              إدارة الإضافات
            </Button>
          </Link>
          <Link href="/admin/dashboard/products/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <Suspense fallback={<div>جارِ التحميل...</div>}>
        <ProductsTable categories={categories || []} addOns={addOns || []} searchParams={resolvedParams} />
      </Suspense>
    </div>
  )
}
