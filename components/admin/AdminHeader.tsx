'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AdminHeaderProps {
  onMenuToggle?: () => void
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Logged out successfully')
        router.push('/admin-login')
      } else {
        toast.error(result.error || 'Failed to logout')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to logout')
    }
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMenuToggle?.()
          }}
          className="lg:hidden h-9 w-9"
          aria-label="Toggle menu"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Store className="h-5 w-5" />
          <span className="font-semibold text-sm sm:text-base">DM TWEAKS</span>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/store">
            <Store className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">View Storefront</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="sm:hidden">
          <Link href="/store">
            <Store className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="sm:hidden">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

