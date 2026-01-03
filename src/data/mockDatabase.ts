import { vendors, categories, subcategories, products } from "./mockData";
import type {
  Vendor,
  Category,
  Subcategory,
  Product,
  ProductCardDTO,
  ProductDetailDTO,
  FacetedSearchResult,
} from "@/types/ecommerce";

// Simulated database operations

// Vendor operations
export const getVendorById = (id: string): Vendor | undefined => 
  vendors.find((v) => v._id === id);

export const getVendorBySlug = (slug: string): Vendor | undefined => 
  vendors.find((v) => v.slug === slug);

// Category operations
export const getAllCategories = (): Category[] => categories;

export const getCategoryBySlug = (slug: string): Category | undefined => 
  categories.find((c) => c.slug === slug);

// Subcategory operations
export const getSubcategoriesByCategoryId = (categoryId: string): Subcategory[] => 
  subcategories.filter((s) => s.categoryId === categoryId);

export const getSubcategoryBySlug = (categorySlug: string, subSlug: string): Subcategory | undefined => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;
  return subcategories.find((s) => s.categoryId === category._id && s.slug === subSlug);
};

export const getSubcategoryById = (id: string): Subcategory | undefined =>
  subcategories.find((s) => s._id === id);

// Product operations
export const getProductBySlug = (slug: string): ProductDetailDTO | undefined => {
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;

  const vendor = getVendorById(product.vendorId);
  const subcategory = getSubcategoryById(product.subcategoryId);

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    vendorName: vendor?.name || "Unknown Vendor",
    minPrice: product.minPrice,
    maxPrice: product.maxPrice,
    defaultImage: product.defaultImage,
    inStock: product.inStock,
    description: product.description,
    variantMatrix: subcategory?.variantMatrix || { axes: [] },
    variants: product.variants,
  };
};

export const getProductsByCategory = (
  categorySlug: string,
  subcategorySlug?: string,
  filters?: Record<string, string[]>,
  sortBy: "price-asc" | "price-desc" | "newest" = "newest",
  page: number = 1,
  limit: number = 12
): FacetedSearchResult => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { filters: [], products: [], total: 0 };

  let filtered = products.filter((p) => p.categoryId === category._id);

  // Filter by subcategory
  if (subcategorySlug) {
    const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug);
    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategoryId === subcategory._id);
    }
  }

  // Apply variant filters
  if (filters) {
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((p) =>
          p.variants.some(
            (v) => values.includes(v.combo[key]) && v.stock > 0
          )
        );
      }
    });
  }

  // Build facets from filtered results
  const facetMap: Record<string, Record<string, number>> = {};
  filtered.forEach((p) => {
    p.variants.forEach((v) => {
      Object.entries(v.combo).forEach(([key, value]) => {
        if (!facetMap[key]) facetMap[key] = {};
        facetMap[key][value] = (facetMap[key][value] || 0) + 1;
      });
    });
  });

  const facets = Object.entries(facetMap).map(([k, counts]) => ({
    k,
    v: Object.keys(counts),
    counts,
  }));

  // Sort
  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case "newest":
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const productCards: ProductCardDTO[] = paged.map((p) => {
    const vendor = getVendorById(p.vendorId);
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug,
      vendorName: vendor?.name || "Unknown",
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      defaultImage: p.defaultImage,
      inStock: p.inStock,
    };
  });

  return { filters: facets, products: productCards, total };
};

// Search
export const searchProducts = (
  query: string,
  page: number = 1,
  limit: number = 12
): FacetedSearchResult => {
  const lowerQuery = query.toLowerCase();
  
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(lowerQuery))
  );

  const facetMap: Record<string, Record<string, number>> = {};
  filtered.forEach((p) => {
    p.variants.forEach((v) => {
      Object.entries(v.combo).forEach(([key, value]) => {
        if (!facetMap[key]) facetMap[key] = {};
        facetMap[key][value] = (facetMap[key][value] || 0) + 1;
      });
    });
  });

  const facets = Object.entries(facetMap).map(([k, counts]) => ({
    k,
    v: Object.keys(counts),
    counts,
  }));

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const productCards: ProductCardDTO[] = paged.map((p) => {
    const vendor = getVendorById(p.vendorId);
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug,
      vendorName: vendor?.name || "Unknown",
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      defaultImage: p.defaultImage,
      inStock: p.inStock,
    };
  });

  return { filters: facets, products: productCards, total };
};

// Vendor dashboard
export const getVendorProducts = (
  vendorId: string,
  page: number = 1,
  limit: number = 10
): { products: Product[]; total: number } => {
  const vendorProducts = products.filter((p) => p.vendorId === vendorId);
  const total = vendorProducts.length;
  const start = (page - 1) * limit;
  const paged = vendorProducts.slice(start, start + limit);
  return { products: paged, total };
};
