'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const DISCORD_URL = 'https://discord.gg/PwxWSsZzUP'

interface CtaSectionProps {
  homepageContent: any
}

export default function CtaSection({ homepageContent }: CtaSectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const cta = homepageContent?.cta || {}

  return (
    <section ref={ref} className="pb-20 sm:pb-28 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto rounded-2xl border border-border bg-card px-6 py-12 sm:px-12 sm:py-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {cta.title || 'Not sure what to get?'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            {cta.description || "Ask in our Discord and we'll point you to the right product."}
          </p>
          <Button asChild size="lg" className="mt-8 text-base px-8">
            <Link href={cta.button1Link || DISCORD_URL}>
              {cta.button1Text || 'Join Discord'}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
