import { createClient } from "@/lib/supabase/server"
import OrdersTable from "@/components/orders-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *
      )
    `,
    )
    .order("created_at", { ascending: false })

  const pendingOrders = orders?.filter((o) => o.status === "pending") || []
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || []
  const readyOrders = orders?.filter((o) => o.status === "ready") || []
  const completedOrders = orders?.filter((o) => o.status === "delivered") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الطلبات</h1>
        <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات العملاء</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>قيد الانتظار</CardDescription>
            <CardTitle className="text-3xl">{pendingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>قيد التحضير</CardDescription>
            <CardTitle className="text-3xl">{preparingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>جاهز</CardDescription>
            <CardTitle className="text-3xl">{readyOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مكتمل</CardDescription>
            <CardTitle className="text-3xl">{completedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">الكل ({orders?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">قيد الانتظار ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="preparing">قيد التحضير ({preparingOrders.length})</TabsTrigger>
          <TabsTrigger value="ready">جاهز ({readyOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">مكتمل ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrdersTable orders={orders || []} />
        </TabsContent>
        <TabsContent value="pending">
          <OrdersTable orders={pendingOrders} />
        </TabsContent>
        <TabsContent value="preparing">
          <OrdersTable orders={preparingOrders} />
        </TabsContent>
        <TabsContent value="ready">
          <OrdersTable orders={readyOrders} />
        </TabsContent>
        <TabsContent value="delivered">
          <OrdersTable orders={completedOrders} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
