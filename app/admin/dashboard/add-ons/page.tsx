import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import AddOnsTable from "@/components/add-ons-table"

export default async function AddOnsPage() {
  const supabase = await createClient()

  const { data: addOns } = await supabase
    .from("add_ons")
    .select("*")
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإضافات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة الإضافات المتاحة للمنتجات مثل الكريمة المخفوقة، الشوت الإضافي، إلخ
          </p>
        </div>
        <Link href="/admin/dashboard/add-ons/new">
          <Button size="lg">
            <Plus className="ml-2 w-5 h-5" />
            إضافة إضافة جديدة
          </Button>
        </Link>
      </div>

      <AddOnsTable addOns={addOns || []} />
    </div>
  )
}