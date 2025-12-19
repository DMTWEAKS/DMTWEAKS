"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu, Gauge, HardDrive, Zap, Gamepad2, ArrowRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface GamingPCSectionProps {
  homepageContent: any;
}

export default function GamingPCSection({
  homepageContent,
}: GamingPCSectionProps) {
  const gamingPCRef = useRef(null);
  const gamingPCInView = useInView(gamingPCRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={gamingPCRef}
      className="py-20 sm:py-28 relative overflow-hidden z-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <motion.div
            className="relative order-2 lg:order-1"
            initial="hidden"
            animate={gamingPCInView ? "visible" : "hidden"}
            variants={fadeInScale}
          >
            <div className="relative rounded-lg overflow-hidden group">
                <video src="/PC.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"></video>
            </div>
          </motion.div>
          <motion.div
            className="space-y-6 order-1 lg:order-2 relative z-10"
            initial="hidden"
            animate={gamingPCInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInDown}>
              <Badge className="mb-4 px-3 py-1 flex items-center gap-2 w-fit">
                <Cpu className="h-3 w-3" />
                {homepageContent?.gamingPC?.badgeText || "Gaming PC Optimized"}
              </Badge>
            </motion.div>
            <motion.h2
              className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground"
              variants={fadeInUp}
            >
              {homepageContent?.gamingPC?.title ||
                "Built for Maximum Performance"}
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground"
              variants={fadeInUp}
            >
              {homepageContent?.gamingPC?.description ||
                "Experience the power of a fully optimized gaming rig. Our software works seamlessly with high-end hardware to deliver unmatched performance."}
            </motion.p>
            <motion.div
              className="grid grid-cols-2 gap-4 mt-6"
              variants={staggerContainer}
            >
              {(
                homepageContent?.gamingPC?.stats || [
                  { label: "CPU Boost", value: "30%", color: "text-blue-500" },
                  { label: "FPS Gain", value: "+45", color: "text-primary" },
                  { label: "SSD Speed", value: "2x", color: "text-green-500" },
                  {
                    label: "Response",
                    value: "Instant",
                    color: "text-yellow-500",
                  },
                ]
              ).map((stat: any, i: number) => {
                const iconMap: Record<number, any> = {
                  0: Cpu,
                  1: Gauge,
                  2: HardDrive,
                  3: Zap,
                };
                const Icon = iconMap[i] || Cpu;
                return (
                  <motion.div key={i} variants={staggerItem}>
                    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={stat.color || "text-primary"}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div
                            className={`text-2xl font-bold ${
                              stat.color || "text-primary"
                            } font-mono`}
                          >
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Button asChild size="lg" className="text-base px-8 mt-6">
                <Link
                  href={homepageContent?.gamingPC?.buttonLink || "/store"}
                  className="flex items-center gap-2"
                >
                  <Gamepad2 className="h-5 w-5" />
                  {homepageContent?.gamingPC?.buttonText || "Explore Products"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
