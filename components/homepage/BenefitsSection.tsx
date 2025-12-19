'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, Gauge, HardDrive, Shield, Lock } from 'lucide-react'
import { defaultHomepageContent } from '@/lib/homepage-content'

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

interface BenefitsSectionProps {
  homepageContent: any
}

export default function BenefitsSection({ homepageContent }: BenefitsSectionProps) {
  const benefitsRef = useRef(null)
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={benefitsRef}
      className="py-20 sm:py-28 relative overflow-hidden z-10 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInDown}>
              <Badge className="mb-4 px-3 py-1">
                {homepageContent?.benefits?.badgeText || "Key Benefits"}
              </Badge>
            </motion.div>
            <motion.h2
              className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mb-6"
              variants={fadeInUp}
            >
              {homepageContent?.benefits?.title ||
                "Transform Your PC Experience"}
            </motion.h2>
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
            >
              {((homepageContent?.benefits?.benefits && homepageContent.benefits.benefits.length > 0)
                ? homepageContent.benefits.benefits
                : defaultHomepageContent.benefits.benefits).map(
                (benefit: string, index: number) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 group/item"
                    variants={staggerItem}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-6 w-6 text-primary relative z-10 group-hover/item:scale-110 transition-transform" />
                      <CheckCircle2 className="h-6 w-6 text-primary absolute inset-0 blur-md opacity-50" />
                    </div>
                    <p className="text-lg text-foreground group-hover/item:text-primary transition-colors">
                      {benefit}
                    </p>
                  </motion.div>
                )
              )}
            </motion.div>
            <motion.div
              className="mt-8"
              variants={fadeInUp}
            >
              <Button asChild size="lg" className="text-base">
                <Link
                  href={homepageContent?.benefits?.buttonLink || "/store"}
                  className="flex items-center gap-2"
                >
                  {homepageContent?.benefits?.buttonText ||
                    "Get Started Now"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {((homepageContent?.benefits?.statCards && homepageContent.benefits.statCards.length > 0)
              ? homepageContent.benefits.statCards
              : defaultHomepageContent.benefits.statCards)
              .slice(0, 4)
              .map((card: any, index: number) => {
                const iconMap: Record<number, any> = {
                  0: Gauge,
                  1: HardDrive,
                  2: Shield,
                  3: Lock,
                }
                const colorMap: Record<number, string> = {
                  0: "text-primary",
                  1: "text-blue-500",
                  2: "text-green-500",
                  3: "text-purple-500",
                }
                const bgColorMap: Record<number, string> = {
                  0: "from-primary/10 to-primary/5 border-primary/20",
                  1: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
                  2: "from-green-500/10 to-green-500/5 border-green-500/20",
                  3: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                }
                const Icon = iconMap[index] || Gauge
                return (
                  <motion.div key={index} variants={staggerItem}>
                    <Card
                      className={`p-6 bg-gradient-to-br ${
                        bgColorMap[index] ||
                        "from-primary/10 to-primary/5 border-primary/20"
                      } relative group overflow-hidden hover:scale-105 transition-transform duration-300`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          bgColorMap[index] || "from-primary/10 to-primary/5"
                        } opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}
                      />

                      <div className="relative z-10">
                        <div className="relative inline-block mb-3">
                          <Icon
                            className={`h-8 w-8 ${
                              colorMap[index] || "text-primary"
                            } relative z-10 group-hover:scale-110 transition-transform`}
                          />
                          <Icon
                            className={`h-8 w-8 ${
                              colorMap[index] || "text-primary"
                            } absolute inset-0 blur-lg opacity-50`}
                          />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform">
                          {card.value}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {card.label}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

