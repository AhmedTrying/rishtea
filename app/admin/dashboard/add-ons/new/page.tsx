import AddOnForm from "@/components/add-on-form"

export default function NewAddOnPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AddOnForm mode="create" />
    </div>
  )
}