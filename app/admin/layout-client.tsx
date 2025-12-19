'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  const handleMenuClose = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <AdminSidebar 
        mobileMenuOpen={mobileMenuOpen} 
        onClose={handleMenuClose} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={handleMenuToggle} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

