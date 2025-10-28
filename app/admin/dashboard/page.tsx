import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import RecentOrdersTable from "@/components/recent-orders-table"
import TopProductsChart from "@/components/top-products-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch orders with items
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch products count
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  // Calculate statistics
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0

  // Get today's orders
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = orders?.filter((o) => new Date(o.created_at) >= today) || []
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

  // Get recent orders (last 10)
  const recentOrders = orders?.slice(0, 10) || []

  // Calculate top products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
  orders?.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      if (!productSales[item.product_name_ar]) {
        productSales[item.product_name_ar] = {
          name: item.product_name_ar,
          quantity: 0,
          revenue: 0,
        }
      }
      productSales[item.product_name_ar].quantity += item.quantity
      productSales[item.product_name_ar].revenue += item.total_price
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة المعلومات</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على أداء المتجر</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">اليوم: {todayRevenue.toFixed(2)} ر.س</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">اليوم: {todayOrders.length} طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">طلبات قيد الانتظار</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج إلى معالجة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">منتج متاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
            <CardDescription>المنتجات الأكثر طلباً</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart products={topProducts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الطلبات الأخيرة</CardTitle>
            <CardDescription>آخر 10 طلبات</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
