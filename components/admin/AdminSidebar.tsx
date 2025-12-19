'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Key, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Editor',
    href: '/admin/editor',
    icon: LayoutDashboard,
  },
  {
    title: 'Keys',
    href: '/admin/keys',
    icon: Key,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

interface AdminSidebarProps {
  mobileMenuOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ mobileMenuOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname && mobileMenuOpen && onClose) {
      onClose()
    }
    prevPathnameRef.current = pathname
  }, [pathname, mobileMenuOpen, onClose])

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'w-64 bg-card border-r border-border min-h-screen p-4 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="mb-8 pt-12 lg:pt-0">
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
                onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
    </>
  )
}

