"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { useState } from "react"
import OrderDetailsDialog from "./order-details-dialog"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }).format(amount)
  } catch {
    return `${amount} ر.س`
  }
}

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Riyadh",
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ")
  }
}

const paymentLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
  unknown: "—",
}

interface Order {
  id: string
  table_id?: string | null
  order_code?: string
  status: string
  customer_name?: string | null
  customer_phone?: string | null
  created_at: string
  total_amount: number
  payment_status?: string | null
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "default",
  delivered: "outline",
  cancelled: "destructive",
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  preparing: "قيد التحضير",
  ready: "جاهز",
  delivered: "مكتمل",
  cancelled: "ملغي",
}

const paymentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">الرقم</TableHead>
              <TableHead>الطاولة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الدفع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={9} className="text-center text-muted-foreground">
                  لا توجد طلبات
                 </TableCell>
               </TableRow>
             ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.order_code ?? order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.table_id ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status] ?? "secondary"}>
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.customer_name ?? "—"}</TableCell>
                  <TableCell>{order.customer_phone ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>{paymentLabels[order.payment_status ?? "unknown"]}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {/* Show details button instead of always rendering the dialog */}
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  )
}
