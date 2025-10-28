import type React from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Simple layout that just renders children
  // Authentication will be handled at the page level
  return <>{children}</>
}
