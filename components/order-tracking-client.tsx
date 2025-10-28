"use client"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  preparing: "قيد التحضير",
  ready: "جاهز",
  delivered: "مكتمل",
  cancelled: "ملغي",
}

const badgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "default",
  delivered: "outline",
  cancelled: "destructive",
}

export default function OrderTrackingClient({ orderId, initialStatus }: { orderId: string; initialStatus: string }) {
  const supabase = createClient()
  const [status, setStatus] = useState(initialStatus)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel("order-status-" + orderId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, (payload) => {
        const newStatus = (payload.new as any)?.status
        if (newStatus) {
          setStatus(newStatus)
        }
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return (
    <div className="flex items-center gap-3">
      <Badge variant={badgeVariant[status] || "default"} className="text-xs">
        حالة الطلب الآن: {statusLabels[status] || status}
      </Badge>
      {connected ? (
        <span className="text-xs text-green-600">تحديثات فورية مفعلة</span>
      ) : (
        <span className="text-xs text-muted-foreground">جارِ الاتصال بالتحديثات...</span>
      )}
    </div>
  )
}