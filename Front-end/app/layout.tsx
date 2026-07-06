import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from 'react-hot-toast'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RiverCity Courier",
  description: "Book cargo vehicles with ease. Customer, Driver, and Admin platforms.",
  icons: {
    icon: [
      { url: "/images/Mainlogo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/Mainlogo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/images/Mainlogo.png",
    apple: { url: "/images/Mainlogo.png", sizes: "180x180" },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-white scroll-smooth`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgba(30, 41, 59, 0.96)',
              color: '#fff7ed',
              border: '1px solid rgba(251, 146, 60, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            },
            success: {
              iconTheme: {
                primary: '#f97316',
                secondary: '#fff7ed',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff7ed',
              },
            },
          }}
        />
      </body>
    </html>
  )
}