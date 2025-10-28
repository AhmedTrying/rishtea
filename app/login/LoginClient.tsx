"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginClient({ next }: { next: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push(next)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء العملية")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-md">
      <h1 className="text-3xl font-bold mb-6">تسجيل الدخول</h1>
      <Card className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جارٍ المعالجة..." : isSignup ? "إنشاء حساب" : "تسجيل الدخول"}
          </Button>
        </form>
        <div className="text-center">
          <button className="text-sm text-primary" onClick={() => setIsSignup((v) => !v)}>
            {isSignup ? "لديك حساب؟ تسجيل الدخول" : "مستخدم جديد؟ إنشاء حساب"}
          </button>
        </div>
      </Card>
    </div>
  )
}
