"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ProductPreviewProps {
  product: any
}

export default function ProductPreview({ product }: ProductPreviewProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({})
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [customerNotes, setCustomerNotes] = useState("")
  const [quantity, setQuantity] = useState(1)

  // Get main image
  const getMainImage = () => {
    if (product.product_images && product.product_images.length > 0) {
      const mainImage = product.product_images.find((img: any) => img.is_main) || product.product_images[0]
      return mainImage.image_url
    }
    return product.image_url || "/placeholder.svg"
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    let basePrice = 0

    if (product.is_market_price) {
      return "سعر السوق"
    }

    // Get base price from selected size or product base price
    if (selectedSize && product.product_sizes) {
      const size = product.product_sizes.find((s: any) => s.id === selectedSize)
      basePrice = size ? size.price : (product.base_price || product.price || 0)
    } else {
      basePrice = product.base_price || product.price || 0
    }

    // Add option prices
    Object.values(selectedOptions).forEach((optionValue: any) => {
      if (Array.isArray(optionValue)) {
        optionValue.forEach((value: any) => {
          basePrice += value.extra_price || 0
        })
      } else if (optionValue && optionValue.extra_price) {
        basePrice += optionValue.extra_price
      }
    })

    // Add add-on prices
    selectedAddOns.forEach(addOnId => {
      const productAddOn = product.product_add_ons?.find((pa: any) => pa.add_on_id === addOnId)
      if (productAddOn && productAddOn.add_ons) {
        basePrice += productAddOn.add_ons.price || 0
      }
    })

    return `${(basePrice * quantity).toFixed(2)} ر.س`
  }

  // Handle option selection
  const handleOptionChange = (optionId: string, option: any, value: any) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev }
      
      if (option.type === 'multi_choice') {
        if (!newOptions[optionId]) {
          newOptions[optionId] = []
        }
        const currentValues = newOptions[optionId] as any[]
        const existingIndex = currentValues.findIndex(v => v.id === value.id)
        
        if (existingIndex >= 0) {
          currentValues.splice(existingIndex, 1)
        } else {
          currentValues.push(value)
        }
      } else {
        newOptions[optionId] = value
      }
      
      return newOptions
    })
  }

  // Check if all required options are selected
  const areRequiredOptionsSelected = () => {
    if (!product.product_options) return true
    
    return product.product_options
      .filter((option: any) => option.is_required && option.is_active)
      .every((option: any) => {
        const selected = selectedOptions[option.id]
        if (option.type === 'multi_choice') {
          return selected && selected.length > 0
        }
        return selected !== undefined && selected !== null
      })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>
        <div>
          <h1 className="text-2xl font-bold">معاينة المنتج</h1>
          <p className="text-muted-foreground">كيف سيظهر المنتج للعملاء</p>
        </div>
      </div>

      {/* Product Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={getMainImage()}
                  alt={product.name_ar}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Gallery Images */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.product_images.map((image: any, index: number) => (
                <div key={image.id} className="aspect-square relative rounded overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`${product.name_ar} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{product.name_ar}</h1>
              {product.is_seasonal && (
                <Badge variant="outline">موسمي</Badge>
              )}
            </div>
            {product.name_en && (
              <p className="text-lg text-muted-foreground">{product.name_en}</p>
            )}
            
            {/* Category */}
            {product.categories && (
              <div className="flex items-center gap-2 mt-2">
                {product.categories.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: product.categories.color }}
                  />
                )}
                <Badge variant="secondary">{product.categories.name_ar}</Badge>
              </div>
            )}
          </div>

          {/* Description */}
          {product.short_description_ar && (
            <p className="text-muted-foreground">{product.short_description_ar}</p>
          )}

          {/* Price */}
          <div className="text-2xl font-bold text-primary">
            {calculateTotalPrice()}
          </div>

          {/* Sizes */}
          {product.product_sizes && product.product_sizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">الحجم</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="grid grid-cols-1 gap-2">
                  {product.product_sizes
                    .filter((size: any) => size.is_active)
                    .map((size: any) => (
                      <div key={size.id} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={size.id} id={size.id} />
                        <Label htmlFor={size.id} className="flex-1 flex justify-between">
                          <span>{size.name_ar}</span>
                          <span>{size.price.toFixed(2)} ر.س</span>
                        </Label>
                      </div>
                    ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Product Options */}
          {product.product_options && product.product_options.length > 0 && (
            <div className="space-y-4">
              {product.product_options
                .filter((option: any) => option.is_active)
                .map((option: any) => (
                  <div key={option.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {option.name_ar}
                      {option.is_required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    
                    {option.type === 'single_choice' && (
                      <RadioGroup 
                        value={selectedOptions[option.id]?.id || ""} 
                        onValueChange={(valueId) => {
                          const value = option.product_option_values.find((v: any) => v.id === valueId)
                          handleOptionChange(option.id, option, value)
                        }}
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {option.product_option_values
                            .filter((value: any) => value.is_active)
                            .map((value: any) => (
                              <div key={value.id} className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value={value.id} id={value.id} />
                                <Label htmlFor={value.id} className="flex-1 flex justify-between">
                                  <span>{value.value_ar}</span>
                                  {value.extra_price > 0 && (
                                    <span>+{value.extra_price.toFixed(2)} ر.س</span>
                                  )}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </RadioGroup>
                    )}

                    {option.type === 'multi_choice' && (
                      <div className="grid grid-cols-1 gap-2">
                        {option.product_option_values
                          .filter((value: any) => value.is_active)
                          .map((value: any) => (
                            <div key={value.id} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={value.id}
                                checked={selectedOptions[option.id]?.some((v: any) => v.id === value.id) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleOptionChange(option.id, option, value)
                                  } else {
                                    handleOptionChange(option.id, option, value)
                                  }
                                }}
                              />
                              <Label htmlFor={value.id} className="flex-1 flex justify-between">
                                <span>{value.value_ar}</span>
                                {value.extra_price > 0 && (
                                  <span>+{value.extra_price.toFixed(2)} ر.س</span>
                                )}
                              </Label>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Add-ons */}
          {product.product_add_ons && product.product_add_ons.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">الإضافات</Label>
              <div className="grid grid-cols-1 gap-2">
                {product.product_add_ons
                  .filter((pa: any) => pa.is_active && pa.add_ons)
                  .map((pa: any) => (
                    <div key={pa.add_on_id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={pa.add_on_id}
                        checked={selectedAddOns.includes(pa.add_on_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddOns([...selectedAddOns, pa.add_on_id])
                          } else {
                            setSelectedAddOns(selectedAddOns.filter(id => id !== pa.add_on_id))
                          }
                        }}
                      />
                      <Label htmlFor={pa.add_on_id} className="flex-1 flex justify-between">
                        <span>{pa.add_ons.name_ar}</span>
                        <span>+{pa.add_ons.price.toFixed(2)} ر.س</span>
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Customer Notes */}
          {product.allow_customer_notes && (
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات خاصة</Label>
              <Textarea
                id="notes"
                placeholder="أي طلبات خاصة أو ملاحظات..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label>الكمية</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            {!areRequiredOptionsSelected() && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>يرجى اختيار جميع الخيارات المطلوبة</span>
              </div>
            )}
            
            <Button 
              size="lg" 
              className="w-full"
              disabled={!areRequiredOptionsSelected() || product.status !== 'available'}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              {product.status === 'available' ? 'إضافة للسلة' : 'غير متاح'}
            </Button>
          </div>

          {/* Product Info */}
          <Separator />
          
          <div className="space-y-4">
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">العلامات</Label>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">مسببات الحساسية</Label>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen: string, index: number) => (
                    <Badge key={index} variant="destructive">{allergen}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Calories */}
            {product.calories && (
              <div className="text-sm text-muted-foreground">
                السعرات الحرارية: {product.calories}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}