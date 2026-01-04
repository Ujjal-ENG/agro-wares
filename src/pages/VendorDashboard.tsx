import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Edit, Trash2, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getVendorProducts, deleteProduct } from "@/data/mockDatabase";
import { vendors } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboard() {
  const { toast } = useToast();
  // Mock current vendor (first vendor for demo)
  const currentVendor = vendors[0];
  const [page] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const { products, total } = getVendorProducts(currentVendor._id, page, 10);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const totalRevenuePotential = products.reduce(
    (sum, p) => sum + p.totalStock * p.minPrice,
    0
  );

  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);

  const handleDelete = (productId: string, productName: string) => {
    if (confirm(`Delete "${productName}"?`)) {
      deleteProduct(productId, currentVendor._id);
      toast({ title: "Product deleted" });
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background" key={refreshKey}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            MultiMart
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as: <strong>{currentVendor.name}</strong>
            </span>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your products and inventory
            </p>
          </div>
          <Link to="/vendor/add-product">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(totalRevenuePotential)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU Count</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.defaultImage}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.variants.length} variants</TableCell>
                    <TableCell>
                      {product.minPrice === product.maxPrice
                        ? formatPrice(product.minPrice)
                        : `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`}
                    </TableCell>
                    <TableCell>{product.totalStock}</TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/product/${product.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
