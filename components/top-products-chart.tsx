"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface Product {
  name: string
  quantity: number
  revenue: number
}

export default function TopProductsChart({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">لا توجد بيانات لعرضها</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={products}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                  <p className="font-medium">{payload[0].payload.name}</p>
                  <p className="text-sm text-muted-foreground">الكمية: {payload[0].value}</p>
                  <p className="text-sm text-muted-foreground">
                    الإيرادات: {payload[0].payload.revenue.toFixed(2)} ر.س
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
