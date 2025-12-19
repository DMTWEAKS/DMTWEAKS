import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StorefrontProvider } from '@/contexts/StorefrontContext'
import { Toaster } from '@/components/ui/sonner'
import SmoothScroll from '@/components/SmoothScroll'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DM TWEAKS',
  description: '100% Efficent TWEAKS', 
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${inter.className}`}>
        <SmoothScroll />
        <StorefrontProvider>{children}</StorefrontProvider>
        <Toaster />
      </body>
    </html>
  )
}

