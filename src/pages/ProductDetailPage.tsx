import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VariantPicker } from "@/components/ecommerce/VariantPicker";
import { useVariantPicker } from "@/hooks/useVariantPicker";
import { getProductBySlug } from "@/data/mockDatabase";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

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

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      productId: product._id,
      productName: product.name,
      productImage: product.defaultImage,
      variant: selectedVariant,
      selection: { ...selection },
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} (${Object.values(selection).join(", ")}) - ${formatPrice(selectedVariant.price)}`,
    });
  };

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.minPrice === product.maxPrice
    ? product.minPrice
    : null;

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
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
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

            <div className="flex items-center gap-4">
              {currentPrice ? (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.minPrice)} - {formatPrice(product.maxPrice)}
                </span>
              )}
              {selectedVariant && (
                <Badge
                  variant={selectedVariant.stock > 0 ? "default" : "destructive"}
                >
                  {selectedVariant.stock > 0 ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      In Stock ({selectedVariant.stock})
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

            <p className="text-muted-foreground">{product.description}</p>

            <Separator />

            {/* Dynamic Variant Picker */}
            <VariantPicker
              matrix={product.variantMatrix}
              variants={product.variants}
              selection={selection}
              disabledOptions={disabledOptions}
              onSelect={setSelection}
            />

            {selectedVariant && (
              <p className="text-sm text-muted-foreground">
                SKU: {selectedVariant.sku}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!isComplete || !selectedVariant || selectedVariant.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {!isComplete
                ? "Select Options"
                : selectedVariant?.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
