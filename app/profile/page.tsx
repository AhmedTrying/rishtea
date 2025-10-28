"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, User, ShoppingBag, Clock, MapPin, Phone, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  // Sample order history - would come from database
  const orderHistory = [
    { id: 1, date: "2025-01-20", items: 3, total: 45, status: "مكتمل" },
    { id: 2, date: "2025-01-18", items: 2, total: 30, status: "مكتمل" },
    { id: 3, date: "2025-01-15", items: 5, total: 78, status: "مكتمل" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-6 px-4">
        <div className="container mx-auto">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 mb-4">
              <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground/10 p-4 rounded-full">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">الملف الشخصي</h1>
              <p className="text-primary-foreground/80">مرحباً بك في شاي ريش | Rish Tea</p>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Image src="/logo.png" alt="شاي ريش | Rish Tea" width={80} height={80} className="rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold mb-1">شاي ريش | Rish Tea</h2>
              <p className="text-muted-foreground">شاي ريش، شاي تعيشه 🤍</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              شاي ريش هو وجهتك للاستمتاع بأصالة المقاهي المصرية بلمسة عصرية. نقدم تشكيلة دافئة من الشاي والمشروبات التي تمنحك لحظة تعيشها.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">العنوان</h3>
                  <p className="text-sm text-muted-foreground">الرياض، المملكة العربية السعودية</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">ساعات العمل</h3>
                  <p className="text-sm text-muted-foreground">يومياً: 8 صباحاً - 12 منتصف الليل</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">الهاتف</h3>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    +966 50 123 4567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    info@rishtea.sa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Order History */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            سجل الطلبات
          </h2>
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">طلب #{order.id}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{order.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                    <p className="text-sm">{order.items} منتجات</p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">{order.total} ر.س</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full h-14 text-lg bg-transparent">
              العودة للرئيسية
            </Button>
          </Link>
          <Link href="/menu">
            <Button className="w-full h-14 text-lg">عرض القائمة</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Image src="/logo.png" alt="شاي ريش | Rish Tea" width={60} height={60} className="mx-auto mb-4 rounded-lg" />
          <p className="text-muted-foreground mb-2">© 2025 شاي ريش | Rish Tea. جميع الحقوق محفوظة</p>
          <p className="text-sm text-muted-foreground">صُنع بحب في المملكة العربية السعودية</p>
        </div>
      </footer>
    </div>
  )
}
