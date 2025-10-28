"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CustomizationDialog } from "@/components/customization-dialog"
import CallWaiter from "@/components/call-waiter"
import { ProductImageCarousel } from "@/components/product-image-carousel"

type MenuItem = {
  id: string // Changed from number to string to match UUID from database
  name: string
  price: number
  description: string
  image: string
  images: string[] // Array of all product images
  // Extended product details for dialog display
  fullDescription?: string
  calories?: number | string | null
  sizes?: { name: string; price: number }[]
  addOns?: { name: string; price: number }[]
  allergens?: string[]
  tags?: string[]
  category?: string
}

type MenuCategory = {
  id: string
  name: string
  items: MenuItem[]
}

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  customization: {
    selectedOptions: Record<string, string | string[]>
    notes: string
    totalPrice: number
    quantity: number
    selectedSize?: { name: string; price: number } | null
  }
}

function MenuContent({ menuCategories }: { menuCategories: MenuCategory[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableNumber = searchParams.get("table")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState(menuCategories[0]?.id || "")
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(null)
  const [customizationOptions, setCustomizationOptions] = useState<Record<string, { name_ar: string; group_name_ar: string }>>({})

  // Fetch customization option names for display
  const fetchCustomizationOptionNames = async (optionIds: string[]) => {
    try {
      console.log('Fetching options for IDs:', optionIds)
      const response = await fetch('/api/customization-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds })
      })
      if (response.ok) {
        const options = await response.json()
        console.log('Received options:', options)
        const optionsMap: Record<string, { name_ar: string; group_name_ar: string }> = {}
        options.forEach((option: any) => {
          optionsMap[option.id] = {
            name_ar: option.name_ar,
            group_name_ar: option.group_name_ar
          }
        })
        console.log('Options map:', optionsMap)
        setCustomizationOptions(prev => ({ ...prev, ...optionsMap }))
      } else {
        console.error('API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching customization options:', error)
    }
  }

  // Extract all option IDs from cart items and fetch their names
  useEffect(() => {
    const allOptionIds = new Set<string>()
    console.log('Cart items:', cart)
    cart.forEach(item => {
      console.log('Processing item:', item.name, 'customizations:', item.customization.selectedOptions)
      if (item.customization.selectedOptions) {
        Object.entries(item.customization.selectedOptions).forEach(([groupId, optionValue]) => {
          console.log('Group:', groupId, 'Options:', optionValue)
          if (Array.isArray(optionValue)) {
            optionValue.forEach(id => {
              // Check if this is from the add-ons group and prefix accordingly
              if (groupId === 'add-ons') {
                console.log('Adding addon ID:', `addon-${id}`)
                allOptionIds.add(`addon-${id}`)
              } else {
                console.log('Adding regular ID:', id)
                allOptionIds.add(id)
              }
            })
          } else if (optionValue) {
            // Check if this is from the add-ons group and prefix accordingly
            if (groupId === 'add-ons') {
              console.log('Adding addon ID:', `addon-${optionValue}`)
              allOptionIds.add(`addon-${optionValue}`)
            } else {
              console.log('Adding regular ID:', optionValue)
              allOptionIds.add(optionValue)
            }
          }
        })
      }
    })
    
    console.log('All option IDs to fetch:', Array.from(allOptionIds))
    if (allOptionIds.size > 0) {
      fetchCustomizationOptionNames(Array.from(allOptionIds))
    }
  }, [cart])

  const addToCart = (
    item: MenuItem,
    customization: {
      selectedOptions: Record<string, string | string[]>
      notes: string
      totalPrice: number
      quantity: number
      selectedSize?: { name: string; price: number } | null
      sugar?: string
      ice?: string
    }
  ) => {
    setCart((prev) => [
      ...prev,
      {
        ...item,
        quantity: 1,
        customization,
      },
    ])
  }

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }),
    )
  }

  const handleCheckout = () => {
    sessionStorage.setItem("cart", JSON.stringify(cart))
    sessionStorage.setItem("tableNumber", tableNumber || "")
    router.push("/payment")
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => {
    const customizationQty = item.customization?.quantity || 1
    const unitCustomizedPrice = item.customization?.totalPrice
      ? item.customization.totalPrice / customizationQty
      : item.price
    return sum + unitCustomizedPrice * item.quantity
  }, 0)

  const currentCategory = menuCategories.find((cat) => cat.id === selectedCategory)

  const CartContent = () => (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="text-3xl font-bold">سلة الطلبات</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-muted rounded-full p-8 mb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground font-medium">السلة فارغة</p>
            <p className="text-muted-foreground mt-2">ابدأ بإضافة المنتجات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <Card key={`${item.id}-${index}`} className="p-5 border-2 bg-gradient-to-br from-background to-muted/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2 text-foreground">{item.name}</h4>
                    {item.customization?.selectedSize && (
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          الحجم: {item.customization.selectedSize.name}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary font-bold text-xl">
                        {item.customization?.totalPrice
                          ? (item.customization.totalPrice / (item.customization.quantity || 1))
                          : item.price} ر.س
                      </span>
                      <Badge variant="outline" className="text-xs">
                        الكمية: {item.quantity}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-3 text-sm">
                      {/* Display selected customization options */}
                      {item.customization.selectedOptions && Object.keys(item.customization.selectedOptions).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">التخصيصات المحددة</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(item.customization.selectedOptions).map(([groupId, optionIds]) => {
                              if (!optionIds || (Array.isArray(optionIds) && optionIds.length === 0)) return null;
                              
                              // Display actual option names from fetched data
                              const displayValue = Array.isArray(optionIds) 
                                ? optionIds.map(id => {
                                    // For add-ons, look up with addon- prefix
                                    const lookupId = groupId === 'add-ons' ? `addon-${id}` : id;
                                    return customizationOptions[lookupId]?.name_ar || id;
                                  }).join(', ')
                                : (() => {
                                    // For add-ons, look up with addon- prefix
                                    const lookupId = groupId === 'add-ons' ? `addon-${optionIds}` : optionIds;
                                    return customizationOptions[lookupId]?.name_ar || optionIds;
                                  })();
                              
                              return (
                                <Badge key={groupId} variant="secondary" className="font-medium text-xs py-1 px-3 bg-primary/10 text-primary border-primary/20">
                                  {displayValue}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Display notes if available */}
                      {item.customization.notes && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">ملاحظات خاصة</p>
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{item.customization.notes}</p>
                        </div>
                      )}
                      
                      {/* Display total price if different from base price */}
                      {item.customization.totalPrice !== item.price && (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">السعر بعد التخصيص</span>
                          <Badge variant="default" className="font-bold text-sm bg-green-600 hover:bg-green-700 text-white">
                            {item.customization.totalPrice} ر.س
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 -mt-1 -ml-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => removeFromCart(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full h-10 w-10 border-2 bg-transparent"
                      onClick={() => updateQuantity(index, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-xl">{item.quantity}</span>
                    <Button size="icon" className="rounded-full h-10 w-10" onClick={() => updateQuantity(index, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground font-semibold">{item.price * item.quantity} ر.س</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="border-t p-6 space-y-4 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">المجموع الكلي</span>
            <span className="text-3xl font-bold text-primary">{totalPrice} ر.س</span>
          </div>
          <Button onClick={handleCheckout} className="w-full h-14 text-xl font-semibold shadow-lg" size="lg">
            تأكيد الطلب والدفع
          </Button>
        </div>
      )}
    </div>
  )

  if (menuCategories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد منتجات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundImage:
          "url('/baking-pattern.svg'), linear-gradient(to bottom right, var(--background), var(--background), rgba(230,213,184,0.2))",
        backgroundSize: "200px 200px, auto",
        backgroundRepeat: "repeat, no-repeat",
        backgroundPosition: "top left, center",
      }}
    >
      <CustomizationDialog
        item={customizationItem}
        onClose={() => setCustomizationItem(null)}
        onConfirm={(customization) => {
          if (customizationItem) {
            addToCart(customizationItem, customization)
            setCustomizationItem(null)
          }
        }}
      />

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <Image src="/logo.png" alt=" " width={48} height={48} className="rounded-2xl shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold"> </h1>
                {tableNumber && <p className="text-sm text-muted-foreground font-medium">الطاولة {tableNumber}</p>}
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <CallWaiter tableNumber={tableNumber ? parseInt(tableNumber) : undefined} />
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative rounded-full h-12 w-12 border-2 bg-transparent"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -left-2 h-6 w-6 flex items-center justify-center p-0 bg-primary text-primary-foreground border-2 border-background">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg p-0 bg-background/90 backdrop-blur-xl">
                  <CartContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[89px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto py-5 scrollbar-hide">
            {menuCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-6 h-11 font-semibold border-2 transition-all ${
                  selectedCategory === category.id ? "shadow-lg" : ""
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {currentCategory?.name}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {currentCategory?.items.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-card/95 ring-1 ring-border/30 hover:ring-primary/30 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-white overflow-hidden">
                <ProductImageCarousel
                  images={item.images}
                  productName={item.name}
                  className="w-full h-full"
                />
                <div className="absolute top-2 right-2 z-20">
                  <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    {item.price} ر.س
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm line-clamp-2 group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      {item.price} ر.س
                    </span>
                  </div>
                  <Button
                    onClick={() => setCustomizationItem(item)}
                    size="sm"
                    className="w-full rounded-full px-3 h-8 sm:h-9 font-semibold shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:scale-[1.02] text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    <span>إضافة</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Empty state for categories with no items */}
        {currentCategory?.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="bg-gradient-to-br from-muted to-muted/80 rounded-full p-6 sm:p-8 mb-4 shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-muted-foreground">لا توجد منتجات</h3>
            <p className="text-muted-foreground text-sm">لا توجد منتجات متاحة في هذه الفئة حالياً</p>
          </div>
        )}
      </section>

      {totalItems > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="h-16 px-8 shadow-2xl text-lg gap-4 rounded-full font-semibold border-4 border-background"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>عرض السلة ({totalItems})</span>
                <Badge variant="secondary" className="mr-2 h-8 px-3 text-base font-bold">
                  {totalPrice} ر.س
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-lg p-0 bg-background/90 backdrop-blur-xl">
              <CartContent />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}

export default function MenuClient({ menuCategories }: { menuCategories: MenuCategory[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <MenuContent menuCategories={menuCategories} />
    </Suspense>
  )
}
