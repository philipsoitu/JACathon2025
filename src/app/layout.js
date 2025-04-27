import { Inter } from "next/font/google"
import "./globals.css"
import { auth0 } from "@/lib/auth0"
import { SessionProvider } from "@/contexts/SessionContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "RoadTripSync",
  description: "Plan trips together in real-time with friends and family",
}

export default async function RootLayout({ children }) {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider value={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}