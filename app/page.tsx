"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Sparkles, Bell, Coffee, Zap, Star, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import CallWaiter from "@/components/call-waiter"

export default function HomePage() {
  

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url('/baking-pattern.svg'), linear-gradient(to bottom right, var(--background), var(--background), rgba(230,213,184,0.2))",
        backgroundSize: "200px 200px, auto",
        backgroundRepeat: "repeat, no-repeat",
        backgroundPosition: "top left, center",
      }}
    >
      {/* Enhanced Header with better mobile responsiveness */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-3 items-center">
            <div></div>
            <div className="flex items-center justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Image 
                  src="/logo.png" 
                  alt="شاي ريش | Rish Tea" 
                  width={56} 
                  height={56} 
                  className="relative sm:w-16 sm:h-16 rounded-2xl shadow-lg ring-2 ring-primary/20" 
                />
              </div>
            </div>
            <nav className="justify-self-end flex items-center gap-2 sm:gap-3">
              <Link href="#start-order">
                <Button className="rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  ابدأ الطلب
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with improved mobile layout and video background */}
      <section className="relative overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none brightness-[.55] saturate-110 contrast-105"
          src="/Video.MOV"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Stronger neutral overlay for clearer text, with warm brand tint */}
        <div className="absolute inset-0 z-10 bg-[#2C2C2C]/65" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#7B4B2A]/35 via-transparent to-[#2C2C2C]/50" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(249,246,241,0.06),transparent_55%)]" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(249,246,241,0.03),transparent_55%)]" />
        
        <div className="relative z-20 container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-primary-foreground/15 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 border border-primary-foreground/20 shadow-lg hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground animate-pulse" />
            <span className="text-sm sm:text-base font-semibold text-primary-foreground">تجربة طلب حديثة ومميزة</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 sm:mb-8 text-balance leading-tight">
            <span className="block">مرحباً بك في</span>
            <span className="block bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent drop-shadow-xl">
              شاي ريش | Rish Tea
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 max-w-2xl lg:max-w-3xl mx-auto text-pretty leading-relaxed mb-6 sm:mb-8 px-4">
            شاي وقهوة مع مخبوزات مصرية طازجة 🤍
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium">مشروبات فاخرة</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium">خدمة سريعة</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium">تجربة مميزة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Table Input Section with better mobile layout */}
      <section id="start-order" className="container mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
        <Card className="p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border-0 bg-card/95 backdrop-blur-sm ring-1 ring-border/50 hover:shadow-3xl transition-all duration-500 mx-auto max-w-2xl">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg mb-3 sm:mb-4">
                <svg className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                ابدأ طلبك
              </h3>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed px-2">
                اضغط للبدء وتصفح القائمة، سنطلب رقم الطاولة لاحقاً في الدفع
              </p>
            </div>
            
            <div className="space-y-5 sm:space-y-6">
              
              <div className="space-y-4">
                <Link href="/menu">
                  <Button
                    className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-[1.02] rounded-xl ripple"
                    size="lg"
                  >
                    <span className="flex items-center gap-3">
                      عرض القائمة
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Egyptian Singers Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            أبرز المطربين المصريين
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg mt-2">
            تحية للتراث الفني المصري — ثلاثة رموز خالدة
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="group p-6 text-center border border-[#7B4B2A]/20 rounded-3xl bg-card/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-[#7B4B2A]/10 hover:ring-[#7B4B2A]/30">
            <div className="relative w-full h-48 sm:h-56 rounded-2xl border border-border/50 bg-[#F9F6F1] overflow-hidden flex items-center justify-center">
              <Image
                src="/أم كلثوم.png"
                alt="أم كلثوم"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-4 mb-2 bg-gradient-to-r from-[#7B4B2A] to-[#2C2C2C] bg-clip-text text-transparent">أم كلثوم</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              كوكب الشرق، رمز الغناء العربي الكلاسيكي، بصوتٍ خالد وأداءٍ فريد.
            </p>
          </Card>

          <Card className="group p-6 text-center border border-[#7B4B2A]/20 rounded-3xl bg-card/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-[#7B4B2A]/10 hover:ring-[#7B4B2A]/30">
            <div className="relative w-full h-48 sm:h-56 rounded-2xl border border-border/50 bg-[#F9F6F1] overflow-hidden flex items-center justify-center">
              <Image
                src="/عبد-الحليم.png"
                alt="عبد الحليم حافظ"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
              />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-4 mb-2 bg-gradient-to-r from-[#7B4B2A] to-[#2C2C2C] bg-clip-text text-transparent">عبد الحليم حافظ</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              العندليب الأسمر، صاحب المدرسة الرومانسية والأغاني الخالدة.
            </p>
          </Card>

          <Card className="group p-6 text-center border border-[#7B4B2A]/20 rounded-3xl bg-card/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-[#7B4B2A]/10 hover:ring-[#7B4B2A]/30">
            <div className="relative w-full h-48 sm:h-56 rounded-2xl border border-border/50 bg-[#F9F6F1] overflow-hidden flex items-center justify-center">
              <Image
                src="/محمد عبد الوهاب.png"
                alt="محمد عبد الوهاب"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
              />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-4 mb-2 bg-gradient-to-r from-[#7B4B2A] to-[#2C2C2C] bg-clip-text text-transparent">محمد عبد الوهاب</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              موسيقار الأجيال، مجدد في اللحن والغناء، أثرى المكتبة العربية.
            </p>
          </Card>
        </div>
      </section>

      {/* Enhanced Features Section with improved mobile grid */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            لماذا تختار شاي ريش؟
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            نقدم لك تجربة استثنائية تجمع بين الأصالة والحداثة في كل كوب
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="group p-8 text-center border border-border/50 rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-transparent hover:ring-primary/30 animate-slide-up stagger-1">
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-inner border border-border/60">
              <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-3 text-foreground">مشروبات متنوعة</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">تشكيلة واسعة من الشاي والقهوة الفاخرة المحضرة بعناية فائقة</p>
          </Card>
          
          <Card className="group p-8 text-center border border-border/50 rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-transparent hover:ring-primary/30 animate-slide-up stagger-2">
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-inner border border-border/60">
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-3 text-foreground">طلب سريع</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">اطلب بسهولة وسرعة من طاولتك مباشرة عبر نظامنا الذكي</p>
          </Card>
          
          <Card className="group p-8 text-center border border-border/50 rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-transparent hover:ring-primary/30 animate-slide-up stagger-3 md:col-span-2 lg:col-span-1">
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-inner border border-border/60">
              <Star className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-3 text-foreground">خدمة مميزة</h4>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">نهتم براحتك وتجربتك المميزة مع فريق محترف ومدرب</p>
          </Card>
        </div>
      </section>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-4 inset-x-0 px-4 sm:hidden z-40">
        <div className="mx-auto max-w-md bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-2">
          <Link href="#start-order">
            <Button className="w-full rounded-xl bg-primary text-primary-foreground">
              ابدأ الطلب
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Footer with better mobile layout */}
      <footer className="relative border-t bg-gradient-to-br from-muted/40 to-muted/60 py-12 sm:py-16 mt-20 sm:mt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,149,107,0.05),transparent_70%)]"></div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl">
            <Image 
              src="/logo.png" 
              alt="شاي ريش | Rish Tea" 
              width={64} 
              height={64} 
              className="sm:w-20 sm:h-20 rounded-2xl shadow-lg ring-2 ring-primary/20" 
            />
          </div>
          <div>
            <h5 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              شاي ريش | Rish Tea
            </h5>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              © 2025 شاي ريش | Rish Tea. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
