"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/storefront";
import { useStorefront } from "@/contexts/StorefrontContext";
import { useState, useCallback, memo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Loader2 } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, customerToken, buyNow } = useStorefront();
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!customerToken) {
        toast.info("Please login to add items to cart");
        router.push("/store/login");
        return;
      }

      setAdding(true);
      try {
        await addToCart(product.id, 1);
        toast.success("Added to cart!");
      } catch (error: any) {
        toast.error(error.message || "Failed to add to cart");
      } finally {
        setAdding(false);
      }
    },
    [customerToken, product.id, addToCart, router]
  );

  const handleBuyNow = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!customerToken) {
        toast.info("Please login to purchase");
        router.push("/store/login");
        return;
      }

      setBuying(true);
      try {
        await buyNow(product.id, 1);
        toast.success("Opening checkout...");
      } catch (error: any) {
        toast.error(error.message || "Failed to checkout");
      } finally {
        setBuying(false);
      }
    },
    [customerToken, product.id, buyNow, router]
  );

  if (!product.id) {
    return null;
  }

  const handleCardClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <Card className="group flex h-full flex-col overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex flex-col cursor-pointer" onClick={handleCardClick}>
          <div className="block relative z-10">
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                  loading={priority ? "eager" : "lazy"}
                  priority={priority}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 transition-transform duration-300 group-hover:scale-110" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              {product.stock !== undefined && (
                <div
                  className="absolute top-3 right-3 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant={product.stock === null || product.stock > 0 ? "default" : "destructive"}
                    className="bg-background/90 backdrop-blur-sm text-foreground font-semibold shadow-lg border border-border/50 cursor-default"
                  >
                    {product.stock === null
                      ? "Unlimited"
                      : product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <CardHeader className="flex-1 space-y-3 pb-4 px-6 pt-6 relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="line-clamp-2 text-xl font-bold leading-tight transition-colors group-hover:text-primary">
                  {product.name}
                </h3>
              </div>
            </div>
            {product.description && (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.description.replace(/<[^>]*>/g, "").substring(0, 120)}
                {product.description.length > 120 ? "..." : ""}
              </p>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.slice(0, 2).map((tag, index) => {
                  const tagObj = tag as any;
                  const tagName =
                    typeof tag === "string"
                      ? tag
                      : tagObj?.name ||
                        tagObj?.slug ||
                        tagObj?.id ||
                        String(tag);
                  const tagKey =
                    typeof tag === "string"
                      ? tag
                      : tagObj?.id || tagObj?.slug || index;
                  return (
                    <Badge
                      key={tagKey}
                      variant="secondary"
                      className="text-xs font-medium bg-muted/60 border border-border/50"
                    >
                      {tagName}
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardHeader>
        </div>
        <CardContent className="pb-4 px-6 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              $ {product.price.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter
          className="flex gap-3 pt-0 px-6 pb-6 relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {product.stock !== undefined && product.stock !== null && product.stock === 0 ? (
            <Button
              disabled
              className="w-full bg-muted/50 text-muted-foreground font-semibold cursor-not-allowed border border-border/50"
              size="default"
            >
              Out of Stock
            </Button>
          ) : (
            <>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!customerToken) {
                    toast.info("Please login to purchase");
                    router.push("/store/login");
                    return;
                  }
                  handleBuyNow(e as any);
                }}
                disabled={buying}
                className="flex-1 bg-gradient-to-r from-primary to-blue-500 font-semibold shadow-lg transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
                size="default"
              >
                {buying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Buy Now"
                )}
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!customerToken) {
                    toast.info("Please login to add items to cart");
                    router.push("/store/login");
                    return;
                  }
                  handleAddToCart(e as any);
                }}
                disabled={adding}
                variant="outline"
                size="default"
                className="flex-1 border-2 border-border/50 font-medium hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </>
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          {product.description && (
            <div className="prose prose-invert max-w-none">
              <div
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitize(product.description),
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(ProductCard);
