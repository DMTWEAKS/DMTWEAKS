export interface HomepageContent {
  hero: {
    badgeText: string
    titlePart1: string
    titleHighlighted: string
    description: string
    button1Text: string
    button1Link: string
    button2Text: string
    button2Link: string
  }
  stats: Array<{
    value: string
    suffix: string
    label: string
  }>
  whyChoose: {
    sectionTitle: string
    subtitle: string
    features: Array<{
      title: string
      description: string
      featureItems: string[]
    }>
  }
  howItWorks: {
    sectionTitle: string
    subtitle: string
    steps: Array<{
      stepNumber: string
      title: string
      description: string
    }>
  }
  benefits: {
    badgeText: string
    title: string
    benefits: string[]
    buttonText: string
    buttonLink: string
    statCards: Array<{
      value: string
      label: string
    }>
  }
  testimonials: {
    sectionTitle: string
    subtitle: string
    testimonials: Array<{
      name: string
      role: string
      content: string
      rating: number
    }>
  }
  products: {
    sectionTitle: string
    subtitle: string
    featuredProductIds: string[]
  }
  cta: {
    title: string
    description: string
    button1Text: string
    button1Link: string
    button2Text: string
    button2Link: string
  }
  gamingPC: {
    badgeText: string
    title: string
    description: string
    buttonText: string
    buttonLink: string
    stats: Array<{
      label: string
      value: string
      color: string
    }>
  }
  performance: {
    badgeText: string
    title: string
    description: string
    buttonText: string
    buttonLink: string
    fpsValue: string
    stabilityValue: string
    beforeFPS: string
    afterFPS: string
    beforeLabel: string
    afterLabel: string
  }
}

