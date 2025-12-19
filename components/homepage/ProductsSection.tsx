'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Product } from '@/lib/storefront'

const ProductCard = dynamic(() => import("@/components/storefront/ProductCard").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="aspect-video w-full rounded-lg" />,
})

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

interface ProductsSectionProps {
  homepageContent: any
  products: Product[]
  loading: boolean
}

export default function ProductsSection({ homepageContent, products, loading }: ProductsSectionProps) {
  const productsRef = useRef(null)
  const productsInView = useInView(productsRef, { once: true, amount: 0.2 })

  return (
    <section ref={productsRef} className="py-20 sm:py-28 relative z-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial="hidden"
          animate={productsInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInDown}>
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Our Products
            </Badge>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mb-4"
            variants={fadeInUp}
          >
            {homepageContent?.products?.sectionTitle ||
              "Featured Optimization Software"}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            variants={fadeInUp}
          >
            {homepageContent?.products?.subtitle ||
              "Choose from our range of powerful PC optimization tools"}
          </motion.p>
        </motion.div>
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
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg text-muted-foreground">
              No products found
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
              >
                <ProductCard product={product} priority={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

