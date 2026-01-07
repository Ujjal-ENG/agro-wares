import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  createProduct,
} from "@/data/mockDatabase";
import { vendors } from "@/data/mockData";
import type { ProductVariant } from "@/types/ecommerce";

export default function VendorAddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentVendor = vendors[0];

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

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultImage, setDefaultImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);

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

    const hasVariantAxes = variantMatrix && variantMatrix.axes.length > 0;

    if (!name || !selectedCategoryId || !selectedSubcategoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (hasVariantAxes && variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one variant.",
        variant: "destructive",
      });
      return;
    }

    // Calculate derived fields
    const hasVariants = hasVariantAxes && variants.length > 0;
    const prices = hasVariants ? variants.map((v) => v.price) : [];
    const totalStock = hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : 0;
    const variantValues: Record<string, string[]> = {};
    
    if (hasVariants && variantMatrix) {
      variantMatrix.axes.forEach((axis) => {
        const uniqueValues = [...new Set(variants.map((v) => v.combo[axis.key]))];
        variantValues[axis.key] = uniqueValues;
      });
    }

    createProduct({
      vendorId: currentVendor._id,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      name,
      description,
      seo: {
        title: seoTitle || name,
        description: seoDescription || description.substring(0, 160),
        keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
      defaultImage: defaultImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      hasVariants,
      basePrice: hasVariants ? undefined : 0,
      baseStock: hasVariants ? undefined : 0,
      baseSku: hasVariants ? undefined : "",
      minPrice: hasVariants ? Math.min(...prices) : 0,
      maxPrice: hasVariants ? Math.max(...prices) : 0,
      totalStock: hasVariants ? totalStock : 0,
      inStock: hasVariants ? totalStock > 0 : false,
      variants: hasVariants ? variants : [],
      variantValues,
    });

    toast({
      title: "Product Created",
      description: `"${name}" has been added to your store.`,
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
            <h1 className="text-xl font-bold">Add New Product</h1>
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
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={(val) => {
                        setSelectedCategoryId(val);
                        setSelectedSubcategoryId("");
                        setVariants([]);
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
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory *</Label>
                    <Select
                      value={selectedSubcategoryId}
                      onValueChange={(val) => {
                        setSelectedSubcategoryId(val);
                        setVariants([]);
                      }}
                      disabled={!selectedCategoryId}
                    >
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

            {/* Variants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Variants</CardTitle>
                {variantMatrix && (
                  <Button type="button" size="sm" onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!variantMatrix ? (
                  <p className="text-center text-muted-foreground py-8">
                    Select a subcategory to configure variants
                  </p>
                ) : variants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No variants added. Click "Add Variant" to create one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border p-4 space-y-4"
                      >
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

                        {/* Dynamic variant options */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {variantMatrix.axes.map((axis) => (
                            <div key={axis.key} className="space-y-2">
                              <Label>{axis.label}</Label>
                              <Select
                                value={variant.combo[axis.key]}
                                onValueChange={(val) =>
                                  updateVariantCombo(idx, axis.key, val)
                                }
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

                        {/* SKU, Price, Stock */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariant(idx, "sku", e.target.value)
                              }
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
                              onChange={(e) =>
                                updateVariant(idx, "price", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(idx, "stock", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  Save Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
