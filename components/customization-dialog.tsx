"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Plus, Minus, ShoppingCart, Coffee, Snowflake, StickyNote, Loader2, Settings } from "lucide-react"

interface CustomizationGroup {
  id: string
  name_ar: string
  name_en: string
  type: 'single' | 'multiple'
  is_required: boolean
  display_order: number
  customization_options: CustomizationOption[]
}

interface CustomizationOption {
  id: string
  name_ar: string
  name_en: string
  price_modifier: number
  display_order: number
}

type CustomizationDialogItem = {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  // Extended fields for detailed product info
  fullDescription?: string
  calories?: number | string | null
  sizes?: { name: string; price: number }[]
  addOns?: { name: string; price: number }[]
  allergens?: string[]
  tags?: string[]
  category?: string
}

type CustomizationDialogProps = {
  item: CustomizationDialogItem | null
  onClose: () => void
  onConfirm: (customization: any) => void
}

export function CustomizationDialog({ item, onClose, onConfirm }: CustomizationDialogProps) {
  const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({})
  const [notes, setNotes] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null)

  // Load customization options when item changes
  useEffect(() => {
    if (item?.id) {
      // Initialize size selection if sizes exist
      if (item?.sizes && item.sizes.length > 0) {
        // Prefer the size whose price matches the product's base price
        const basePrice = Number(item?.price ?? 0)
        const defaultIndex = item.sizes.findIndex((sz) => Number(sz.price) === basePrice)
        setSelectedSizeIndex(defaultIndex >= 0 ? defaultIndex : null)
      } else {
        setSelectedSizeIndex(null)
      }
      loadCustomizationOptions()
    } else {
      // Reset state when dialog closes
      setCustomizationGroups([])
      setSelectedOptions({})
      setNotes("")
      setQuantity(1)
      setError(null)
      setSelectedSizeIndex(null)
    }
  }, [item?.id])

  const loadCustomizationOptions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/${item?.id}/customizations`)
      if (response.ok) {
        const groups = await response.json()
        setCustomizationGroups(groups)
        
        // Initialize selected options with default values
        const initialOptions: Record<string, string | string[]> = {}
        groups.forEach((group: CustomizationGroup) => {
          if (group.customization_options.length > 0) {
            if (group.type === 'single') {
              // Select first option as default for single-select groups
              initialOptions[group.id] = group.customization_options[0].id
            } else {
              // Initialize empty array for multi-select groups
              initialOptions[group.id] = []
            }
          }
        })
        setSelectedOptions(initialOptions)
      } else {
        // Gracefully handle missing customizations: no error, just no groups
        setCustomizationGroups([])
        setSelectedOptions({})
        // Optionally show a gentle message in UI without throwing
        setError('لا توجد خيارات تخصيص لهذا المنتج')
      }
    } catch (error) {
      console.error('Error loading customization options:', error)
      setError('فشل في تحميل خيارات التخصيص')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (groupId: string, optionId: string, groupType: 'single' | 'multiple') => {
    setSelectedOptions(prev => {
      if (groupType === 'single') {
        return { ...prev, [groupId]: optionId }
      } else {
        const currentOptions = (prev[groupId] as string[]) || []
        const isSelected = currentOptions.includes(optionId)
        return {
          ...prev,
          [groupId]: isSelected
            ? currentOptions.filter(id => id !== optionId)
            : [...currentOptions, optionId]
        }
      }
    })
  }

  const calculateTotalPrice = () => {
    if (!item) return 0

    // Base price comes from selected size if available; otherwise product base price
    // Compute unit price for display in header badge (depends on selected size)
    const unitBasePrice = selectedSizeIndex !== null && item?.sizes && item.sizes[selectedSizeIndex]
      ? item.sizes[selectedSizeIndex].price
      : (item?.price ?? 0)

    let modifierTotal = 0

    customizationGroups.forEach(group => {
      const selectedOption = selectedOptions[group.id]
      if (selectedOption) {
        if (group.type === 'single' && typeof selectedOption === 'string') {
          const option = group.customization_options.find(opt => opt.id === selectedOption)
          if (option) {
            modifierTotal += option.price_modifier
          }
        } else if (group.type === 'multiple' && Array.isArray(selectedOption)) {
          ;(selectedOption as string[]).forEach(optionId => {
            const option = group.customization_options.find(opt => opt.id === optionId)
            if (option) {
              modifierTotal += option.price_modifier
            }
          })
        }
      }
    })

    return (unitBasePrice + modifierTotal) * quantity
  }

  const isFormValid = () => {
    // Require size selection if sizes exist
    const hasValidSize = item?.sizes && item.sizes.length > 0 ? selectedSizeIndex !== null : true

    // Check if all required groups have selections
    const requiredGroupsValid = customizationGroups.every(group => {
      if (!group.is_required) return true
      const selection = selectedOptions[group.id]
      if (group.type === 'single') {
        return !!(selection && typeof selection === 'string')
      } else {
        return !!(selection && Array.isArray(selection) && selection.length > 0)
      }
    })

    return hasValidSize && requiredGroupsValid
  }

  const handleConfirm = () => {
    if (!isFormValid()) return

    const selectedSize = selectedSizeIndex !== null && item?.sizes && item.sizes[selectedSizeIndex]
      ? item.sizes[selectedSizeIndex]
      : null

    // Prepare customization data
    const customizationData = {
      selectedOptions,
      notes,
      totalPrice: calculateTotalPrice(),
      quantity,
      selectedSize,
    }

    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      onConfirm(customizationData)
    }
    
    // Reset form
    setSelectedOptions({})
    setNotes("")
    setQuantity(1)
  }

  const totalPrice = calculateTotalPrice()
  const unitBasePrice = selectedSizeIndex !== null && item?.sizes && item.sizes[selectedSizeIndex]
    ? item.sizes[selectedSizeIndex].price
    : (item?.price ?? 0)

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 bg-background border shadow-2xl flex flex-col">
        {/* Header with product info */}
        <div className="flex-shrink-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 border-b border-border/50">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight text-foreground">
                  {item?.name}
                </DialogTitle>
                {item?.description && (
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <Badge className="bg-primary text-primary-foreground px-3 py-1 text-base font-bold shadow-md flex-shrink-0">
                {unitBasePrice} ر.س
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
          {/* Detailed product info */}
          {item && (
            <Card className="p-4 border-0 bg-muted/20">
              <div className="space-y-3">
                {item.fullDescription && (
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">وصف كامل</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.fullDescription}</p>
                  </div>
                )}

                {item.calories !== null && item.calories !== undefined && item.calories !== '' && (
                  <div className="text-sm">
                    <Label className="text-sm font-semibold mr-2">السعرات الحراريه</Label>
                    <span className="text-muted-foreground">{item.calories}</span>
                  </div>
                )}
                

                {item.addOns && item.addOns.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">الإضافات المتاحة</Label>
                    <div className="flex flex-wrap gap-2">
                      {item.addOns.map((a, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {a.name} (+{a.price} ر.س)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.allergens && item.allergens.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">مسببات الحساسية</Label>
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map((al, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">{al}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(item.tags && item.tags.length > 0) || item.category ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">العلامات والتصنيفات</Label>
                    <div className="flex flex-wrap gap-2">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">فئة: {item.category}</Badge>
                      )}
                      {item.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {/* Sizes selection - always visible when sizes exist */}
          {item?.sizes && item.sizes.length > 0 && (
            <Card className="p-4 border-0 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-bold">الأحجام</Label>
                <Badge variant="outline" className="text-xs">إلزامي</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {item.sizes.map((sz, idx) => {
                  const isSelected = selectedSizeIndex === idx
                  return (
                    <Button
                      key={idx}
                      variant={isSelected ? "default" : "outline"}
                      className={`justify-between ${isSelected ? 'shadow-md' : ''}`}
                      onClick={() => setSelectedSizeIndex(idx)}
                    >
                      <span>{sz.name}</span>
                      <Badge variant="secondary" className="text-xs">{sz.price} ر.س</Badge>
                    </Button>
                  )
                })}
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin ml-2" />
              <span>جاري تحميل خيارات التخصيص...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : customizationGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد خيارات تخصيص متاحة لهذا المنتج</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customizationGroups.map((group) => (
                <Card key={group.id} className="p-4 border-0 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold">{group.name_ar}</Label>
                    {group.is_required && (
                      <Badge variant="outline" className="text-xs">إلزامي</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {group.customization_options.map((option) => {
                      const isSelected = group.type === 'single'
                        ? selectedOptions[group.id] === option.id
                        : Array.isArray(selectedOptions[group.id]) && (selectedOptions[group.id] as string[]).includes(option.id)
                      return (
                        <Button
                          key={option.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`justify-between ${isSelected ? 'shadow-md' : ''}`}
                          onClick={() => handleOptionSelect(group.id, option.id, group.type)}
                        >
                          <span>{option.name_ar}</span>
                          {option.price_modifier !== 0 && (
                            <Badge variant="secondary" className="text-xs">{option.price_modifier > 0 ? `+${option.price_modifier}` : option.price_modifier} ر.س</Badge>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </Card>
              ))}

              {/* Quantity Selector */}
              <Card className="p-4 border-0 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                <div className="space-y-4">
                  <Label className="text-lg font-bold">الكمية</Label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <Button size="icon" className="rounded-full h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="w-full sm:flex-1 rounded-full px-6 h-12"
              onClick={onClose}
            >
              إغلاق
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isFormValid()}
              className="w-full sm:flex-1 rounded-full px-6 h-12 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4 ml-2" />
              إضافة للسلة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
