"use client"

import type React from "react"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Plus, 
  X, 
  Settings, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  Save,
  ArrowLeft,
  Info,
  DollarSign,
  Sliders,
  Camera,
  Tag
} from "lucide-react"

interface ProductFormProps {
  product?: any
  categories: any[]
  addOns?: any[]
  mode?: 'create' | 'edit'
}

interface ProductSize {
  id?: string
  name_ar: string
  name_en: string
  price: number
  display_order: number
  is_active: boolean
}

interface ProductImage {
  id?: string
  image_url: string
  alt_text: string
  is_main: boolean
  display_order: number
}

interface ProductOption {
  id?: string
  name_ar: string
  name_en: string
  type: 'single_choice' | 'multi_choice' | 'free_text'
  is_required: boolean
  display_order: number
  is_active: boolean
  values: ProductOptionValue[]
}

interface ProductOptionValue {
  id?: string
  value_ar: string
  value_en: string
  extra_price: number
  display_order: number
  is_active: boolean
}

interface ProductAddOn {
  add_on_id: string
  is_active: boolean
  display_order: number
}

export default function ProductForm({ product, categories, addOns = [], mode = 'create' }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Basic Info State
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

  // Images State
  const [images, setImages] = useState<ProductImage[]>(
    product?.product_images?.map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: img.alt_text || '',
      is_main: img.is_main,
      display_order: img.display_order
    })) || []
  )

  // Sizes State
  const [sizes, setSizes] = useState<ProductSize[]>(
    product?.product_sizes?.map((size: any) => ({
      id: size.id,
      name_ar: size.name_ar,
      name_en: size.name_en || '',
      price: size.price,
      display_order: size.display_order,
      is_active: size.is_active
    })) || []
  )

  // Add-ons State
  const [selectedAddOns, setSelectedAddOns] = useState<ProductAddOn[]>(
    product?.product_add_ons?.map((pa: any) => ({
      add_on_id: pa.add_on_id,
      is_active: pa.is_active,
      display_order: pa.display_order
    })) || []
  )

  // Options State
  const [options, setOptions] = useState<ProductOption[]>(
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

  // Allergens and Tags options
  const allergenOptions = [
    'المكسرات', 'الألبان', 'الجلوتين', 'البيض', 'الصويا', 'السمسم', 'الأسماك', 'المحار'
  ]

  const tagOptions = [
    'نباتي', 'خالي من الجلوتين', 'بدون سكر مضاف', 'منتج مميز', 'جديد', 'الأكثر مبيعاً', 'حار', 'بارد'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a: string) => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  // Image Management
  const addImage = () => {
    const newImage: ProductImage = {
      image_url: '',
      alt_text: '',
      is_main: images.length === 0,
      display_order: images.length
    }
    setImages([...images, newImage])
  }

  const updateImage = (index: number, field: keyof ProductImage, value: any) => {
    const updatedImages = [...images]
    updatedImages[index] = { ...updatedImages[index], [field]: value }
    
    // If setting as main image, unset others
    if (field === 'is_main' && value) {
      updatedImages.forEach((img, i) => {
        if (i !== index) img.is_main = false
      })
    }
    
    setImages(updatedImages)
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    // If removed image was main and there are other images, make first one main
    if (images[index].is_main && updatedImages.length > 0) {
      updatedImages[0].is_main = true
    }
    setImages(updatedImages)
  }

  // Size Management
  const addSize = () => {
    const newSize: ProductSize = {
      name_ar: '',
      name_en: '',
      price: 0,
      display_order: sizes.length,
      is_active: true
    }
    setSizes([...sizes, newSize])
  }

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const updatedSizes = [...sizes]
    updatedSizes[index] = { ...updatedSizes[index], [field]: value }
    setSizes(updatedSizes)
  }

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index))
  }

  // Add-on Management
  const toggleAddOn = (addOnId: string) => {
    const existing = selectedAddOns.find(sa => sa.add_on_id === addOnId)
    if (existing) {
      setSelectedAddOns(selectedAddOns.filter(sa => sa.add_on_id !== addOnId))
    } else {
      setSelectedAddOns([...selectedAddOns, {
        add_on_id: addOnId,
        is_active: true,
        display_order: selectedAddOns.length
      }])
    }
  }

  // Option Management
  const addOption = () => {
    const newOption: ProductOption = {
      name_ar: '',
      name_en: '',
      type: 'single_choice',
      is_required: false,
      display_order: options.length,
      is_active: true,
      values: []
    }
    setOptions([...options, newOption])
  }

  const updateOption = (index: number, field: keyof ProductOption, value: any) => {
    const updatedOptions = [...options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setOptions(updatedOptions)
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const addOptionValue = (optionIndex: number) => {
    const newValue: ProductOptionValue = {
      value_ar: '',
      value_en: '',
      extra_price: 0,
      display_order: options[optionIndex].values.length,
      is_active: true
    }
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values.push(newValue)
    setOptions(updatedOptions)
  }

  const updateOptionValue = (optionIndex: number, valueIndex: number, field: keyof ProductOptionValue, value: any) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values[valueIndex] = {
      ...updatedOptions[optionIndex].values[valueIndex],
      [field]: value
    }
    setOptions(updatedOptions)
  }

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex)
    setOptions(updatedOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        ...formData,
        calories: formData.calories ? parseInt(formData.calories) : null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
        priority_order: parseInt(formData.priority_order.toString()),
        sizes: sizes.filter(size => size.name_ar.trim()),
        images: images.filter(img => img.image_url.trim()),
        add_ons: selectedAddOns,
        options: options.filter(opt => opt.name_ar.trim())
      }

      const url = mode === 'edit' ? `/api/products/${product.id}` : '/api/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
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
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            المعلومات الأساسية
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            الأسعار والأحجام
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            الصور
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            الخيارات والإضافات
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            التفاصيل الإضافية
          </TabsTrigger>
        </TabsList>
  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || "",
    name_en: product?.name_en || "",
    description_ar: product?.description_ar || "",
    description_en: product?.description_en || "",
    price: product?.price || "",
    category_id: product?.category_id || "",
    image_url: product?.image_url || "",
    is_available: product?.is_available ?? true,
    display_order: product?.display_order || 0,
  })

  // Load customization groups
  useEffect(() => {
    const loadCustomizationGroups = async () => {
      setLoadingCustomizations(true)
      try {
        const response = await fetch('/api/admin/customization-groups?include_options=true')
        if (response.ok) {
          const groups = await response.json()
          setCustomizationGroups(groups)
        }
      } catch (error) {
        console.error('Error loading customization groups:', error)
        toast({
          title: "خطأ",
          description: "فشل في تحميل مجموعات التخصيص",
          variant: "destructive",
        })
      } finally {
        setLoadingCustomizations(false)
      }
    }

    loadCustomizationGroups()
  }, [toast])

  // Load existing product customizations
  useEffect(() => {
    if (product?.id) {
      const loadProductCustomizations = async () => {
        try {
          const response = await fetch(`/api/admin/product-customizations?product_id=${product.id}`)
          if (response.ok) {
            const associations = await response.json()
            setSelectedCustomizationGroups(associations.map((assoc: any) => assoc.group_id))
          }
        } catch (error) {
          console.error('Error loading product customizations:', error)
        }
      }

      loadProductCustomizations()
    }
  }, [product?.id])

  const handleCustomizationGroupToggle = (groupId: string) => {
    setSelectedCustomizationGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const saveProductCustomizations = async (productId: string) => {
    // First, remove all existing associations
    try {
      const existingResponse = await fetch(`/api/admin/product-customizations?product_id=${productId}`)
      if (existingResponse.ok) {
        const existingAssociations = await existingResponse.json()
        
        for (const association of existingAssociations) {
          await fetch('/api/admin/product-customizations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              group_id: association.group_id
            })
          })
        }
      }

      // Add new associations
      for (const groupId of selectedCustomizationGroups) {
        await fetch('/api/admin/product-customizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            group_id: groupId
          })
        })
      }
    } catch (error) {
      console.error('Error saving product customizations:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        ...formData,
        price: Number.parseFloat(formData.price as string),
        display_order: Number.parseInt(formData.display_order as string),
      }

      let result
      let productId
      
      if (product) {
        result = await supabase.from("products").update(data).eq("id", product.id)
        productId = product.id
      } else {
        result = await supabase.from("products").insert([data]).select().single()
        productId = result.data?.id
      }

      if (result.error) {
        throw result.error
      }

      // Save customization associations
      if (productId) {
        await saveProductCustomizations(productId)
      }

      toast({
        title: "نجح",
        description: product ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح",
      })

      router.push("/admin/dashboard/products")
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ المنتج",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category_id">الفئة *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
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
          <Label htmlFor="price">السعر (ر.س) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="text-right"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_ar">الوصف بالعربية</Label>
        <Textarea
          id="description_ar"
          rows={3}
          value={formData.description_ar}
          onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_en">الوصف بالإنجليزية</Label>
        <Textarea
          id="description_en"
          rows={3}
          value={formData.description_en}
          onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">رابط الصورة</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="display_order">ترتيب العرض</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
            className="text-right"
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label htmlFor="is_available">متاح للطلب</Label>
          <Switch
            id="is_available"
            checked={formData.is_available}
            onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
          />
        </div>
      </div>

      {/* Customization Options Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            خيارات التخصيص
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCustomizations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري تحميل خيارات التخصيص...</span>
            </div>
          ) : customizationGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مجموعات تخصيص متاحة</p>
              <p className="text-sm">يمكنك إنشاء مجموعات تخصيص من لوحة الإدارة</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                اختر مجموعات التخصيص التي تريد إتاحتها لهذا المنتج
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customizationGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCustomizationGroups.includes(group.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleCustomizationGroupToggle(group.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={selectedCustomizationGroups.includes(group.id)}
                            onChange={() => handleCustomizationGroupToggle(group.id)}
                          />
                          <h4 className="font-medium">{group.name_ar}</h4>
                          {group.name_en && (
                            <span className="text-sm text-muted-foreground">({group.name_en})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={group.type === 'single' ? 'default' : 'secondary'}>
                            {group.type === 'single' ? 'اختيار واحد' : 'اختيار متعدد'}
                          </Badge>
                          {group.is_required && (
                            <Badge variant="destructive">مطلوب</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {group.customization_options?.length || 0} خيار متاح
                        </div>
                      </div>
                    </div>
                    
                    {selectedCustomizationGroups.includes(group.id) && group.customization_options?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">الخيارات المتاحة:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.customization_options.slice(0, 3).map((option) => (
                            <Badge key={option.id} variant="outline" className="text-xs">
                              {option.name_ar}
                              {option.price_modifier !== 0 && (
                                <span className="mr-1">
                                  ({option.price_modifier > 0 ? '+' : ''}{option.price_modifier} ر.س)
                                </span>
                              )}
                            </Badge>
                          ))}
                          {group.customization_options.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.customization_options.length - 3} المزيد
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedCustomizationGroups.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">مجموعات التخصيص المحددة:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomizationGroups.map((groupId) => {
                      const group = customizationGroups.find(g => g.id === groupId)
                      return group ? (
                        <Badge key={groupId} variant="default" className="flex items-center gap-1">
                          {group.name_ar}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCustomizationGroupToggle(groupId)
                            }}
                          />
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : product ? "تحديث المنتج" : "إضافة المنتج"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
