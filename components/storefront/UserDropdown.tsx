'use client'

import { useStorefront } from '@/contexts/StorefrontContext'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, LogOut, X } from 'lucide-react'

interface UserDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const { customer, setCustomerToken } = useStorefront()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    setCustomerToken(null)
    onClose()
    router.push('/store')
  }

  if (!isOpen || !customer) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <Card
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-80 z-50 shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h3 className="font-semibold text-lg">My Account</h3>
            <p className="text-sm text-muted-foreground">Account information</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Details */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-base font-medium text-foreground mt-1">{customer.name}</p>
          </div>

          {customer.platform && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <p className="text-base text-foreground mt-1">{customer.platform}</p>
            </div>
          )}

          {customer.platform_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Platform ID</label>
              <p className="text-base text-foreground mt-1 font-mono text-sm">{customer.platform_id}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </>
  )
}

