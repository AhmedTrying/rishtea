import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaymentMethodsForm from "@/components/payment-methods-form"
import StoreSettingsForm from "@/components/store-settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from("settings").select("*")

  const settingsMap = settings?.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">إدارة إعدادات المتجر والنظام</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store">معلومات المتجر</TabsTrigger>
          <TabsTrigger value="payment">طرق الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المتجر</CardTitle>
              <CardDescription>تحديث معلومات المتجر الأساسية</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreSettingsForm settings={settingsMap || {}} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>طرق الدفع</CardTitle>
              <CardDescription>إدارة طرق الدفع المتاحة للعملاء</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodsForm settings={settingsMap || {}} />
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}
