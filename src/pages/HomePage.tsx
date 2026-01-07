import { Link } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryCard } from "@/components/ecommerce/CategoryCard";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { getAllCategories, searchProducts } from "@/data/mockDatabase";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function HomePage() {
  const categories = getAllCategories();
  const featuredProducts = searchProducts("", 1, 4).products;
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            MultiMart
          </Link>
          <div className="flex flex-1 items-center justify-center px-8">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Link to="/vendor" className="text-sm hover:text-primary">
              Vendor Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Shop from <span className="text-primary">1000+</span> Vendors
          </h1>
          <p className="mb-6 max-w-xl text-lg text-muted-foreground">
            Discover unique products from verified sellers. Electronics, fashion,
            home goods, and more.
          </p>
          <Button size="lg" asChild>
            <Link to="/category/electronics">Start Shopping</Link>
          </Button>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Shop by Category</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/category/electronics" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 MultiMart. Multi-vendor E-commerce Platform</p>
          <p className="mt-1">Built with React + TypeScript (Mock Data Layer)</p>
        </div>
      </footer>
    </div>
  );
}
