'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Download } from 'lucide-react'

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

interface HeroSectionProps {
  homepageContent: any
}

export default function HeroSection({ homepageContent }: HeroSectionProps) {
  return (
    <section className="min-h-screen relative overflow-hidden pt-20">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 50% 0%, black 70%, transparent 110%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 70% at 50% 0%, black 70%, transparent 110%)",
        }}
      />
      <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInDown}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              {homepageContent?.hero?.badgeText ||
                "Professional PC Optimization Software"}
            </Badge>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              {homepageContent?.hero?.titlePart1 ||
                "Boost Your PC Performance"}
            </span>
            <br />
            <span className="text-foreground">
              {homepageContent?.hero?.titleHighlighted ||
                "Like Never Before"}
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ ...fadeInUp, visible: { ...fadeInUp.visible, transition: { delay: 0.2 } } }}
          >
            {homepageContent?.hero?.description ||
              "Transform your slow, cluttered computer into a lightning-fast machine. Our advanced optimization tools clean, speed up, and protect your PC with just one click."}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={{ ...fadeInUp, visible: { ...fadeInUp.visible, transition: { delay: 0.3 } } }}
          >
            <Button asChild size="lg" className="text-base px-8">
              <Link
                href={homepageContent?.hero?.button1Link || "/store"}
                className="flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                {homepageContent?.hero?.button1Text || "Get Started Now"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8"
            >
              <Link href={homepageContent?.hero?.button2Link || "/store"}>
                {homepageContent?.hero?.button2Text || "Browse Products"}
              </Link>
            </Button>
          </motion.div>
          <motion.div
            className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {(homepageContent?.stats || [
              { value: "10x", suffix: "", label: "Faster Speed" },
              { value: "99%", suffix: "", label: "Satisfaction" },
              { value: "1M+", suffix: "", label: "Users" },
              { value: "24/7", suffix: "", label: "Support" },
            ]).map(
              (stat: any, index: number) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={staggerItem}
                >
                  <div className="text-3xl font-bold text-primary">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

