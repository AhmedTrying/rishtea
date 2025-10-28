"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TaxSettingsFormProps {
  settings: Record<string, string>
}

export default function TaxSettingsForm({ settings }: TaxSettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [taxRate, setTaxRate] = useState(settings.tax_rate || "15")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const rate = Number.parseFloat(taxRate)
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون نسبة الضريبة بين 0 و 100",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("settings").upsert(
      {
        key: "tax_rate",
        value: taxRate,
        description: "Tax rate percentage for orders",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      },
    )

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث نسبة الضريبة",
        variant: "destructive",
      })
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث نسبة الضريبة بنجاح",
      })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          سيتم تطبيق نسبة الضريبة المحددة على جميع الطلبات الجديدة. النسبة الحالية في المملكة العربية السعودية هي 15%.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="tax_rate">نسبة الضريبة (%)</Label>
        <div className="flex gap-4 items-center">
          <Input
            id="tax_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="max-w-xs text-right"
          />
          <span className="text-muted-foreground">%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          مثال: إذا كانت قيمة الطلب 100 ر.س، سيتم إضافة {((Number.parseFloat(taxRate) || 0) * 100) / 100} ر.س كضريبة
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">معاينة الحساب</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>100.00 ر.س</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الضريبة ({taxRate}%)</span>
            <span>{((Number.parseFloat(taxRate) || 0) * 100) / 100} ر.س</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>المجموع الكلي</span>
            <span>{(100 + (Number.parseFloat(taxRate) || 0)).toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  )
}
