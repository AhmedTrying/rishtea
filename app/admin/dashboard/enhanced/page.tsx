"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  LayoutDashboard, 
  Coffee, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Clock,
  Star,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import TableManagement from "@/components/admin/table-management"
import UserManagement from "@/components/admin/user-management"
import DiscountManagement from "@/components/admin/discount-management"
import WaiterCallsManagement from "@/components/admin/waiter-calls-management"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  averageRating: number
  lowStockProducts: number
  availableTables: number
  occupiedTables: number
}

interface RecentOrder {
  id: string
  table_number?: number
  total_amount: number
  status: string
  created_at: string
  customer_name?: string
}

interface TopProduct {
  id: string
  name_ar: string
  name_en?: string
  total_sold: number
  revenue: number
}

export default function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageRating: 0,
    lowStockProducts: 0,
    availableTables: 0,
    occupiedTables: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch basic stats
      const [
        ordersResult,
        productsResult,
        customersResult,
        tablesResult,
        reviewsResult
      ] = await Promise.all([
        supabase.from("orders").select("total_amount, status"),
        supabase.from("products").select("id, rating, reviews_count"),
        supabase.from("customers").select("id"),
        supabase.from("tables").select("status"),
        supabase.from("reviews").select("rating").eq("status", "approved")
      ])

      // Calculate stats
      const orders = ordersResult.data || []
      const products = productsResult.data || []
      const customers = customersResult.data || []
      const tables = tablesResult.data || []
      const reviews = reviewsResult.data || []

      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

      const availableTables = tables.filter(table => table.status === 'available').length
      const occupiedTables = tables.filter(table => table.status === 'occupied').length

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        averageRating,
        lowStockProducts: 0, // Will be calculated when stock management is implemented
        availableTables,
        occupiedTables,
      })

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("id, table_number, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentOrders(recentOrdersData || [])

      // Fetch top products (this would need order_items table)
      // For now, we'll use a placeholder
      setTopProducts([])

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "في الانتظار" },
      preparing: { variant: "default" as const, text: "قيد التحضير" },
      ready: { variant: "outline" as const, text: "جاهز" },
      completed: { variant: "default" as const, text: "مكتمل" },
      cancelled: { variant: "destructive" as const, text: "ملغي" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: "secondary" as const, text: status }
    
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة التحكم المتقدمة</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          تحديث البيانات
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</div>
            <p className="text-xs text-muted-foreground">من جميع الطلبات المكتملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">جميع الطلبات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">منتج متاح</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">عميل مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">من 5 نجوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطاولات المتاحة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableTables}</div>
            <p className="text-xs text-muted-foreground">طاولة متاحة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطاولات المشغولة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupiedTables}</div>
            <p className="text-xs text-muted-foreground">طاولة مشغولة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتجات قليلة المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">منتج يحتاج تجديد</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tables">الطاولات</TabsTrigger>
          <TabsTrigger value="waiter-calls">طلبات النادل</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="discounts">الخصومات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  الطلبات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          طلب #{order.id.slice(0, 8)}
                          {order.table_number && ` - طاولة ${order.table_number}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{order.total_amount?.toFixed(2)} ريال</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد طلبات حديثة
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد بيانات مبيعات بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <TableManagement />
        </TabsContent>

        <TabsContent value="waiter-calls">
          <WaiterCallsManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التحليلات والتقارير</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ستتوفر التحليلات المتقدمة والتقارير قريباً...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}