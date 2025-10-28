"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ImageUpload from "@/components/image-upload"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, Plus, X, Upload, Image as ImageIcon, Trash2, Eye, Save, ArrowLeft,
  Info, DollarSign, Sliders, Camera, Tag, Star, AlertCircle
} from "lucide-react"

interface EnhancedProductFormProps {
  product?: any
  categories: any[]
  addOns?: any[]
  mode?: 'create' | 'edit'
}

export default function EnhancedProductForm({ 
  product, 
  categories, 
  addOns = [], 
  mode = 'create' 
}: EnhancedProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Form state
  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    category_id: product?.category_id || '',
    short_description_ar: product?.short_description_ar || '',
    short_description_en: product?.short_description_en || '',
    full_description_ar: product?.full_description_ar || '',
    full_description_en: product?.full_description_en || '',
    sku: product?.sku || '',
    status: product?.status || 'available',
    priority_order: product?.priority_order || 0,
    is_seasonal: product?.is_seasonal || false,
    allow_customer_notes: product?.allow_customer_notes !== false,
    calories: product?.calories || '',
    allergens: product?.allergens || [],
    tags: product?.tags || [],
    base_price: product?.base_price || '',
    is_market_price: product?.is_market_price || false
  })

  const [images, setImages] = useState(
    product?.product_images?.map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: img.alt_text || '',
      is_main: img.is_main,
      display_order: img.display_order
    })) || []
  )

  const [sizes, setSizes] = useState(
    product?.product_sizes?.map((size: any) => ({
      id: size.id,
      name_ar: size.name_ar,
      name_en: size.name_en || '',
      price: size.price,
      display_order: size.display_order,
      is_active: size.is_active
    })) || []
  )

  const [selectedAddOns, setSelectedAddOns] = useState(
    product?.product_add_ons?.map((pa: any) => ({
      add_on_id: pa.add_on_id,
      is_active: pa.is_active,
      display_order: pa.display_order
    })) || []
  )

  const [options, setOptions] = useState(
    product?.product_options?.map((opt: any) => ({
      id: opt.id,
      name_ar: opt.name_ar,
      name_en: opt.name_en || '',
      type: opt.type,
      is_required: opt.is_required,
      display_order: opt.display_order,
      is_active: opt.is_active,
      values: opt.product_option_values?.map((val: any) => ({
        id: val.id,
        value_ar: val.value_ar,
        value_en: val.value_en || '',
        extra_price: val.extra_price,
        display_order: val.display_order,
        is_active: val.is_active
      })) || []
    })) || []
  )

  const allergenOptions = [
    'المكسرات', 'الألبان', 'الجلوتين', 'البيض', 'الصويا', 'السمسم', 'الأسماك', 'المحار'
  ]

  const tagOptions = [
    'نباتي', 'خالي من الجلوتين', 'بدون سكر مضاف', 'منتج مميز', 'جديد', 'الأكثر مبيعاً', 'حار', 'بارد'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        ...formData,
        // Ensure SKU does not violate unique constraint by sending null when empty
        sku: (formData.sku ?? '').trim() || null,
        calories: formData.calories ? parseInt(formData.calories) : null,
        base_price: formData.is_market_price ? 0 : (formData.base_price ? parseFloat(formData.base_price) : 0),
        price: formData.is_market_price ? 0 : (formData.base_price ? parseFloat(formData.base_price) : 0), // Add price field for backward compatibility
        priority_order: parseInt(formData.priority_order.toString()),
        sizes: sizes.filter(size => size.name_ar.trim()),
        images: images.filter(img => img.image_url.trim()),
        add_ons: selectedAddOns,
        options: options.filter(opt => opt.name_ar.trim())
      }

      console.log('Product data being sent:', productData) // Debug log

      const url = mode === 'edit' ? `/api/products/${product.id}` : '/api/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: mode === 'edit' ? "تم تحديث المنتج" : "تم إنشاء المنتج",
          description: mode === 'edit' ? "تم تحديث المنتج بنجاح" : "تم إنشاء المنتج بنجاح",
        })
        router.push('/admin/dashboard/products')
      } else {
        throw new Error(result.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المنتج",
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
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'edit' ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'edit' ? 'تعديل تفاصيل المنتج' : 'إضافة منتج جديد إلى القائمة'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline">
            <Eye className="w-4 h-4 ml-2" />
            معاينة
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            {mode === 'edit' ? 'حفظ التغييرات' : 'إنشاء المنتج'}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            <Info className="w-4 h-4 ml-2" />
            المعلومات الأساسية
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 ml-2" />
            الأسعار والأحجام
          </TabsTrigger>
          <TabsTrigger value="images">
            <Camera className="w-4 h-4 ml-2" />
            الصور
          </TabsTrigger>
          <TabsTrigger value="options">
            <Sliders className="w-4 h-4 ml-2" />
            الخيارات والإضافات
          </TabsTrigger>
          <TabsTrigger value="details">
            <Tag className="w-4 h-4 ml-2" />
            التفاصيل الإضافية
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">اسم المنتج (عربي) *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="مثال: قهوة عربية"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">اسم المنتج (إنجليزي)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Arabic Coffee"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">الفئة *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">كود المنتج (SKU)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="COFFEE-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description_ar">وصف مختصر (عربي)</Label>
                <Textarea
                  id="short_description_ar"
                  value={formData.short_description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description_ar: e.target.value }))}
                  placeholder="وصف مختصر للمنتج يظهر في القائمة"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description_en">وصف مختصر (إنجليزي)</Label>
                <Textarea
                  id="short_description_en"
                  value={formData.short_description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description_en: e.target.value }))}
                  placeholder="Short description for menu listing"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_description_ar">وصف كامل (عربي)</Label>
                <Textarea
                  id="full_description_ar"
                  value={formData.full_description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_description_ar: e.target.value }))}
                  placeholder="وصف تفصيلي للمنتج"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_description_en">وصف كامل (إنجليزي)</Label>
                <Textarea
                  id="full_description_en"
                  value={formData.full_description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_description_en: e.target.value }))}
                  placeholder="Detailed product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">حالة المنتج</Label>
                  <Select value={formData.status} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">متاح</SelectItem>
                      <SelectItem value="sold_out">نفد المخزون</SelectItem>
                      <SelectItem value="hidden">مخفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority_order">ترتيب الأولوية</Label>
                  <Input
                    id="priority_order"
                    type="number"
                    value={formData.priority_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">السعرات الحرارية</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_seasonal"
                    checked={formData.is_seasonal}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_seasonal: checked }))}
                  />
                  <Label htmlFor="is_seasonal">منتج موسمي</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="allow_customer_notes"
                    checked={formData.allow_customer_notes}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_customer_notes: checked }))}
                  />
                  <Label htmlFor="allow_customer_notes">السماح بملاحظات العميل</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التسعير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_market_price"
                  checked={formData.is_market_price}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_market_price: checked }))}
                />
                <Label htmlFor="is_market_price">سعر السوق / اسأل الموظف</Label>
              </div>

              {!formData.is_market_price && (
                <div className="space-y-2">
                  <Label htmlFor="base_price">السعر الأساسي</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                    placeholder="15.00"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                الأحجام والأسعار
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setSizes([...sizes, {
                    name_ar: '',
                    name_en: '',
                    price: 0,
                    display_order: sizes.length,
                    is_active: true
                  }])
                }}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة حجم
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sizes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  لا توجد أحجام مضافة. اضغط "إضافة حجم" لإضافة أحجام مختلفة للمنتج.
                </p>
              ) : (
                <div className="space-y-4">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          placeholder="الحجم (عربي)"
                          value={size.name_ar}
                          onChange={(e) => {
                            const updatedSizes = [...sizes]
                            updatedSizes[index].name_ar = e.target.value
                            setSizes(updatedSizes)
                          }}
                        />
                        <Input
                          placeholder="Size (English)"
                          value={size.name_en}
                          onChange={(e) => {
                            const updatedSizes = [...sizes]
                            updatedSizes[index].name_en = e.target.value
                            setSizes(updatedSizes)
                          }}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="السعر"
                          value={size.price}
                          onChange={(e) => {
                            const updatedSizes = [...sizes]
                            updatedSizes[index].price = parseFloat(e.target.value) || 0
                            setSizes(updatedSizes)
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={size.is_active}
                            onCheckedChange={(checked) => {
                              const updatedSizes = [...sizes]
                              updatedSizes[index].is_active = checked
                              setSizes(updatedSizes)
                            }}
                          />
                          <Label>نشط</Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>صور المنتج</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageUploaded={(imageUrl) => {
                  setImages([...images, {
                    image_url: imageUrl,
                    alt_text: '',
                    is_main: images.length === 0,
                    display_order: images.length
                  }])
                }}
                onImageRemoved={(imageUrl) => {
                  const updatedImages = images.filter(img => img.image_url !== imageUrl)
                  // If removed image was main and there are other images, make first one main
                  if (images.find(img => img.image_url === imageUrl)?.is_main && updatedImages.length > 0) {
                    updatedImages[0].is_main = true
                  }
                  setImages(updatedImages)
                }}
                existingImages={images.map(img => img.image_url)}
                maxImages={5}
              />
              
              {/* Image Management */}
              {images.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">إدارة الصور</h4>
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 relative rounded overflow-hidden bg-muted">
                        {image.image_url && (
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `صورة ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="النص البديل للصورة"
                          value={image.alt_text}
                          onChange={(e) => {
                            const updatedImages = [...images]
                            updatedImages[index].alt_text = e.target.value
                            setImages(updatedImages)
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={image.is_main}
                            onCheckedChange={(checked) => {
                              const updatedImages = [...images]
                              if (checked) {
                                // Unset other main images
                                updatedImages.forEach((img, i) => {
                                  img.is_main = i === index
                                })
                              } else {
                                updatedImages[index].is_main = false
                              }
                              setImages(updatedImages)
                            }}
                          />
                          <Label>الصورة الرئيسية</Label>
                          {image.is_main && <Star className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedImages = images.filter((_, i) => i !== index)
                          // If removed image was main and there are other images, make first one main
                          if (image.is_main && updatedImages.length > 0) {
                            updatedImages[0].is_main = true
                          }
                          setImages(updatedImages)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Options and Add-ons Tab */}
        <TabsContent value="options" className="space-y-6">
          {/* Add-ons Section */}
          <Card>
            <CardHeader>
              <CardTitle>الإضافات المتاحة</CardTitle>
            </CardHeader>
            <CardContent>
              {addOns.length === 0 ? (
                <p className="text-muted-foreground">لا توجد إضافات متاحة</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addOns.map((addOn) => (
                    <div key={addOn.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`addon-${addOn.id}`}
                        checked={selectedAddOns.some(sa => sa.add_on_id === addOn.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddOns([...selectedAddOns, {
                              add_on_id: addOn.id,
                              is_active: true,
                              display_order: selectedAddOns.length
                            }])
                          } else {
                            setSelectedAddOns(selectedAddOns.filter(sa => sa.add_on_id !== addOn.id))
                          }
                        }}
                      />
                      <Label htmlFor={`addon-${addOn.id}`} className="flex-1">
                        <div>{addOn.name_ar}</div>
                        <div className="text-sm text-muted-foreground">
                          {addOn.price > 0 ? `+${addOn.price.toFixed(2)} ر.س` : 'مجاني'}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Options Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                خيارات التخصيص
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setOptions([...options, {
                    name_ar: '',
                    name_en: '',
                    type: 'single_choice',
                    is_required: false,
                    display_order: options.length,
                    is_active: true,
                    values: []
                  }])
                }}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة خيار
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {options.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  لا توجد خيارات مضافة. اضغط "إضافة خيار" لإضافة خيارات تخصيص للمنتج.
                </p>
              ) : (
                <div className="space-y-6">
                  {options.map((option, optionIndex) => (
                    <div key={optionIndex} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">خيار {optionIndex + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setOptions(options.filter((_, i) => i !== optionIndex))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="اسم الخيار (عربي)"
                          value={option.name_ar}
                          onChange={(e) => {
                            const updatedOptions = [...options]
                            updatedOptions[optionIndex].name_ar = e.target.value
                            setOptions(updatedOptions)
                          }}
                        />
                        <Input
                          placeholder="Option Name (English)"
                          value={option.name_en}
                          onChange={(e) => {
                            const updatedOptions = [...options]
                            updatedOptions[optionIndex].name_en = e.target.value
                            setOptions(updatedOptions)
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                          value={option.type} 
                          onValueChange={(value) => {
                            const updatedOptions = [...options]
                            updatedOptions[optionIndex].type = value as any
                            setOptions(updatedOptions)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_choice">اختيار واحد</SelectItem>
                            <SelectItem value="multi_choice">اختيار متعدد</SelectItem>
                            <SelectItem value="free_text">نص حر</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                              checked={option.is_required}
                              onCheckedChange={(checked) => {
                                const updatedOptions = [...options]
                                updatedOptions[optionIndex].is_required = checked
                                setOptions(updatedOptions)
                              }}
                            />
                            <Label>مطلوب</Label>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                              checked={option.is_active}
                              onCheckedChange={(checked) => {
                                const updatedOptions = [...options]
                                updatedOptions[optionIndex].is_active = checked
                                setOptions(updatedOptions)
                              }}
                            />
                            <Label>نشط</Label>
                          </div>
                        </div>
                      </div>

                      {option.type !== 'free_text' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>القيم المتاحة</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedOptions = [...options]
                                updatedOptions[optionIndex].values.push({
                                  value_ar: '',
                                  value_en: '',
                                  extra_price: 0,
                                  display_order: option.values.length,
                                  is_active: true
                                })
                                setOptions(updatedOptions)
                              }}
                            >
                              <Plus className="w-4 h-4 ml-2" />
                              إضافة قيمة
                            </Button>
                          </div>
                          
                          {option.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Input
                                placeholder="القيمة (عربي)"
                                value={value.value_ar}
                                onChange={(e) => {
                                  const updatedOptions = [...options]
                                  updatedOptions[optionIndex].values[valueIndex].value_ar = e.target.value
                                  setOptions(updatedOptions)
                                }}
                              />
                              <Input
                                placeholder="Value (English)"
                                value={value.value_en}
                                onChange={(e) => {
                                  const updatedOptions = [...options]
                                  updatedOptions[optionIndex].values[valueIndex].value_en = e.target.value
                                  setOptions(updatedOptions)
                                }}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="سعر إضافي"
                                value={value.extra_price}
                                onChange={(e) => {
                                  const updatedOptions = [...options]
                                  updatedOptions[optionIndex].values[valueIndex].extra_price = parseFloat(e.target.value) || 0
                                  setOptions(updatedOptions)
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedOptions = [...options]
                                  updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex)
                                  setOptions(updatedOptions)
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مسببات الحساسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allergenOptions.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`allergen-${allergen}`}
                      checked={formData.allergens.includes(allergen)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          allergens: prev.allergens.includes(allergen)
                            ? prev.allergens.filter(a => a !== allergen)
                            : [...prev.allergens, allergen]
                        }))
                      }}
                    />
                    <Label htmlFor={`allergen-${allergen}`}>{allergen}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>العلامات والتصنيفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tagOptions.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag)
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }))
                      }}
                    />
                    <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}