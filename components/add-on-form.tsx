"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, ArrowLeft } from "lucide-react"

interface AddOnFormProps {
  addOn?: any
  mode?: 'create' | 'edit'
}

export default function AddOnForm({ addOn, mode = 'create' }: AddOnFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name_ar: addOn?.name_ar || '',
    name_en: addOn?.name_en || '',
    description_ar: addOn?.description_ar || '',
    description_en: addOn?.description_en || '',
    price: addOn?.price || '',
    is_active: addOn?.is_active !== false,
    display_order: addOn?.display_order || 0
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const addOnData = {
        ...formData,
        price: parseFloat(formData.price.toString()) || 0,
        display_order: parseInt(formData.display_order.toString()) || 0
      }

      const url = mode === 'edit' ? `/api/add-ons/${addOn.id}` : '/api/add-ons'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addOnData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: mode === 'edit' ? "تم تحديث الإضافة" : "تم إنشاء الإضافة",
          description: mode === 'edit' ? "تم تحديث الإضافة بنجاح" : "تم إنشاء الإضافة بنجاح",
        })
        router.push('/admin/dashboard/add-ons')
      } else {
        throw new Error(result.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving add-on:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإضافة",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'edit' ? 'تعديل الإضافة' : 'إضافة إضافة جديدة'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'edit' ? 'تعديل تفاصيل الإضافة' : 'إضافة إضافة جديدة للمنتجات'}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          {mode === 'edit' ? 'حفظ التغييرات' : 'إنشاء الإضافة'}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الإضافة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">اسم الإضافة (عربي) *</Label>
              <Input
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) => handleInputChange('name_ar', e.target.value)}
                placeholder="مثال: شوت إسبريسو إضافي"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">اسم الإضافة (إنجليزي)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                placeholder="Extra Espresso Shot"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ar">وصف الإضافة (عربي)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => handleInputChange('description_ar', e.target.value)}
              placeholder="وصف تفصيلي للإضافة"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_en">وصف الإضافة (إنجليزي)</Label>
            <Textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => handleInputChange('description_en', e.target.value)}
              placeholder="Detailed description of the add-on"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (ر.س) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="3.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">ترتيب العرض</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">نشط</Label>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}