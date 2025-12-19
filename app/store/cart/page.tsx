'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/storefront/Header'
import { useStorefront } from '@/contexts/StorefrontContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart, updateCartItem, customerToken, refreshCart, openCheckout } = useStorefront()
  const [updating, setUpdating] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (!customerToken) {
      router.push('/store/login')
      return
    }
    refreshCart()
  }, [customerToken])

  const handleQuantityChange = useCallback(async (productId: string, newQuantity: number) => {
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
  }, [removeFromCart, updateCartItem])

  if (!customerToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart
        </h1>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Your cart is empty
            </p>
            <Link
              href="/store"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex space-x-6"
                >
                  <Link href={`/store/products/${item.product.id}`}>
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link href={`/store/products/${item.product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {cart.currency} {item.product.price.toFixed(2)} each
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.id, item.quantity - 1)
                          }
                          disabled={updating === item.product.id}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="text-gray-900 dark:text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.id, item.quantity + 1)
                          }
                          disabled={updating === item.product.id}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cart.currency}{' '}
                      {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>
                      {cart.currency} {cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>
                      {cart.currency} {cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    setCheckingOut(true)
                    try {
                      await openCheckout()
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to checkout')
                    } finally {
                      setCheckingOut(false)
                    }
                  }}
                  disabled={checkingOut}
                  className="w-full"
                >
                  {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                <Link
                  href="/store"
                  className="block w-full mt-3 text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

