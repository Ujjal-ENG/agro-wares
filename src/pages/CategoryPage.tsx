import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard, ProductCardSkeleton } from "@/components/ecommerce/ProductCard";
import { FilterSidebar } from "@/components/ecommerce/FilterSidebar";
import {
  getCategoryBySlug,
  getSubcategoriesByCategoryId,
  getProductsByCategory,
} from "@/data/mockDatabase";

type SortOption = "price-asc" | "price-desc" | "newest";

export default function CategoryPage() {
  const { categorySlug, subcategorySlug } = useParams<{
    categorySlug: string;
    subcategorySlug?: string;
  }>();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isLoading] = useState(false);

  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const subcategories = category
    ? getSubcategoriesByCategoryId(category._id)
    : [];

  const { filters, products, total } = useMemo(() => {
    if (!categorySlug) return { filters: [], products: [], total: 0 };
    return getProductsByCategory(
      categorySlug,
      subcategorySlug,
      activeFilters,
      sortBy
    );
  }, [categorySlug, subcategorySlug, activeFilters, sortBy]);

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      if (checked) {
        return { ...prev, [key]: [...current, value] };
      }
      return { ...prev, [key]: current.filter((v) => v !== value) };
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Category Not Found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {subcategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/category/${categorySlug}`}>
                <Button
                  variant={!subcategorySlug ? "default" : "outline"}
                  size="sm"
                >
                  All
                </Button>
              </Link>
              {subcategories.map((sub) => (
                <Link key={sub._id} to={`/category/${categorySlug}/${sub.slug}`}>
                  <Button
                    variant={subcategorySlug === sub.slug ? "default" : "outline"}
                    size="sm"
                  >
                    {sub.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              facets={filters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} product{total !== 1 ? "s" : ""} found
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <FilterSidebar
                      facets={filters}
                      activeFilters={activeFilters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No products found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
