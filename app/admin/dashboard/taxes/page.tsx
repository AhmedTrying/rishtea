import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TaxSettingsForm from "@/components/tax-settings-form"
import TaxRulesForm from "@/components/tax-rules-form"

export default async function TaxesPage() {
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
        <h1 className="text-3xl font-bold">الضرائب</h1>
        <p className="text-muted-foreground mt-1">إدارة إعدادات الضرائب وقواعد الضرائب</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الضرائب</CardTitle>
          <CardDescription>تحديد نسبة الضريبة العامة (VAT)</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxSettingsForm settings={settingsMap || {}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قواعد الضرائب</CardTitle>
          <CardDescription>إنشاء وإدارة قواعد الضرائب المشروطة</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxRulesForm />
        </CardContent>
      </Card>
    </div>
  )
}