'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/lib/storefront'
import Header from '@/components/storefront/Header'
import { useStorefront } from '@/contexts/StorefrontContext'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react'
import { sanitize } from '@/lib/sanitize'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, customerToken, buyNow } = useStorefront()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/storefront/products/${params.id}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setProduct(result.data)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleAddToCart = useCallback(async () => {
    if (!customerToken) {
      toast.info('Please login to add items to cart')
      router.push('/store/login')
      return
    }

    if (!product) return

    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }, [customerToken, product, quantity, addToCart, router])

  const handleBuyNow = useCallback(async () => {
    if (!customerToken) {
      toast.info('Please login to purchase')
      router.push('/store/login')
      return
    }

    if (!product) return

    setBuying(true)
    try {
      await buyNow(product.id, quantity)
      toast.success('Opening checkout...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to checkout')
    } finally {
      setBuying(false)
    }
  }, [customerToken, product, quantity, buyNow, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 p-8">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-32 w-full" />
                <div className="space-y-4 border-t pt-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 p-8">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => {
                      const tagObj = tag as any;
                      const tagName = typeof tag === 'string' ? tag : tagObj?.name || tagObj?.slug || tagObj?.id || String(tag);
                      const tagKey = typeof tag === 'string' ? tag : tagObj?.id || tagObj?.slug || index;
                      return (
                        <Badge key={tagKey} variant="secondary">
                          {tagName}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <div className="text-4xl font-bold">
                  {product.currency} {product.price.toFixed(2)}
                </div>

                {product.description && (
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitize(product.description) }}
                  />
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-9 w-9"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-9 w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-9 w-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBuyNow}
                    disabled={buying || adding || !customerToken}
                    className="flex-1 bg-gradient-to-r from-primary to-blue-500 font-semibold shadow-md hover:shadow-lg"
                    size="lg"
                  >
                    {buying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={adding || buying || !customerToken}
                    variant="outline"
                    size="lg"
                    className="flex-1 border-2"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

