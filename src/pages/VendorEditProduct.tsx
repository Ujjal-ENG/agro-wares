import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getAllCategories,
  getSubcategoriesByCategoryId,
  getSubcategoryById,
  updateProduct,
} from "@/data/mockDatabase";
import { vendors, products } from "@/data/mockData";
import type { ProductVariant, FlashSale } from "@/types/ecommerce";

export default function VendorEditProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentVendor = vendors[0];

  // Find the product
  const existingProduct = useMemo(() => {
    return products.find((p) => p.slug === slug && p.vendorId === currentVendor._id);
  }, [slug, currentVendor._id]);

  const allCategories = getAllCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  const subcategoriesForCategory = useMemo(
    () => (selectedCategoryId ? getSubcategoriesByCategoryId(selectedCategoryId) : []),
    [selectedCategoryId]
  );

  const selectedSubcategory = useMemo(
    () => (selectedSubcategoryId ? getSubcategoryById(selectedSubcategoryId) : undefined),
    [selectedSubcategoryId]
  );

  const variantMatrix = selectedSubcategory?.variantMatrix;
  const hasVariantAxes = variantMatrix && variantMatrix.axes.length > 0;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultImage, setDefaultImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Simple product state (no variants)
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(0);
  const [baseSku, setBaseSku] = useState("");

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Flash Sale state
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(false);
  const [flashSaleDiscountType, setFlashSaleDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [flashSaleDiscountValue, setFlashSaleDiscountValue] = useState<number>(0);
  const [flashSaleStartDate, setFlashSaleStartDate] = useState("");
  const [flashSaleEndDate, setFlashSaleEndDate] = useState("");
  const [flashSaleStockLimit, setFlashSaleStockLimit] = useState<number | undefined>(undefined);
  const [flashSaleSoldCount, setFlashSaleSoldCount] = useState<number>(0);

  // Load existing product data
  useEffect(() => {
    if (existingProduct) {
      setSelectedCategoryId(existingProduct.categoryId);
      setSelectedSubcategoryId(existingProduct.subcategoryId);
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setDefaultImage(existingProduct.defaultImage);
      setSeoTitle(existingProduct.seo.title);
      setSeoDescription(existingProduct.seo.description);
      setSeoKeywords(existingProduct.seo.keywords.join(", "));
      setVariants([...existingProduct.variants]);
      
      // Load simple product fields
      setBasePrice(existingProduct.basePrice ?? 0);
      setBaseStock(existingProduct.baseStock ?? 0);
      setBaseSku(existingProduct.baseSku ?? "");

      // Load flash sale data
      if (existingProduct.flashSale) {
        setFlashSaleEnabled(existingProduct.flashSale.isActive);
        setFlashSaleDiscountType(existingProduct.flashSale.discountType);
        setFlashSaleDiscountValue(existingProduct.flashSale.discountValue);
        const formatDate = (d: Date) => {
          const date = new Date(d);
          return date.toISOString().slice(0, 16);
        };
        setFlashSaleStartDate(formatDate(existingProduct.flashSale.startDate));
        setFlashSaleEndDate(formatDate(existingProduct.flashSale.endDate));
        setFlashSaleStockLimit(existingProduct.flashSale.stockLimit);
        setFlashSaleSoldCount(existingProduct.flashSale.soldCount ?? 0);
      }
    }
  }, [existingProduct]);

  if (!existingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Link to="/vendor" className="mt-4 inline-block text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const addVariant = () => {
    if (!variantMatrix) return;
    const emptyCombo: Record<string, string> = {};
    variantMatrix.axes.forEach((axis) => {
      emptyCombo[axis.key] = axis.values[0] || "";
    });
    setVariants([
      ...variants,
      { combo: emptyCombo, sku: "", price: 0, stock: 0, images: [] },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: unknown) => {
    const updated = [...variants];
    if (field === "combo") {
      updated[index].combo = value as Record<string, string>;
    } else if (field === "price" || field === "stock") {
      updated[index][field] = Number(value);
    } else if (field === "sku") {
      updated[index].sku = value as string;
    }
    setVariants(updated);
  };

  const updateVariantCombo = (index: number, key: string, value: string) => {
    const updated = [...variants];
    updated[index].combo = { ...updated[index].combo, [key]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasVariants = existingProduct.hasVariants;

    if (!name) {
      toast({
        title: "Validation Error",
        description: "Please fill in the product name.",
        variant: "destructive",
      });
      return;
    }

    if (hasVariants && variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one variant.",
        variant: "destructive",
      });
      return;
    }

    if (!hasVariants && basePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please set a valid price for the product.",
        variant: "destructive",
      });
      return;
    }

    const prices = hasVariants ? variants.map((v) => v.price) : [basePrice];
    const totalStock = hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : baseStock;
    const variantValues: Record<string, string[]> = {};

    if (hasVariants && variantMatrix) {
      variantMatrix.axes.forEach((axis) => {
        const uniqueValues = [...new Set(variants.map((v) => v.combo[axis.key]))];
        variantValues[axis.key] = uniqueValues;
      });
    }

    // Build flash sale object
    let flashSale: FlashSale | undefined;
    if (flashSaleEnabled && flashSaleStartDate && flashSaleEndDate && flashSaleDiscountValue > 0) {
      flashSale = {
        isActive: true,
        discountType: flashSaleDiscountType,
        discountValue: flashSaleDiscountValue,
        startDate: new Date(flashSaleStartDate),
        endDate: new Date(flashSaleEndDate),
        stockLimit: flashSaleStockLimit,
        soldCount: flashSaleSoldCount,
      };
    }

    updateProduct(existingProduct._id, currentVendor._id, {
      name,
      description,
      seo: {
        title: seoTitle || name,
        description: seoDescription || description.substring(0, 160),
        keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
      defaultImage: defaultImage || existingProduct.defaultImage,
      basePrice: hasVariants ? undefined : basePrice,
      baseStock: hasVariants ? undefined : baseStock,
      baseSku: hasVariants ? undefined : baseSku,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      totalStock,
      inStock: totalStock > 0,
      variants: hasVariants ? variants : [],
      variantValues,
      flashSale,
    });

    toast({
      title: "Product Updated",
      description: `"${name}" has been updated.`,
    });

    navigate("/vendor");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link to="/vendor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">{currentVendor.name}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategoryId} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Category cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select value={selectedSubcategoryId} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategoriesForCategory.map((sub) => (
                          <SelectItem key={sub._id} value={sub._id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Subcategory cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultImage">Default Image URL</Label>
                  <Input
                    id="defaultImage"
                    value={defaultImage}
                    onChange={(e) => setDefaultImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Simple Product Pricing (no variants) */}
            {!existingProduct.hasVariants && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input
                        value={baseSku}
                        onChange={(e) => setBaseSku(e.target.value)}
                        placeholder="PROD-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={baseStock}
                        onChange={(e) => setBaseStock(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Variants */}
            {existingProduct.hasVariants && hasVariantAxes && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Variants</CardTitle>
                  <Button type="button" size="sm" onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </CardHeader>
                <CardContent>
                  {variants.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No variants. Click "Add Variant" to create one.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant, idx) => (
                        <div key={idx} className="rounded-lg border p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Variant {idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {variantMatrix!.axes.map((axis) => (
                              <div key={axis.key} className="space-y-2">
                                <Label>{axis.label}</Label>
                                <Select
                                  value={variant.combo[axis.key] || ""}
                                  onValueChange={(val) => updateVariantCombo(idx, axis.key, val)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {axis.values.map((val) => (
                                      <SelectItem key={val} value={val}>
                                        {val}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label>SKU</Label>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                placeholder="SKU-001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Price ($)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(idx, "price", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Stock</Label>
                              <Input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Flash Sale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Flash Sale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Flash Sale</Label>
                    <p className="text-sm text-muted-foreground">
                      Set a time-limited discount for this product
                    </p>
                  </div>
                  <Switch
                    checked={flashSaleEnabled}
                    onCheckedChange={setFlashSaleEnabled}
                  />
                </div>

                {flashSaleEnabled && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <Select
                          value={flashSaleDiscountType}
                          onValueChange={(val) => setFlashSaleDiscountType(val as "percentage" | "fixed")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Discount Value</Label>
                        <Input
                          type="number"
                          min="0"
                          step={flashSaleDiscountType === "percentage" ? "1" : "0.01"}
                          value={flashSaleDiscountValue}
                          onChange={(e) => setFlashSaleDiscountValue(Number(e.target.value))}
                          placeholder={flashSaleDiscountType === "percentage" ? "e.g., 20" : "e.g., 10.00"}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={flashSaleStartDate}
                          onChange={(e) => setFlashSaleStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={flashSaleEndDate}
                          onChange={(e) => setFlashSaleEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Stock Limit (Optional)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={flashSaleStockLimit ?? ""}
                          onChange={(e) => setFlashSaleStockLimit(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Leave empty for no limit"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum units available at flash sale price
                        </p>
                      </div>
                      {existingProduct.flashSale && (
                        <div className="space-y-2">
                          <Label>Sold Count</Label>
                          <Input
                            type="number"
                            min="0"
                            value={flashSaleSoldCount}
                            onChange={(e) => setFlashSaleSoldCount(Number(e.target.value))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Units sold at flash sale price
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Meta Title</Label>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="SEO description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Keywords (comma separated)</Label>
                  <Input
                    id="seoKeywords"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="keyword1, keyword2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  Update Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
