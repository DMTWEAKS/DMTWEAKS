'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Header from '@/components/storefront/Header'
import { useStorefront } from '@/contexts/StorefrontContext'
import type { Delivery } from '@/lib/storefront'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, customerToken, refreshCart } = useStorefront()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!customerToken) {
      router.push('/store/login')
      return
    }
    refreshCart()

    fetch('/api/storefront/delivery')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setDeliveries(result.data || [])
          if (result.data && result.data.length > 0) {
            setSelectedDelivery(result.data[0].id)
          }
        }
      })
      .catch(() => {})
  }, [customerToken, router, refreshCart])

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `customer ${customerToken}`,
        },
        body: JSON.stringify({
          delivery_id: selectedDelivery || undefined,
        }),
      })

      const result = await response.json()
      if (result.success) {
        if (result.data.url) {
          const checkoutUrl = encodeURIComponent(result.data.url)
          router.push(`/store/checkout/pay?url=${checkoutUrl}`)
        } else {
          toast.error('Checkout created but no payment URL was returned. Please contact support.')
        }
      } else {
        toast.error(result.error || 'Failed to create checkout')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checkout')
    } finally {
      setLoading(false)
    }
  }

  if (!customerToken) {
    return null
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Your cart is empty
            </p>
            <Button onClick={() => router.push('/store')}>
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delivery Options
            </h2>
            {deliveries.length > 0 ? (
              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <label
                    key={delivery.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedDelivery === delivery.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={delivery.id}
                      checked={selectedDelivery === delivery.id}
                      onChange={(e) => setSelectedDelivery(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {delivery.name}
                      </div>
                      {delivery.estimated_days && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Estimated: {delivery.estimated_days} days
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {delivery.currency} {delivery.price.toFixed(2)}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No delivery options available
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-gray-600 dark:text-gray-400"
                >
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>
                    {cart.currency}{' '}
                    {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {selectedDelivery && deliveries.find((d) => d.id === selectedDelivery) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery:</span>
                  <span>
                    {
                      deliveries.find((d) => d.id === selectedDelivery)?.currency
                    }{' '}
                    {
                      deliveries.find((d) => d.id === selectedDelivery)?.price.toFixed(2)
                    }
                  </span>
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>
                  {cart.currency}{' '}
                  {(
                    cart.total +
                    (selectedDelivery
                      ? deliveries.find((d) => d.id === selectedDelivery)?.price || 0
                      : 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading || (deliveries.length > 0 && !selectedDelivery)}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

