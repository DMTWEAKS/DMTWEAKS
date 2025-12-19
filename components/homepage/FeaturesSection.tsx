'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Zap, Cpu, HardDrive, Shield, TrendingUp, Clock } from 'lucide-react'
import { defaultHomepageContent } from '@/lib/homepage-content'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

interface FeaturesSectionProps {
  homepageContent: any
}

export default function FeaturesSection({ homepageContent }: FeaturesSectionProps) {
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={featuresRef}
      className="py-20 sm:py-28 relative overflow-hidden z-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mb-4"
            variants={fadeInUp}
          >
            {homepageContent?.whyChoose?.sectionTitle ||
              "Why Choose Our PC Optimization Software?"}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            variants={fadeInUp}
          >
            {homepageContent?.whyChoose?.subtitle ||
              "Everything you need to keep your computer running at peak performance"}
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {((homepageContent?.whyChoose?.features && homepageContent.whyChoose.features.length > 0) 
            ? homepageContent.whyChoose.features 
            : defaultHomepageContent.whyChoose.features)
            .slice(0, 6)
            .map((feature: any, index: number) => {
              const iconMap: Record<number, any> = {
                0: Zap,
                1: Cpu,
                2: HardDrive,
                3: Shield,
                4: TrendingUp,
                5: Clock,
              }
              const colorMap: Record<number, string> = {
                0: "text-yellow-500",
                1: "text-blue-500",
                2: "text-green-500",
                3: "text-red-500",
                4: "text-purple-500",
                5: "text-orange-500",
              }
              const bgColorMap: Record<number, string> = {
                0: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
                1: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
                2: "from-green-500/10 to-green-500/5 border-green-500/20",
                3: "from-red-500/10 to-red-500/5 border-red-500/20",
                4: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                5: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
              }
              const Icon = iconMap[index] || Zap
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card
                    className={`p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border bg-gradient-to-br ${
                      bgColorMap[index] || "from-primary/10 to-primary/5 border-primary/20"
                    } relative group overflow-hidden hover:scale-[1.02]`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <div className={`${colorMap[index] || "text-primary"} mb-5 relative inline-block`}>
                        <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 group-hover:border-primary/30 transition-all duration-300">
                          <Icon
                            className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
        </motion.div>
      </div>
    </section>
  )
}

