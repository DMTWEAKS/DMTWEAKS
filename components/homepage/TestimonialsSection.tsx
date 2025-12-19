'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
}

interface TestimonialsSectionProps {
  homepageContent: any
}

export default function TestimonialsSection({ homepageContent }: TestimonialsSectionProps) {
  const testimonialsRef = useRef(null)
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 })

  return (
    <section ref={testimonialsRef} className="py-20 sm:py-28 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial="hidden"
          animate={testimonialsInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          <motion.h2
            className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mb-4 relative"
            variants={fadeInUp}
          >
            <span className="relative z-10">
              {homepageContent?.testimonials?.sectionTitle ||
                "Trusted by Millions"}
            </span>
            <span className="absolute inset-0 text-primary/20 blur-2xl">
              {homepageContent?.testimonials?.sectionTitle ||
                "Trusted by Millions"}
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            variants={fadeInUp}
          >
            {homepageContent?.testimonials?.subtitle ||
              "See what our users are saying about their experience"}
          </motion.p>
        </motion.div>
        <motion.div
          className="relative overflow-hidden"
          initial="hidden"
          animate={testimonialsInView ? "visible" : "hidden"}
          variants={fadeInScale}
        >
          <div className="flex animate-marquee gap-6">
            {[...Array(2)].map((_, duplicateIndex) => (
              <div key={duplicateIndex} className="flex gap-6 flex-shrink-0">
                {(homepageContent?.testimonials?.testimonials || [])
                  .slice(0, 3)
                  .map((testimonial: any, index: number) => (
                    <Card
                      key={`${duplicateIndex}-${index}`}
                      className="p-6 border-2 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 hover:border-primary/50 transition-all relative group overflow-hidden hover:shadow-xl hover:shadow-primary/10 min-w-[320px] max-w-[320px] hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10">
                        <div className="flex gap-1 mb-5">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-yellow-500 text-yellow-500 group-hover:scale-110 transition-transform duration-300"
                              style={{ transitionDelay: `${i * 50}ms` }}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-5 italic leading-relaxed group-hover:text-foreground transition-colors">
                          "{testimonial.content}"
                        </p>
                        <div className="pt-4 border-t border-border/50">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

