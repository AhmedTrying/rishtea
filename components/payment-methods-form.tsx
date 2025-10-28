"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Banknote } from "lucide-react"

interface PaymentMethodsFormProps {
  settings: Record<string, string>
}

export default function PaymentMethodsForm({ settings }: PaymentMethodsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const currentMethods = settings.payment_methods ? JSON.parse(settings.payment_methods) : ["cash", "card"]

  const [paymentMethods, setPaymentMethods] = useState({
    cash: currentMethods.includes("cash"),
    card: currentMethods.includes("card"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const enabledMethods = Object.entries(paymentMethods)
      .filter(([_, enabled]) => enabled)
      .map(([method]) => method)

    if (enabledMethods.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب تفعيل طريقة دفع واحدة على الأقل",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("settings").upsert(
      {
        key: "payment_methods",
        value: JSON.stringify(enabledMethods),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      },
    )

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث طرق الدفع",
        variant: "destructive",
      })
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث طرق الدفع بنجاح",
      })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="cash" className="text-base font-medium cursor-pointer">
                الدفع النقدي
              </Label>
              <p className="text-sm text-muted-foreground">قبول الدفع نقداً عند الاستلام</p>
            </div>
          </div>
          <Checkbox
            id="cash"
            checked={paymentMethods.cash}
            onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, cash: checked as boolean })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="card" className="text-base font-medium cursor-pointer">
                الدفع بالبطاقة
              </Label>
              <p className="text-sm text-muted-foreground">قبول الدفع بالبطاقات الائتمانية والمدينة</p>
            </div>
          </div>
          <Checkbox
            id="card"
            checked={paymentMethods.card}
            onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, card: checked as boolean })}
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  )
}