export const defaultHomepageContent: HomepageContent = {
  hero: {
    badgeText: "Professional PC Optimization Software",
    titlePart1: "Boost Your PC Performance",
    titleHighlighted: "Like Never Before",
    description: "Transform your slow, cluttered computer into a lightning-fast machine. Our advanced optimization tools clean, speed up, and protect your PC with just one click.",
    button1Text: "Get Started Now",
    button1Link: "/store",
    button2Text: "Browse Products",
    button2Link: "/store",
  },
  stats: [
    { value: "10x", suffix: "", label: "Faster Speed" },
    { value: "99%", suffix: "", label: "Satisfaction" },
    { value: "1M+", suffix: "", label: "Users" },
    { value: "24/7", suffix: "", label: "Support" },
  ],
  whyChoose: {
    sectionTitle: "Why Choose Our PC Optimization Software?",
    subtitle: "Everything you need to keep your computer running at peak performance",
    features: [
      {
        title: "Lightning Fast Speed",
        description: "Boost your PC performance by up to 10x with advanced optimization algorithms that clean and optimize your system in real-time.",
        featureItems: ["Advanced algorithms", "Real-time optimization", "10x performance boost"],
      },
      {
        title: "CPU & RAM Optimization",
        description: "Intelligently manage system resources to free up memory and reduce CPU usage, giving you more power for what matters.",
        featureItems: ["Memory management", "CPU optimization", "Resource allocation"],
      },
      {
        title: "Deep Disk Cleanup",
        description: "Remove junk files, temporary data, and unnecessary clutter to free up gigabytes of valuable storage space.",
        featureItems: ["Junk file removal", "Temporary data cleanup", "Storage optimization"],
      },
      {
        title: "Advanced Security",
        description: "Protect your PC from malware, viruses, and threats with built-in security features and real-time protection.",
        featureItems: ["Malware protection", "Real-time scanning", "Threat detection"],
      },
      {
        title: "Performance Monitoring",
        description: "Track your system health with detailed analytics and get recommendations for optimal performance.",
        featureItems: ["System analytics", "Health monitoring", "Performance recommendations"],
      },
      {
        title: "One-Click Optimization",
        description: "Automate maintenance tasks with scheduled scans and optimizations that run in the background.",
        featureItems: ["Automated tasks", "Scheduled scans", "Background optimization"],
      },
    ],
  },
  howItWorks: {
    sectionTitle: "How It Works",
    subtitle: "Get started in minutes and see results immediately",
    steps: [
      {
        stepNumber: "01",
        title: "Download & Install",
        description: "Download our lightweight software and install it in under 2 minutes. No technical knowledge required.",
      },
      {
        stepNumber: "02",
        title: "Run Quick Scan",
        description: "Launch the software and run a comprehensive scan to identify issues, junk files, and optimization opportunities.",
      },
      {
        stepNumber: "03",
        title: "Optimize & Enjoy",
        description: "Click optimize and watch your PC transform. Enjoy faster boot times, smoother performance, and more storage.",
      },
    ],
  },
  benefits: {
    badgeText: "Key Benefits",
    title: "Transform Your PC Experience",
    benefits: [
      "Free up to 50GB of disk space instantly",
      "Reduce boot time by up to 70%",
      "Improve gaming performance and FPS",
      "Extend your PC lifespan",
      "Protect against malware and threats",
      "Automate maintenance tasks",
    ],
    buttonText: "Get Started Now",
    buttonLink: "/store",
    statCards: [
      { value: "10x", label: "Faster Performance" },
      { value: "50GB+", label: "Space Freed" },
      { value: "100%", label: "Secure & Safe" },
      { value: "24/7", label: "Protection" },
    ],
  },
  testimonials: {
    sectionTitle: "Trusted by Millions",
    subtitle: "See what our users are saying about their experience",
    testimonials: [
      {
        name: "Alex Johnson",
        role: "Gamer",
        content: "My gaming PC was lagging so much. After using this software, my FPS increased by 40% and games run buttery smooth now!",
        rating: 5,
      },
      {
        name: "Sarah Chen",
        role: "Content Creator",
        content: "Freed up 60GB of space and my video editing software runs 3x faster. This is a game-changer for my workflow!",
        rating: 5,
      },
      {
        name: "Michael Rodriguez",
        role: "Business Owner",
        content: "All our office PCs are now optimized. Boot time went from 5 minutes to 30 seconds. Incredible results!",
        rating: 5,
      },
    ],
  },
  products: {
    sectionTitle: "Featured Optimization Software",
    subtitle: "Choose from our range of powerful PC optimization tools",
    featuredProductIds: [],
  },
  cta: {
    title: "Ready to Optimize Your PC?",
    description: "Join millions of satisfied users who have transformed their PC experience. Download now and see the difference in minutes.",
    button1Text: "Browse All Products",
    button1Link: "/store",
    button2Text: "Learn More",
    button2Link: "/store",
  },
  gamingPC: {
    badgeText: "Gaming PC Optimized",
    title: "Built for Maximum Performance",
    description: "Experience the power of a fully optimized gaming rig. Our software works seamlessly with high-end hardware to deliver unmatched performance.",
    buttonText: "Explore Products",
    buttonLink: "/store",
    stats: [
      { label: "CPU Boost", value: "30%", color: "text-blue-500" },
      { label: "FPS Gain", value: "+45", color: "text-primary" },
      { label: "SSD Speed", value: "2x", color: "text-green-500" },
      { label: "Response", value: "Instant", color: "text-yellow-500" },
    ],
  },
  performance: {
    badgeText: "Performance Boost",
    title: "Boost Your FPS And Eliminate Stutters",
    description: "Stabilize performance, and maintain consistent FPS during gaming sessions.",
    buttonText: "Download for free",
    buttonLink: "/store",
    fpsValue: "120",
    stabilityValue: "99%",
    beforeFPS: "45-100 FPS",
    afterFPS: "115-120 FPS",
    beforeLabel: "Before (Unstable)",
    afterLabel: "After (Stable)",
  },
}

