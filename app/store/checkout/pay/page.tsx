'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/storefront/Header'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function CheckoutPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutUrl = searchParams.get('url')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    } else {
      setLoading(false)
    }
  }, [checkoutUrl])

  if (!checkoutUrl) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Checkout URL Missing</h1>
            <p className="text-muted-foreground">
              The checkout URL is missing. Please try again.
            </p>
            <Button onClick={() => router.push('/store/checkout')}>
              Go to Checkout
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Redirecting to Checkout...</h1>
          <p className="text-muted-foreground">
            Please wait while we redirect you to the secure checkout page.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (checkoutUrl) {
                window.location.href = checkoutUrl
              }
            }}
          >
            Click here if you are not redirected
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </main>
      </div>
    }>
      <CheckoutPayContent />
    </Suspense>
  )
}

