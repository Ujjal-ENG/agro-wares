import { VariantPicker } from "@/components/ecommerce/VariantPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { getProductBySlug } from "@/data/mockDatabase";
import { useToast } from "@/hooks/use-toast";
import { useVariantPicker } from "@/hooks/useVariantPicker";
import { getFlashSalePrice, isFlashSaleActive } from "@/types/ecommerce";
import { ArrowLeft, Check, ShoppingCart, X, Zap, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const product = slug ? getProductBySlug(slug) : undefined;

  const {
    selection,
    setSelection,
    selectedVariant,
    disabledOptions,
    isComplete,
  } = useVariantPicker(
    product?.variantMatrix || { axes: [] },
    product?.variants || []
  );

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  // Flash sale logic
  const flashSaleActive = isFlashSaleActive(product.flashSale);
  
  // Determine if this is a simple product (no variants)
  const isSimpleProduct = !product.hasVariants;

  // Get the appropriate original price
  const getOriginalPrice = (): number | null => {
    if (isSimpleProduct) {
      return product.basePrice ?? product.minPrice;
    }
    if (selectedVariant) {
      return selectedVariant.price;
    }
    if (product.minPrice === product.maxPrice) {
      return product.minPrice;
    }
    return null;
  };

  const originalPrice = getOriginalPrice();
  const flashPrice = flashSaleActive && originalPrice ? getFlashSalePrice(originalPrice, product.flashSale) : null;

  // Stock info
  const currentStock = isSimpleProduct 
    ? (product.baseStock ?? 0) 
    : (selectedVariant?.stock ?? null);
  
  const currentSku = isSimpleProduct 
    ? product.baseSku 
    : selectedVariant?.sku;

  // Cart handling
  const handleAddToCart = () => {
    const priceToUse = flashPrice ?? originalPrice;
    
    if (isSimpleProduct) {
      // Simple product - no variant selection needed
      addToCart({
        productId: product._id,
        productName: product.name,
        productImage: product.defaultImage,
        variant: {
          combo: {},
          sku: product.baseSku || product._id,
          price: priceToUse || product.basePrice || product.minPrice,
          stock: product.baseStock || 0,
          images: [],
        },
        selection: {},
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} - ${formatPrice(priceToUse || product.basePrice || product.minPrice)}`,
      });
    } else if (selectedVariant) {
      // Variant product
      addToCart({
        productId: product._id,
        productName: product.name,
        productImage: product.defaultImage,
        variant: {
          ...selectedVariant,
          price: priceToUse || selectedVariant.price,
        },
        selection: { ...selection },
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} (${Object.values(selection).join(", ")}) - ${formatPrice(priceToUse || selectedVariant.price)}`,
      });
    }
  };

  // Button state
  const canAddToCart = isSimpleProduct 
    ? (currentStock ?? 0) > 0
    : isComplete && selectedVariant && selectedVariant.stock > 0;

  const buttonText = isSimpleProduct
    ? (currentStock ?? 0) > 0 ? "Add to Cart" : "Out of Stock"
    : !isComplete
    ? "Select Options"
    : selectedVariant?.stock === 0
    ? "Out of Stock"
    : "Add to Cart";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            MultiMart
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {flashSaleActive && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 gap-1 text-sm px-3 py-1">
                  <Zap className="h-4 w-4" />
                  {product.flashSale?.discountType === "percentage" 
                    ? `${product.flashSale.discountValue}% OFF`
                    : `$${product.flashSale?.discountValue} OFF`
                  }
                </Badge>
              </div>
            )}
            <img
              src={product.defaultImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{product.vendorName}</p>
              <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            </div>

            {/* Price Display */}
            <div className="flex items-center gap-4 flex-wrap">
              {flashSaleActive && flashPrice !== null && originalPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-destructive">
                    {formatPrice(flashPrice)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                </div>
              ) : originalPrice !== null ? (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(originalPrice)}
                </span>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.minPrice)} - {formatPrice(product.maxPrice)}
                </span>
              )}

              {/* Stock Badge */}
              {currentStock !== null && (
                <Badge
                  variant={currentStock > 0 ? "default" : "destructive"}
                >
                  {currentStock > 0 ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      In Stock ({currentStock})
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3 w-3" />
                      Out of Stock
                    </>
                  )}
                </Badge>
              )}
            </div>

            {/* Flash Sale Timer Info */}
            {flashSaleActive && product.flashSale && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-500/10 rounded-lg p-3">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>
                  Flash sale ends: {new Date(product.flashSale.endDate).toLocaleDateString()} at {new Date(product.flashSale.endDate).toLocaleTimeString()}
                </span>
                {product.flashSale.stockLimit && (
                  <span className="ml-auto text-yellow-700 font-medium">
                    {product.flashSale.stockLimit - (product.flashSale.soldCount ?? 0)} left at this price
                  </span>
                )}
              </div>
            )}

            <p className="text-muted-foreground">{product.description}</p>

            <Separator />

            {/* Variant Picker - Only for products with variants */}
            {!isSimpleProduct && (
              <VariantPicker
                matrix={product.variantMatrix}
                variants={product.variants}
                selection={selection}
                disabledOptions={disabledOptions}
                onSelect={setSelection}
              />
            )}

            {currentSku && (
              <p className="text-sm text-muted-foreground">
                SKU: {currentSku}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {buttonText}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
