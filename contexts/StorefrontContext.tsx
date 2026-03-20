'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { storefrontClient } from '@/lib/storefront'
import type { Cart, Customer, Product } from '@/lib/storefront'

interface StorefrontContextType {
  customerToken: string | null
  setCustomerToken: (token: string | null) => void
  customer: Customer | null
  cart: Cart | null
  loading: boolean
  refreshCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateCartItem: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  openCheckout: (deliveryId?: string) => Promise<void>
  buyNow: (productId: string, quantity?: number, deliveryId?: string) => Promise<void>
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined)

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [customerToken, setCustomerTokenState] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('paynow_customer_token')
      if (token) {
        setCustomerTokenState(token)
        storefrontClient.setCustomerToken(token)
      }
    }
  }, [])

  const setCustomerToken = (token: string | null) => {
    setCustomerTokenState(token)
    if (token) {
      storefrontClient.setCustomerToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('paynow_customer_token', token)
      }
    } else {
      storefrontClient.clearCustomerToken()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('paynow_customer_token')
      }
      setCustomer(null)
    }
  }

  const refreshCart = useCallback(async () => {
    if (!customerToken) {
      setCart(null)
      return
    }

    try {
      const response = await fetch('/api/storefront/cart', {
        headers: {
          'Authorization': `customer ${customerToken}`,
        },
        cache: 'no-store',
      })
      const result = await response.json()
      if (result.success) {
        setCart(result.data)
      }
    } catch (error) {
    }
  }, [customerToken])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!customerToken) {
      throw new Error('Please login to add items to cart')
    }

    try {
      const productResponse = await fetch(`/api/storefront/products/${productId}`)
      const productResult = await productResponse.json()
      if (productResult.success && typeof productResult.data.stock === 'number') {
        const availableStock = productResult.data.stock
        const currentCartQuantity = cart?.items?.find(item => item.product.id === productId)?.quantity || 0
        const requestedQuantity = currentCartQuantity + quantity
        
        if (requestedQuantity > availableStock) {
          throw new Error(`Only ${availableStock} item${availableStock === 1 ? '' : 's'} available in stock`)
        }
      }
    } catch (error: any) {
      if (error.message && error.message.includes('available in stock')) {
        throw error
      }
    }

    try {
      const response = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `customer ${customerToken}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      const result = await response.json()
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add to cart')
    }
  }

  const removeFromCart = useCallback(async (productId: string) => {
    if (!customerToken || !cart) return

    try {
      const cartItem = cart.items?.find(item => item.product.id === productId)
      const lineKey = cartItem?.line_key || productId
      
      const response = await fetch(`/api/storefront/cart/${encodeURIComponent(lineKey)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `customer ${customerToken}`,
        },
        cache: 'no-store',
      })
      const result = await response.json()
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error || 'Failed to remove from cart')
      }
    } catch (error) {
      throw error
    }
  }, [customerToken, cart, refreshCart])

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    if (!customerToken) return

    const qty = Math.max(0, Math.min(1000, quantity));

    try {
      const productResponse = await fetch(`/api/storefront/products/${productId}`, {
        cache: 'no-store',
      })
      const productResult = await productResponse.json()
      if (productResult.success && typeof productResult.data.stock === 'number') {
        const availableStock = productResult.data.stock
        
        if (qty > availableStock) {
          throw new Error(`Only ${availableStock} item${availableStock === 1 ? '' : 's'} available in stock`)
        }
      }
    } catch (error: any) {
      if (error.message && error.message.includes('available in stock')) {
        throw error
      }
    }

    try {
      const response = await fetch(`/api/storefront/cart/${encodeURIComponent(productId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `customer ${customerToken}`,
        },
        body: JSON.stringify({ quantity: qty }),
        cache: 'no-store',
      })
      const result = await response.json()
      if (result.success) {
        await refreshCart()
      }
    } catch (error) {
    }
  }, [customerToken, refreshCart])

  const clearCart = useCallback(async () => {
    if (!customerToken) return

    try {
      const response = await fetch('/api/storefront/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `customer ${customerToken}`,
        },
        cache: 'no-store',
      })
      const result = await response.json()
      if (result.success) {
        setCart(result.data)
      }
    } catch (error) {
    }
  }, [customerToken])

  const openCheckout = useCallback(async (deliveryId?: string) => {
    if (!customerToken) {
      throw new Error('Please login to checkout')
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty')
    }

    try {
      const response = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `customer ${customerToken}`,
        },
        body: JSON.stringify({
          delivery_id: deliveryId ? String(deliveryId).trim().substring(0, 255) : undefined,
        }),
        cache: 'no-store',
      })

      const result = await response.json()
      if (result.success) {
        if (result.data.url) {
          const checkoutUrl = encodeURIComponent(result.data.url)
          window.location.href = `/store/checkout/pay?url=${checkoutUrl}`
        } else {
          throw new Error('Checkout created but no payment URL was returned')
        }
      } else {
        throw new Error(result.error || 'Failed to create checkout')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create checkout')
    }
  }, [customerToken, cart])

  const buyNow = useCallback(async (productId: string, quantity: number = 1, deliveryId?: string) => {
    if (!customerToken) {
      throw new Error('Please login to purchase')
    }

    const qty = Math.max(1, Math.min(1000, quantity));
    const productIdStr = String(productId).trim().substring(0, 255);

    try {
      const response = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `customer ${customerToken}`,
        },
        body: JSON.stringify({
          lines: [
            {
              product_id: productIdStr,
              quantity: qty,
            },
          ],
          delivery_id: deliveryId ? String(deliveryId).trim().substring(0, 255) : undefined,
        }),
        cache: 'no-store',
      })

      const result = await response.json()
      if (result.success) {
        if (result.data.url) {
          const checkoutUrl = encodeURIComponent(result.data.url)
          window.location.href = `/store/checkout/pay?url=${checkoutUrl}`
        } else {
          throw new Error('Checkout created but no payment URL was returned')
        }
      } else {
        throw new Error(result.error || 'Failed to create checkout')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create checkout')
    }
  }, [customerToken])


  useEffect(() => {
    if (customerToken) {
      refreshCart()
      fetch('/api/storefront/customer', {
        headers: {
          'Authorization': `customer ${customerToken}`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setCustomer(result.data)
          }
        })
        .catch(() => {})
    } else {
      setCart(null)
      setCustomer(null)
    }
    setLoading(false)
  }, [customerToken])

  return (
    <StorefrontContext.Provider
      value={{
        customerToken,
        setCustomerToken,
        customer,
        cart,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        openCheckout,
        buyNow,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  )
}

export function useStorefront() {
  const context = useContext(StorefrontContext)
  if (context === undefined) {
    throw new Error('useStorefront must be used within a StorefrontProvider')
  }
  return context
}

