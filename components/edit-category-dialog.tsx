"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface EditCategoryDialogProps {
  category: {
    id: string
    name_ar: string
    name_en?: string
    display_order: number
    is_active: boolean
  }
  onClose: () => void
}

export default function EditCategoryDialog({ category, onClose }: EditCategoryDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name_ar: category.name_ar,
    name_en: category.name_en || "",
    display_order: category.display_order,
    is_active: category.is_active,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.from("categories").update(formData).eq("id", category.id)

    if (!error) {
      onClose()
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الفئة</DialogTitle>
          <DialogDescription>تحديث معلومات الفئة</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_ar">الاسم بالعربية *</Label>
            <Input
              id="name_ar"
              required
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">ترتيب العرض</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
              className="text-right"
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="is_active">نشط</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
