"use client";

import { useEffect, useState, useCallback } from "react";
import { Product, Tag } from "@/lib/storefront";
import { defaultHomepageContent } from "@/lib/homepage-content";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import HeroSection from "@/components/homepage/HeroSection";
import ProductsSection from "@/components/homepage/ProductsSection";
import GamingPCSection from "@/components/homepage/GamingPCSection";
import PerformanceSection from "@/components/homepage/PerformanceSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import BenefitsSection from "@/components/homepage/BenefitsSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";
import { logger } from "@/lib/logger";

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [homepageContent, setHomepageContent] = useState<any>(defaultHomepageContent);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedTag
        ? `/api/storefront/products?tag=${selectedTag}`
        : "/api/storefront/products";
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setAllProducts(result.data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetch("/api/storefront/store")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStore(result.data);
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch store:", error);
      });

    fetch("/api/storefront/tags")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setTags(result.data);
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch tags:", error);
      });

    fetch("/api/admin/homepage-content")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setHomepageContent(result.data);
        } else {
          logger.error("Failed to fetch homepage content:", result.error);
          setHomepageContent(defaultHomepageContent);
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch homepage content:", error);
        setHomepageContent(defaultHomepageContent);
      });

    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (
      homepageContent?.products?.featuredProductIds &&
      allProducts.length > 0
    ) {
      const featuredIds = homepageContent.products.featuredProductIds;
      if (featuredIds.length > 0) {
        setProducts(
          allProducts.filter((p) => featuredIds.includes(p.id)).slice(0, 8)
        );
      } else {
        setProducts(allProducts.slice(0, 8));
      }
    } else if (allProducts.length > 0) {
      setProducts(allProducts.slice(0, 8));
    }
  }, [allProducts, homepageContent]);

  return (
    <div>
      <Header />
      <main className="relative">
        {/* Background decoration - animated dots */}
        {/* TODO: Consider making this configurable or removing for better performance */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(30)].map((_, i) => {
            const positions = [
              { left: 5, top: 10, delay: 0.1, duration: 2.5 },
              { left: 10, top: 15, delay: 0.2, duration: 2.5 },
              { left: 15, top: 25, delay: 0.3, duration: 2.9 },
              { left: 20, top: 35, delay: 0.4, duration: 2.8 },
              { left: 25, top: 30, delay: 0.5, duration: 3.0 },
              { left: 30, top: 45, delay: 0.6, duration: 3.1 },
              { left: 35, top: 20, delay: 0.7, duration: 3.0 },
              { left: 40, top: 20, delay: 0.8, duration: 2.2 },
              { left: 45, top: 55, delay: 0.9, duration: 2.4 },
              { left: 50, top: 65, delay: 1.0, duration: 2.5 },
              { left: 55, top: 45, delay: 1.1, duration: 2.8 },
              { left: 60, top: 65, delay: 1.2, duration: 2.7 },
              { left: 65, top: 5, delay: 1.3, duration: 2.9 },
              { left: 70, top: 35, delay: 1.4, duration: 3.2 },
              { left: 75, top: 50, delay: 1.5, duration: 3.3 },
              { left: 80, top: 85, delay: 1.6, duration: 3.2 },
              { left: 85, top: 25, delay: 1.7, duration: 2.6 },
              { left: 90, top: 40, delay: 1.8, duration: 2.3 },
              { left: 95, top: 15, delay: 1.9, duration: 2.4 },
              { left: 12, top: 90, delay: 0.5, duration: 3.1 },
              { left: 18, top: 75, delay: 0.6, duration: 2.8 },
              { left: 22, top: 50, delay: 0.7, duration: 3.0 },
              { left: 28, top: 60, delay: 0.8, duration: 2.6 },
              { left: 32, top: 80, delay: 0.9, duration: 2.9 },
              { left: 38, top: 30, delay: 1.0, duration: 2.7 },
              { left: 42, top: 70, delay: 1.1, duration: 3.1 },
              { left: 48, top: 40, delay: 1.2, duration: 2.5 },
              { left: 52, top: 55, delay: 1.3, duration: 2.8 },
              { left: 58, top: 15, delay: 1.4, duration: 3.0 },
              { left: 62, top: 75, delay: 1.5, duration: 2.6 },
            ];
            const pos = positions[i % positions.length];
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animation: `pulse ${pos.duration}s ease-in-out infinite`,
                  animationDelay: `${pos.delay}s`,
                }}
              />
            );
          })}
        </div>
        
        <HeroSection homepageContent={homepageContent} />
        <ProductsSection homepageContent={homepageContent} products={products} loading={loading} />
        <GamingPCSection homepageContent={homepageContent} />
        <PerformanceSection homepageContent={homepageContent} />
        <FeaturesSection homepageContent={homepageContent} />
        <BenefitsSection homepageContent={homepageContent} />
        <TestimonialsSection homepageContent={homepageContent} />
      </main>
      <Footer />
    </div>
  );
}
