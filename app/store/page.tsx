'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Product, Tag } from '@/lib/storefront'
import ProductCard from '@/components/storefront/ProductCard'
import Header from '@/components/storefront/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest'

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export default function StorePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
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
        if (result.success) {
          setStore(result.data)
        }
      })
      .catch(() => {})

    fetch('/api/storefront/tags')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setTags(result.data)
        }
      })
      .catch(() => {})

    fetchProducts()
  }, [selectedTag])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const url = selectedTag
        ? `/api/storefront/products?tag=${selectedTag}`
        : '/api/storefront/products'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setAllProducts(result.data || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [selectedTag])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts]

    if (selectedTag) {
      filtered = filtered.filter((product) => {
        if (!product.tags || product.tags.length === 0) return false
        return product.tags.some((tag) => {
          if (typeof tag === 'string') {
            return tag === selectedTag
          }
          const tagObj = tag as any
          return tagObj?.slug === selectedTag || tagObj?.id === selectedTag || tagObj?.name === selectedTag
        })
      })
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      filtered = filtered.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query)
        const descMatch = product.description?.toLowerCase().includes(query)
        return nameMatch || descMatch
      })
    }

    if (minPrice) {
      const min = parseFloat(minPrice)
      if (!isNaN(min)) {
        filtered = filtered.filter((product) => product.price >= min)
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      if (!isNaN(max)) {
        filtered = filtered.filter((product) => product.price <= max)
      }
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
  }, [allProducts, selectedTag, debouncedSearchQuery, sortBy, minPrice, maxPrice])

  const clearFilters = useCallback(() => {
    setSelectedTag(null)
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('name-asc')
  }, [])

  const hasActiveFilters = useMemo(() => 
    selectedTag || debouncedSearchQuery.trim() || minPrice || maxPrice || sortBy !== 'name-asc',
    [selectedTag, debouncedSearchQuery, minPrice, maxPrice, sortBy]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <Header />
      <main>
        <section className="border-b border-border/40 bg-gradient-to-b from-muted/20 via-background to-background py-8 pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-full">
                <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
                  <CardContent className="p-6">
                    <div className="flex gap-5 items-center justify-between sm:flex-row flex-col">
                      <div className="relative flex-1 max-w-md">
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
                        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</label>
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
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(12)].map((_, i) => (
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
                  No products found
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

