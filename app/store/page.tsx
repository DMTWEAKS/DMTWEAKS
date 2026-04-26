'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Product, Tag } from '@/lib/storefront'
import ProductCard from '@/components/storefront/ProductCard'
import Header from '@/components/storefront/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, Crown, Calendar, Zap, BookOpen, LayoutGrid } from 'lucide-react'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest'

type CategoryKey = 'all' | 'lifetime' | 'guides' | 'one-month' | 'one-time'

interface CategoryDef {
  key: CategoryKey
  title: string
  shortTitle: string
  icon: typeof Crown
  matchers: string[]
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'all',
    title: 'All Products',
    shortTitle: 'All',
    icon: LayoutGrid,
    matchers: [],
  },
  {
    key: 'lifetime',
    title: 'Lifetime',
    shortTitle: 'Lifetime',
    icon: Crown,
    matchers: ['lifetime', 'unlimited', 'forever', 'permanent'],
  },
  {
    key: 'guides',
    title: 'Guides',
    shortTitle: 'Guides',
    icon: BookOpen,
    matchers: ['guide', 'tutorial', 'documentation', 'manual'],
  },
  {
    key: 'one-month',
    title: 'One Month',
    shortTitle: '1 Month',
    icon: Calendar,
    matchers: ['one month', 'one-month', 'monthly', '1 month', '1-month', '30 day', '30-day'],
  },
  {
    key: 'one-time',
    title: 'One Time Use',
    shortTitle: '1 Time Use',
    icon: Zap,
    matchers: ['one time', 'one-time', 'single', 'single-use', '1 time', '1-time', 'onetime'],
  },
]

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

function getProductTagStrings(product: Product): string[] {
  if (!product.tags || product.tags.length === 0) return []
  return product.tags
    .map((tag) => {
      if (typeof tag === 'string') return tag
      const tagObj = tag as any
      return tagObj?.name || tagObj?.slug || tagObj?.id || ''
    })
    .filter(Boolean)
    .map((s) => s.toLowerCase())
}

function productMatchesCategory(product: Product, category: CategoryDef): boolean {
  if (category.key === 'all') return true
  if (category.matchers.length === 0) return false

  const tagStrings = getProductTagStrings(product)
  const haystack = [
    ...tagStrings,
    product.name?.toLowerCase() || '',
    product.description?.toLowerCase() || '',
  ].join(' ')

  return category.matchers.some((m) => haystack.includes(m))
}

export default function StorePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)

  const debouncedSetSearch = useRef(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 300)
  ).current

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  useEffect(() => {
    fetch('/api/storefront/store')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setStore(result.data)
      })
      .catch(() => {})

    fetch('/api/storefront/tags')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setTags(result.data)
      })
      .catch(() => {})

    fetchProducts()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/storefront/products')
      const result = await response.json()
      if (result.success) {
        setAllProducts(result.data || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      'all': allProducts.length,
      'lifetime': 0,
      'guides': 0,
      'one-month': 0,
      'one-time': 0,
    }
    for (const product of allProducts) {
      for (const cat of CATEGORIES) {
        if (cat.key !== 'all' && productMatchesCategory(product, cat)) {
          counts[cat.key]++
        }
      }
    }
    return counts
  }, [allProducts])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts]

    const activeCategoryDef = CATEGORIES.find((c) => c.key === activeCategory)
    if (activeCategoryDef && activeCategoryDef.key !== 'all') {
      filtered = filtered.filter((p) => productMatchesCategory(p, activeCategoryDef))
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      filtered = filtered.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query)
        const descMatch = product.description?.toLowerCase().includes(query)
        return nameMatch || descMatch
      })
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
          const aDate = new Date(a.created_at || 0).getTime()
          const bDate = new Date(b.created_at || 0).getTime()
          return bDate - aDate
        default:
          return 0
      }
    })

    return filtered
  }, [allProducts, activeCategory, debouncedSearchQuery, sortBy])

  const clearFilters = useCallback(() => {
    setActiveCategory('all')
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setSortBy('name-asc')
  }, [])

  const hasActiveFilters = useMemo(
    () => activeCategory !== 'all' || debouncedSearchQuery.trim() || sortBy !== 'name-asc',
    [activeCategory, debouncedSearchQuery, sortBy]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <Header />
      <main>
        <section className="border-b border-border/40 bg-gradient-to-b from-muted/20 via-background to-background py-8 pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-5 items-center justify-between sm:flex-row flex-col">
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-11 border-border/50 bg-background/80 focus:bg-background transition-colors"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-muted/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="h-11 rounded-md border border-border/50 bg-background/80 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-[180px] hover:bg-background transition-colors"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md overflow-hidden">
              <CardContent className="p-2 sm:p-3">
                <div
                  role="tablist"
                  aria-label="Product categories"
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
                >
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon
                    const isActive = activeCategory === category.key
                    const count = categoryCounts[category.key]

                    return (
                      <button
                        key={category.key}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCategory(category.key)}
                        className={`relative group flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 sm:py-5 text-sm font-semibold transition-all duration-200 border-2 ${
                          isActive
                            ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/60 text-foreground shadow-lg shadow-primary/10 scale-[1.02]'
                            : 'bg-background/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-background/80'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'
                          }`}
                        />
                        <span className="text-xs sm:text-sm leading-tight text-center">
                          {category.shortTitle}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 h-5 font-bold ${
                            isActive
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-muted/60 border-border/50'
                          }`}
                        >
                          {count}
                        </Badge>
                        {isActive && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-t-full bg-gradient-to-r from-primary to-blue-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found{activeCategory !== 'all' ? ' in this category' : ''}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters to see all products
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
