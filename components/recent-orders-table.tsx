import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface Order {
  id: string
  table_number: number
  status: string
  total_amount: number
  created_at: string
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  preparing: "قيد التحضير",
  ready: "جاهز",
  delivered: "مكتمل",
  cancelled: "ملغي",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "default",
  delivered: "outline",
  cancelled: "destructive",
}

export default function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">الطاولة</TableHead>
          <TableHead className="text-right">الحالة</TableHead>
          <TableHead className="text-right">المبلغ</TableHead>
          <TableHead className="text-right">الوقت</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
              لا توجد طلبات
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-bold">#{order.table_number}</TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status]} className="text-xs">
                  {statusLabels[order.status]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{order.total_amount.toFixed(2)} ر.س</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), "HH:mm", { locale: ar })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
