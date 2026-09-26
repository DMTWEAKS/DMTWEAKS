'use client'

import { useEffect, useMemo, useState } from 'react'
import { Product } from '@/lib/storefront'
import ProductCard from '@/components/storefront/ProductCard'
import Header from '@/components/storefront/Header'
import Footer from '@/components/storefront/Footer'
import { Skeleton } from '@/components/ui/skeleton'

type GroupKey = 'tools' | 'services' | 'guides'

const GROUPS: { key: GroupKey; title: string; subtitle: string }[] = [
  { key: 'tools', title: 'Tools', subtitle: 'Software you download and run yourself.' },
  { key: 'services', title: 'Services', subtitle: 'We tune your PC for you.' },
  { key: 'guides', title: 'Guides', subtitle: 'Learn to tune your BIOS yourself.' },
]

function tagText(product: Product): string {
  return (product.tags || [])
    .map((tag) => {
      if (typeof tag === 'string') return tag
      const t = tag as any
      return t?.name || t?.slug || t?.id || ''
    })
    .join(' ')
    .toLowerCase()
}

// Services and guides are identified by their PayNow tags; everything else is a tool.
function groupOf(product: Product): GroupKey {
  const tags = tagText(product)
  if (tags.includes('service')) return 'services'
  if (tags.includes('guide')) return 'guides'
  return 'tools'
}

function isOutOfStock(product: Product): boolean {
  return product.stock !== undefined && product.stock !== null && product.stock <= 0
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/storefront/products')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setProducts(result.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const out: Record<GroupKey, Product[]> = { tools: [], services: [], guides: [] }
    for (const product of products) {
      if (isOutOfStock(product)) continue
      out[groupOf(product)].push(product)
    }
    for (const key of Object.keys(out) as GroupKey[]) {
      out[key].sort((a, b) => b.price - a.price)
    }
    return out
  }, [products])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative z-10">
        <section className="pt-40 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">Products</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tools you run yourself, services where we do it for you, and BIOS guides.
            </p>
            <nav aria-label="Product groups" className="mt-8 flex flex-wrap justify-center gap-2">
              {GROUPS.map((group) => (
                <a
                  key={group.key}
                  href={`#${group.key}`}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {group.title}
                  {!loading && (
                    <span className="ml-2 text-muted-foreground">{grouped[group.key].length}</span>
                  )}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {GROUPS.map((group) => {
          const items = grouped[group.key]
          if (!loading && items.length === 0) return null
          return (
            <section key={group.key} id={group.key} className="py-10 scroll-mt-32">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{group.title}</h2>
                  <p className="mt-1 text-muted-foreground">{group.subtitle}</p>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex flex-col space-y-4">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </main>
      <Footer />
    </div>
  )
}
