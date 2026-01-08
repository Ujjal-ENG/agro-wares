import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import type { ProductCardDTO } from "@/types/ecommerce";
import { getFlashSalePrice, isFlashSaleActive } from "@/types/ecommerce";

interface ProductCardProps {
  product: ProductCardDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const flashSaleActive = isFlashSaleActive(product.flashSale);
  const displayPrice = product.hasVariants ? product.minPrice : (product.basePrice ?? product.minPrice);
  const flashPrice = flashSaleActive ? getFlashSalePrice(displayPrice, product.flashSale) : null;

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg relative">
        {/* Flash Sale Badge */}
        {flashSaleActive && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 gap-1">
              <Zap className="h-3 w-3" />
              {product.flashSale?.discountType === "percentage" 
                ? `${product.flashSale.discountValue}% OFF`
                : `$${product.flashSale?.discountValue} OFF`
              }
            </Badge>
          </div>
        )}
        
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.defaultImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{product.vendorName}</p>
          <h3 className="mt-1 font-semibold line-clamp-2">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm">
              {flashSaleActive && flashPrice !== null ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-destructive">
                    {formatPrice(flashPrice)}
                  </span>
                  <span className="text-muted-foreground line-through text-xs">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
              ) : product.minPrice === product.maxPrice ? (
                <span className="font-bold text-primary">
                  {formatPrice(product.minPrice)}
                </span>
              ) : (
                <span className="font-bold text-primary">
                  {formatPrice(product.minPrice)} - {formatPrice(product.maxPrice)}
                </span>
              )}
            </div>
            {!product.inStock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square animate-pulse bg-muted" />
      <CardContent className="p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-16 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
