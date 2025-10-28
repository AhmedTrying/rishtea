import { Suspense } from "react"
import LoginClient from "./LoginClient"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const nextParam = typeof searchParams?.next === "string" ? searchParams.next : undefined
  const next = nextParam || "/profile"

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <LoginClient next={next} />
    </Suspense>
  )
}