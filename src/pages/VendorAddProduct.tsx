import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getAllCategories,
  getSubcategoriesByCategoryId,
  createProduct,
} from "@/data/mockDatabase";
import type {
  Category,
  FlashSale,
  ProductAttribute,
  ProductVariant,
  Subcategory,
  VariantCombo,
} from "@/types/ecommerce";
import { ArrowLeft, Plus, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VendorAddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data
  const allCategories = getAllCategories();

  // Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [defaultImage, setDefaultImage] = useState("/placeholder.svg");

  // Product attributes (specifications)
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Simple product pricing (when no variants)
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(0);
  const [baseSku, setBaseSku] = useState("");

  // Variants (when subcategory has variant matrix)
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Flash sale
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(false);
  const [flashSale, setFlashSale] = useState<{
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    stockLimit?: number;
  }>({
    discountType: "percentage",
    discountValue: 10,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Derived state - check if subcategory has any variant axes with values
  const hasVariants = selectedSubcategory?.variantMatrix?.axes?.some(
    (axis) => axis.values.length > 0
  ) ?? false;
  const variantMatrix = selectedSubcategory?.variantMatrix;

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const subs = getSubcategoriesByCategoryId(selectedCategory._id);
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  // Initialize attributes when subcategory changes
  useEffect(() => {
    if (selectedSubcategory?.attributeTemplates) {
      setAttributes(
        selectedSubcategory.attributeTemplates.map((template) => ({
          key: template.key,
          value: template.type === "select" && template.options ? template.options[0] : "",
        }))
      );
    } else {
      setAttributes([]);
    }
  }, [selectedSubcategory]);

  // Initialize variants when subcategory with variant matrix is selected
  useEffect(() => {
    if (hasVariants && variantMatrix) {
      const generateCombos = (
        axes: typeof variantMatrix.axes,
        index = 0,
        current: VariantCombo = {}
      ): VariantCombo[] => {
        if (index === axes.length) return [current];
        const axis = axes[index];
        if (!axis.values.length) return generateCombos(axes, index + 1, current);
        const results: VariantCombo[] = [];
        for (const value of axis.values) {
          results.push(
            ...generateCombos(axes, index + 1, { ...current, [axis.key]: value })
          );
        }
        return results;
      };

      const combos = generateCombos(variantMatrix.axes);
      setVariants(
        combos.map((combo) => ({
          combo,
          price: 0,
          stock: 0,
          sku: "",
          images: [],
        }))
      );
    } else {
      setVariants([]);
    }
  }, [hasVariants, variantMatrix]);

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const updateAttribute = (index: number, value: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, value } : attr))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedCategory || !selectedSubcategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate pricing based on product type
    if (hasVariants) {
      const hasValidVariants = variants.some((v) => v.price > 0 && v.stock >= 0);
      if (!hasValidVariants) {
        toast({
          title: "Validation Error",
          description: "Please set price and stock for at least one variant",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (basePrice <= 0) {
        toast({
          title: "Validation Error",
          description: "Please set a valid price for the product",
          variant: "destructive",
        });
        return;
      }
    }

    // Calculate min/max prices and total stock
    const validVariants = variants.filter((v) => v.price > 0);
    const minPrice = hasVariants
      ? Math.min(...validVariants.map((v) => v.price))
      : basePrice;
    const maxPrice = hasVariants
      ? Math.max(...validVariants.map((v) => v.price))
      : basePrice;
    const totalStock = hasVariants
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : baseStock;

    // Build variantValues from the variant matrix
    const variantValues: Record<string, string[]> = {};
    if (variantMatrix) {
      variantMatrix.axes.forEach((axis) => {
        variantValues[axis.key] = axis.values;
      });
    }

    // Build flash sale object if enabled
    let flashSaleData: FlashSale | undefined;
    if (flashSaleEnabled) {
      flashSaleData = {
        isActive: true,
        discountType: flashSale.discountType,
        discountValue: flashSale.discountValue,
        startDate: new Date(flashSale.startDate),
        endDate: new Date(flashSale.endDate),
        stockLimit: flashSale.stockLimit,
        soldCount: 0,
      };
    }

    createProduct({
      vendorId: "vendor-1",
      name,
      description,
      categoryId: selectedCategory._id,
      subcategoryId: selectedSubcategory._id,
      defaultImage,
      hasVariants,
      basePrice: hasVariants ? undefined : basePrice,
      baseStock: hasVariants ? undefined : baseStock,
      baseSku: hasVariants ? undefined : baseSku || undefined,
      variants: hasVariants ? variants : [],
      variantValues,
      attributes,
      minPrice,
      maxPrice,
      totalStock,
      inStock: totalStock > 0,
      flashSale: flashSaleData,
      seo: {
        title: seoTitle || name,
        description: seoDescription || description,
        keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
    });

    toast({
      title: "Product Added",
      description: `${name} has been added successfully`,
    });

    navigate("/vendor");
  };

  const getComboLabel = (combo: VariantCombo) => {
    return Object.entries(combo)
      .map(([, value]) => value)
      .join(" / ");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/vendor")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={selectedCategory?._id || ""}
                        onValueChange={(value) => {
                          const cat = allCategories.find((c) => c._id === value);
                          setSelectedCategory(cat || null);
                        }}
                      >
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
                    </div>

                    <div>
                      <Label>Subcategory *</Label>
                      <Select
                        value={selectedSubcategory?._id || ""}
                        onValueChange={(value) => {
                          const sub = subcategories.find((s) => s._id === value);
                          setSelectedSubcategory(sub || null);
                        }}
                        disabled={!selectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((sub) => {
                            const subHasVariants = sub.variantMatrix?.axes?.some(
                              (axis) => axis.values.length > 0
                            );
                            return (
                              <SelectItem key={sub._id} value={sub._id}>
                                {sub.name}
                                {!subHasVariants && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (Simple)
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedSubcategory && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {hasVariants ? (
                          <>
                            <Badge variant="secondary" className="mr-2">
                              Variant Product
                            </Badge>
                            This subcategory uses variants. Set pricing per variant below.
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="mr-2">
                              Simple Product
                            </Badge>
                            This subcategory has no variants. Set a single price and stock.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Attributes (Specifications) */}
              {attributes.length > 0 && selectedSubcategory?.attributeTemplates && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attributes.map((attr, index) => {
                        const template = selectedSubcategory.attributeTemplates.find(
                          (t) => t.key === attr.key
                        );
                        if (!template) return null;
                        return (
                          <div key={attr.key}>
                            <Label>
                              {template.label}
                              {template.required && " *"}
                              {template.unit && ` (${template.unit})`}
                            </Label>
                            {template.type === "select" && template.options ? (
                              <Select
                                value={attr.value}
                                onValueChange={(value) => updateAttribute(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {template.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : template.type === "number" ? (
                              <Input
                                type="number"
                                value={attr.value}
                                onChange={(e) => updateAttribute(index, e.target.value)}
                                placeholder={`Enter ${template.label.toLowerCase()}`}
                              />
                            ) : (
                              <Input
                                value={attr.value}
                                onChange={(e) => updateAttribute(index, e.target.value)}
                                placeholder={`Enter ${template.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Simple Product Pricing (No Variants) */}
              {selectedSubcategory && !hasVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="basePrice">Price ($) *</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={basePrice || ""}
                          onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="baseStock">Stock *</Label>
                        <Input
                          id="baseStock"
                          type="number"
                          min="0"
                          value={baseStock || ""}
                          onChange={(e) => setBaseStock(parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="baseSku">SKU</Label>
                        <Input
                          id="baseSku"
                          value={baseSku}
                          onChange={(e) => setBaseSku(e.target.value)}
                          placeholder="Optional SKU"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variant Pricing */}
              {hasVariants && variants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Variant Pricing & Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div
                          key={getComboLabel(variant.combo)}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <Badge variant="secondary">
                              {getComboLabel(variant.combo)}
                            </Badge>
                          </div>
                          <div className="w-28">
                            <Label className="text-xs">Price ($)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price || ""}
                              onChange={(e) =>
                                updateVariant(index, "price", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="w-24">
                            <Label className="text-xs">Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock || ""}
                              onChange={(e) =>
                                updateVariant(index, "stock", parseInt(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-xs">SKU</Label>
                            <Input
                              value={variant.sku || ""}
                              onChange={(e) => updateVariant(index, "sku", e.target.value)}
                              placeholder="SKU"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="flash-sale"
                      checked={flashSaleEnabled}
                      onCheckedChange={setFlashSaleEnabled}
                    />
                    <Label htmlFor="flash-sale">Enable Flash Sale</Label>
                  </div>

                  {flashSaleEnabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Discount Type</Label>
                          <Select
                            value={flashSale.discountType}
                            onValueChange={(value) =>
                              setFlashSale({ ...flashSale, discountType: value as "percentage" | "fixed" })
                            }
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
                        <div>
                          <Label>
                            Discount Value{" "}
                            {flashSale.discountType === "percentage" ? "(%)" : "($)"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={flashSale.discountValue || ""}
                            onChange={(e) =>
                              setFlashSale({
                                ...flashSale,
                                discountValue: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={flashSale.startDate}
                            onChange={(e) =>
                              setFlashSale({ ...flashSale, startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>End Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={flashSale.endDate}
                            onChange={(e) =>
                              setFlashSale({ ...flashSale, endDate: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="w-1/2">
                        <Label>Stock Limit (Optional)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={flashSale.stockLimit || ""}
                          onChange={(e) =>
                            setFlashSale({
                              ...flashSale,
                              stockLimit: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="defaultImage">Default Image URL</Label>
                    <Input
                      id="defaultImage"
                      value={defaultImage}
                      onChange={(e) => setDefaultImage(e.target.value)}
                      placeholder="Image URL"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={name || "Product title for search engines"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Brief description for search engines"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                    <Input
                      id="seoKeywords"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
