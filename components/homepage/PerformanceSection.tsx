'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gamepad2, Activity, Monitor, Download, ArrowRight } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
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

interface PerformanceSectionProps {
  homepageContent: any
}

export default function PerformanceSection({ homepageContent }: PerformanceSectionProps) {
  const performanceRef = useRef(null)
  const performanceInView = useInView(performanceRef, { once: true, amount: 0.2 })
  const [waveTime, setWaveTime] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !performanceInView) return
    
    let animationFrameId: number
    let lastTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        setWaveTime((prev) => prev + 0.02)
        lastTime = currentTime
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [mounted, performanceInView])

  const generateBeforePath = useCallback((time: number) => {
    const points: string[] = []
    const numPoints = 30
    for (let i = 0; i <= numPoints; i++) {
      const x = 20 + (i / numPoints) * 360
      const baseY = 100
      const amplitude = 40
      const y = baseY + 
        Math.sin((i / numPoints) * Math.PI * 3 + time * 2) * amplitude +
        Math.cos((i / numPoints) * Math.PI * 2 + time * 1.5) * 20 +
        Math.sin((i / numPoints) * Math.PI * 5 + time * 3) * 15
      points.push(`${i === 0 ? 'M' : 'L'} ${x},${y}`)
    }
    return points.join(' ')
  }, [])

  const generateAfterPath = useCallback((time: number) => {
    const points: string[] = []
    const numPoints = 30
    for (let i = 0; i <= numPoints; i++) {
      const x = 20 + (i / numPoints) * 360
      const baseY = 25
      const amplitude = 5
      const y = baseY + 
        Math.sin((i / numPoints) * Math.PI * 2 + time * 0.5) * amplitude +
        Math.cos((i / numPoints) * Math.PI * 1.5 + time * 0.3) * 3
      points.push(`${i === 0 ? 'M' : 'L'} ${x},${y}`)
    }
    return points.join(' ')
  }, [])

  const staticBeforePath = useMemo(() => generateBeforePath(0), [generateBeforePath])
  const staticAfterPath = useMemo(() => generateAfterPath(0), [generateAfterPath])
  
  const beforePath = mounted ? generateBeforePath(waveTime) : staticBeforePath
  const afterPath = mounted ? generateAfterPath(waveTime) : staticAfterPath

  return (
    <section ref={performanceRef} className="py-20 sm:py-28 relative overflow-hidden z-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <motion.div
            className="space-y-6 relative"
            initial="hidden"
            animate={performanceInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <motion.div variants={fadeInDown}>
                <Badge className="mb-4 px-3 py-1 flex items-center gap-2 w-fit">
                  <Gamepad2 className="h-3 w-3" />
                  {homepageContent?.performance?.badgeText || "Performance Boost"}
                </Badge>
              </motion.div>
              <motion.h2
                className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground relative"
                variants={fadeInUp}
              >
                <span className="relative z-10">{homepageContent?.performance?.title || "Boost Your FPS And Eliminate Stutters"}</span>
                <span className="absolute inset-0 text-primary/20 blur-2xl">{homepageContent?.performance?.title || "Boost Your FPS And Eliminate Stutters"}</span>
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground mt-4"
                variants={fadeInUp}
              >
                {homepageContent?.performance?.description || "Stabilize performance, and maintain consistent FPS during gaming sessions."}
              </motion.p>
              <motion.div
                className="mt-6 flex items-center gap-4 flex-wrap"
                variants={staggerContainer}
              >
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm"
                  variants={staggerItem}
                >
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Current FPS</div>
                    <div className="text-lg font-bold text-primary font-mono">{homepageContent?.performance?.fpsValue || "120"}</div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm"
                  variants={staggerItem}
                >
                  <Monitor className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Stability</div>
                    <div className="text-lg font-bold text-green-500 font-mono">{homepageContent?.performance?.stabilityValue || "99%"}</div>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Button asChild size="lg" className="text-base px-8 mt-6 group relative overflow-hidden">
                  <Link href={homepageContent?.performance?.buttonLink || "/store"} className="flex items-center gap-2 relative z-10">
                    <Download className="h-5 w-5 group-hover:animate-bounce" />
                    {homepageContent?.performance?.buttonText || "Download for free"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="relative"
            initial="hidden"
            animate={performanceInView ? "visible" : "hidden"}
            variants={fadeInScale}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 rounded-lg blur-2xl" />
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">FPS Performance</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground text-xs">Before</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground text-xs">After DM Tweaks</span>
                  </div>
                </div>
              </div>
              <div className="relative h-64 w-full">
                <svg
                  viewBox="0 0 400 200"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  suppressHydrationWarning
                >
                  <defs>
                    <linearGradient id="beforeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="afterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <g className="axis">
                    <line x1="20" y1="180" x2="380" y2="180" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="20" x2="20" y2="180" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
                    {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360].map((x) => (
                      <line key={x} x1={x} y1="175" x2={x} y2="180" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
                    ))}
                    {[40, 60, 80, 100, 120, 140, 160].map((y) => (
                      <line key={y} x1="15" y1={y} x2="20" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
                    ))}
                  </g>

                  <g className="before-line">
                    <path
                      id="beforePath"
                      d={beforePath}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                      opacity="0.8"
                      suppressHydrationWarning
                    />
                    <path
                      d={`${beforePath} L 380,180 L 20,180 Z`}
                      fill="url(#beforeGradient)"
                      suppressHydrationWarning
                    />
                  </g>

                  <g className="after-line">
                    <path
                      id="afterPath"
                      d={afterPath}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                      suppressHydrationWarning
                    />
                    <path
                      id="afterPathGlow"
                      d={afterPath}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.3"
                      suppressHydrationWarning
                    />
                    <path
                      d={`${afterPath} L 380,180 L 20,180 Z`}
                      fill="url(#afterGradient)"
                      suppressHydrationWarning
                    />
                  </g>
                </svg>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Time</span>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-semibold text-red-500">{homepageContent?.performance?.beforeFPS || "45-100 FPS"}</div>
                    <div>{homepageContent?.performance?.beforeLabel || "Before (Unstable)"}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">{homepageContent?.performance?.afterFPS || "115-120 FPS"}</div>
                    <div>{homepageContent?.performance?.afterLabel || "After (Stable)"}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

