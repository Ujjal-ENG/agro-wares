import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, ChevronRight, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAllCategories,
  getAllSubcategories,
  getSubcategoriesByCategoryId,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/data/mockDatabase";
import type { Category, Subcategory, VariantAxis } from "@/types/ecommerce";

export default function AdminPanel() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const categories = getAllCategories();
  const subcategories = getAllSubcategories();

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryImage(cat.image);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryImage("");
    }
    setCategoryModalOpen(true);
  };

  const saveCategory = () => {
    if (!categoryName) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editingCategory) {
      updateCategory(editingCategory._id, { name: categoryName, image: categoryImage });
      toast({ title: "Category Updated" });
    } else {
      createCategory({ name: categoryName, image: categoryImage || "https://via.placeholder.com/400" });
      toast({ title: "Category Created" });
    }
    setCategoryModalOpen(false);
    refresh();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Delete this category and all its subcategories?")) {
      deleteCategory(id);
      toast({ title: "Category Deleted" });
      refresh();
    }
  };

  // Subcategory Modal
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [variantAxes, setVariantAxes] = useState<VariantAxis[]>([]);

  const openSubcategoryModal = (sub?: Subcategory) => {
    if (sub) {
      setEditingSubcategory(sub);
      setSubcategoryName(sub.name);
      setSubcategoryCategoryId(sub.categoryId);
      setVariantAxes([...sub.variantMatrix.axes]);
    } else {
      setEditingSubcategory(null);
      setSubcategoryName("");
      setSubcategoryCategoryId(categories[0]?._id || "");
      setVariantAxes([]);
    }
    setSubcategoryModalOpen(true);
  };

  const addVariantAxis = () => {
    setVariantAxes([...variantAxes, { key: "", label: "", values: [] }]);
  };

  const updateVariantAxis = (index: number, field: keyof VariantAxis, value: string | string[]) => {
    const updated = [...variantAxes];
    if (field === "values") {
      updated[index].values = value as string[];
    } else {
      updated[index][field] = value as string;
      if (field === "label" && !updated[index].key) {
        updated[index].key = (value as string).toLowerCase().replace(/\s+/g, "_");
      }
    }
    setVariantAxes(updated);
  };

  const removeVariantAxis = (index: number) => {
    setVariantAxes(variantAxes.filter((_, i) => i !== index));
  };

  const saveSubcategory = () => {
    if (!subcategoryName || !subcategoryCategoryId) {
      toast({ title: "Name and category are required", variant: "destructive" });
      return;
    }
    const validAxes = variantAxes.filter((a) => a.key && a.label && a.values.length > 0);
    
    if (editingSubcategory) {
      updateSubcategory(editingSubcategory._id, {
        name: subcategoryName,
        variantMatrix: { axes: validAxes },
      });
      toast({ title: "Subcategory Updated" });
    } else {
      createSubcategory({
        categoryId: subcategoryCategoryId,
        name: subcategoryName,
        variantMatrix: { axes: validAxes },
      });
      toast({ title: "Subcategory Created" });
    }
    setSubcategoryModalOpen(false);
    refresh();
  };

  const handleDeleteSubcategory = (id: string) => {
    if (confirm("Delete this subcategory and all its products?")) {
      deleteSubcategory(id);
      toast({ title: "Subcategory Deleted" });
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background" key={refreshKey}>
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            MultiMart Admin
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/vendor">
              <Button variant="outline" size="sm">
                Vendor Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                View Store
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="categories">
          <TabsList className="mb-6">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button onClick={() => openCategoryModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const subs = getSubcategoriesByCategoryId(cat._id);
                return (
                  <Card key={cat._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subs.length} subcategories
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCategoryModal(cat)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(cat._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Subcategories & Variant Matrices</h2>
              <Button onClick={() => openSubcategoryModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => {
                const subs = getSubcategoriesByCategoryId(cat._id);
                if (subs.length === 0) return null;
                return (
                  <Card key={cat._id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {cat.name}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-normal">
                          {subs.length} subcategories
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {subs.map((sub) => (
                        <div
                          key={sub._id}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{sub.name}</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openSubcategoryModal(sub)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubcategory(sub._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sub.variantMatrix.axes.map((axis) => (
                              <Badge key={axis.key} variant="secondary">
                                {axis.label}: {axis.values.join(", ")}
                              </Badge>
                            ))}
                            {sub.variantMatrix.axes.length === 0 && (
                              <span className="text-sm text-muted-foreground">
                                No variants defined
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={categoryImage}
                onChange={(e) => setCategoryImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Modal */}
      <Dialog open={subcategoryModalOpen} onOpenChange={setSubcategoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={subcategoryCategoryId}
                  onValueChange={setSubcategoryCategoryId}
                  disabled={!!editingSubcategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory Name</Label>
                <Input
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  placeholder="Subcategory name"
                />
              </div>
            </div>

            {/* Variant Axes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Variant Axes</Label>
                <Button type="button" size="sm" variant="outline" onClick={addVariantAxis}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Axis
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Define variant options (e.g., Size, Color) that vendors must use for products in this subcategory.
              </p>

              {variantAxes.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No variant axes defined. Products won't have variants.
                </p>
              ) : (
                <div className="space-y-4">
                  {variantAxes.map((axis, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Axis {idx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariantAxis(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Label (displayed to users)</Label>
                          <Input
                            value={axis.label}
                            onChange={(e) => updateVariantAxis(idx, "label", e.target.value)}
                            placeholder="e.g., Size"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Key (for database)</Label>
                          <Input
                            value={axis.key}
                            onChange={(e) => updateVariantAxis(idx, "key", e.target.value)}
                            placeholder="e.g., size"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Values (comma separated)</Label>
                        <Input
                          value={axis.values.join(", ")}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Split by comma and preserve all values (including empty for typing)
                            const values = inputValue
                              .split(",")
                              .map((v) => v.trim())
                              .filter((v) => v.length > 0);
                            updateVariantAxis(idx, "values", values);
                          }}
                          placeholder="e.g., S, M, L, XL"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter values separated by commas: Red, Blue, Green
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubcategory}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
