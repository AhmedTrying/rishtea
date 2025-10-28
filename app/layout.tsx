import type React from "react"
import type { Metadata } from "next"
import { Cairo, Poppins } from "next/font/google"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "شاي ريش | Rish Tea",
  description: "قائمة طلبات شاي ريش | Rish Tea",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
