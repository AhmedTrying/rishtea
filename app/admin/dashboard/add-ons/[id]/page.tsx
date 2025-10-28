import { createClient } from "@/lib/supabase/server"
import AddOnForm from "@/components/add-on-form"
import { notFound } from "next/navigation"

export default async function EditAddOnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: addOn } = await supabase
    .from("add_ons")
    .select("*")
    .eq("id", id)
    .single()

  if (!addOn) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AddOnForm addOn={addOn} mode="edit" />
    </div>
  )
}