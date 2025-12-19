'use client'

import { useStorefront } from '@/contexts/StorefrontContext'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Trash2, Loader2, X } from 'lucide-react'
import Link from 'next/link'

interface CartDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const { cart, removeFromCart, updateCartItem, customerToken, openCheckout } = useStorefront()
  const [updating, setUpdating] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [productStocks, setProductStocks] = useState<Record<string, number>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      setProductStocks({})
      return
    }

    const fetchStocks = async () => {
      const stocks: Record<string, number> = {}
      await Promise.all(
        cart.items.map(async (item) => {
          try {
            const response = await fetch(`/api/storefront/products/${item.product.id}`)
            const result = await response.json()
            if (result.success && result.data.stock !== undefined) {
              stocks[item.product.id] = result.data.stock
            }
          } catch (error) {
          }
        })
      )
      setProductStocks(stocks)
    }

    fetchStocks()
  }, [cart?.items])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId)
      return
    }
    setUpdating(productId)
    try {
      await updateCartItem(productId, newQuantity)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  if (!isOpen) return null

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
        className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] z-50 shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h3 className="font-semibold text-lg">Shopping Cart</h3>
            <p className="text-sm text-muted-foreground">
              {cart && cart.items && cart.items.length > 0
                ? `${cart.items.length} item${cart.items.length > 1 ? 's' : ''}`
                : 'Your cart is empty'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add items to get started</p>
              <Button asChild variant="outline" className="mt-4" onClick={onClose}>
                <Link href="/store">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 rounded-lg border border-border/50 p-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/products/${item.product.id}`}
                      onClick={onClose}
                      className="block"
                    >
                      <h4 className="font-semibold text-sm truncate hover:text-primary transition-colors">
                        {item.product.name}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cart.currency} {item.product.price.toFixed(2)} each
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(item.product.id, item.quantity - 1)
                        }
                        disabled={updating === item.product.id}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {updating === item.product.id ? (
                          <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(item.product.id, item.quantity + 1)
                        }
                        disabled={
                          updating === item.product.id ||
                          (productStocks[item.product.id] !== undefined &&
                            item.quantity >= productStocks[item.product.id])
                        }
                        title={
                          productStocks[item.product.id] !== undefined &&
                          item.quantity >= productStocks[item.product.id]
                            ? `Only ${productStocks[item.product.id]} available in stock`
                            : 'Increase quantity'
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items && cart.items.length > 0 && (
          <div className="border-t border-border/50 p-4 bg-muted/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-xl font-bold">
                {cart.currency} {cart.total.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={async () => {
                setCheckingOut(true)
                try {
                  await openCheckout()
                  onClose()
                } catch (error: any) {
                  toast.error(error.message || 'Failed to checkout')
                } finally {
                  setCheckingOut(false)
                }
              }}
              disabled={checkingOut}
              className="w-full bg-gradient-to-r from-primary to-blue-500 font-semibold"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}

