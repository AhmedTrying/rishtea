"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface StoreSettingsFormProps {
  settings: Record<string, string>
}

export default function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    shop_name_ar: settings.shop_name_ar || "شاي ريش",
    shop_name_en: settings.shop_name_en || "Rish Tea",
    currency: settings.currency || "SAR",
    min_order_amount: settings.min_order_amount || "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const updates = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("settings").upsert(updates, {
      onConflict: "key",
    })

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الإعدادات",
        variant: "destructive",
      })
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات المتجر بنجاح",
      })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="shop_name_ar">اسم المتجر بالعربية</Label>
          <Input
            id="shop_name_ar"
            value={formData.shop_name_ar}
            onChange={(e) => setFormData({ ...formData, shop_name_ar: e.target.value })}
            className="text-right"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shop_name_en">اسم المتجر بالإنجليزية</Label>
          <Input
            id="shop_name_en"
            value={formData.shop_name_en}
            onChange={(e) => setFormData({ ...formData, shop_name_en: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currency">العملة</Label>
          <Input
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            placeholder="SAR"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_order_amount">الحد الأدنى للطلب</Label>
          <Input
            id="min_order_amount"
            type="number"
            step="0.01"
            value={formData.min_order_amount}
            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
            className="text-right"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  )
}
