import { vendors, categories, subcategories, products, generateId, generateSlug } from "./mockData";
import type {
  Vendor,
  Category,
  Subcategory,
  Product,
  ProductCardDTO,
  ProductDetailDTO,
  FacetedSearchResult,
  VariantMatrix,
  AttributeTemplate,
} from "@/types/ecommerce";

// Vendor operations
export const getVendorById = (id: string): Vendor | undefined => vendors.find((v) => v._id === id);
export const getVendorBySlug = (slug: string): Vendor | undefined => vendors.find((v) => v.slug === slug);
export const getAllVendors = (): Vendor[] => vendors;

// Category operations
export const getAllCategories = (): Category[] => categories;
export const getCategoryBySlug = (slug: string): Category | undefined => categories.find((c) => c.slug === slug);
export const getCategoryById = (id: string): Category | undefined => categories.find((c) => c._id === id);

export const createCategory = (data: { name: string; image: string }): Category => {
  const newCategory: Category = {
    _id: `cat${generateId()}`,
    name: data.name,
    slug: generateSlug(data.name),
    image: data.image,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = (id: string, data: Partial<Pick<Category, "name" | "image">>): Category | undefined => {
  const index = categories.findIndex((c) => c._id === id);
  if (index === -1) return undefined;
  if (data.name) {
    categories[index].name = data.name;
    categories[index].slug = generateSlug(data.name);
  }
  if (data.image) categories[index].image = data.image;
  categories[index].updatedAt = new Date();
  return categories[index];
};

export const deleteCategory = (id: string): boolean => {
  const index = categories.findIndex((c) => c._id === id);
  if (index === -1) return false;
  categories.splice(index, 1);
  return true;
};

// Subcategory operations
export const getSubcategoriesByCategoryId = (categoryId: string): Subcategory[] => subcategories.filter((s) => s.categoryId === categoryId);
export const getSubcategoryBySlug = (categorySlug: string, subSlug: string): Subcategory | undefined => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;
  return subcategories.find((s) => s.categoryId === category._id && s.slug === subSlug);
};
export const getSubcategoryById = (id: string): Subcategory | undefined => subcategories.find((s) => s._id === id);
export const getAllSubcategories = (): Subcategory[] => subcategories;

export const createSubcategory = (data: { categoryId: string; name: string; attributeTemplates?: AttributeTemplate[]; variantMatrix: VariantMatrix }): Subcategory => {
  const newSubcategory: Subcategory = {
    _id: `sub${generateId()}`,
    categoryId: data.categoryId,
    name: data.name,
    slug: generateSlug(data.name),
    attributeTemplates: data.attributeTemplates || [],
    variantMatrix: data.variantMatrix,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  subcategories.push(newSubcategory);
  return newSubcategory;
};

export const updateSubcategory = (id: string, data: Partial<Pick<Subcategory, "name" | "attributeTemplates" | "variantMatrix">>): Subcategory | undefined => {
  const index = subcategories.findIndex((s) => s._id === id);
  if (index === -1) return undefined;
  if (data.name) {
    subcategories[index].name = data.name;
    subcategories[index].slug = generateSlug(data.name);
  }
  if (data.attributeTemplates) subcategories[index].attributeTemplates = data.attributeTemplates;
  if (data.variantMatrix) subcategories[index].variantMatrix = data.variantMatrix;
  subcategories[index].updatedAt = new Date();
  return subcategories[index];
};

export const deleteSubcategory = (id: string): boolean => {
  const index = subcategories.findIndex((s) => s._id === id);
  if (index === -1) return false;
  subcategories.splice(index, 1);
  return true;
};

// Product operations
const toProductCardDTO = (p: Product): ProductCardDTO => {
  const vendor = getVendorById(p.vendorId);
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    vendorName: vendor?.name || "Unknown",
    minPrice: p.hasVariants ? p.minPrice : (p.basePrice || 0),
    maxPrice: p.hasVariants ? p.maxPrice : (p.basePrice || 0),
    defaultImage: p.defaultImage,
    inStock: p.inStock,
    hasVariants: p.hasVariants,
    basePrice: p.basePrice,
    flashSale: p.flashSale,
  };
};

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
    minPrice: product.hasVariants ? product.minPrice : (product.basePrice || 0),
    maxPrice: product.hasVariants ? product.maxPrice : (product.basePrice || 0),
    defaultImage: product.defaultImage,
    inStock: product.inStock,
    hasVariants: product.hasVariants,
    basePrice: product.basePrice,
    baseStock: product.baseStock,
    baseSku: product.baseSku,
    flashSale: product.flashSale,
    description: product.description,
    attributes: product.attributes,
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
  if (subcategorySlug) {
    const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug);
    if (subcategory) filtered = filtered.filter((p) => p.subcategoryId === subcategory._id);
  }
  if (filters) {
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((p) => p.variants.some((v) => values.includes(v.combo[key]) && v.stock > 0));
      }
    });
  }
  const facetMap: Record<string, Record<string, number>> = {};
  filtered.forEach((p) => {
    p.variants.forEach((v) => {
      Object.entries(v.combo).forEach(([key, value]) => {
        if (!facetMap[key]) facetMap[key] = {};
        facetMap[key][value] = (facetMap[key][value] || 0) + 1;
      });
    });
  });
  const facets = Object.entries(facetMap).map(([k, counts]) => ({ k, v: Object.keys(counts), counts }));
  switch (sortBy) {
    case "price-asc": filtered.sort((a, b) => a.minPrice - b.minPrice); break;
    case "price-desc": filtered.sort((a, b) => b.minPrice - a.minPrice); break;
    case "newest": filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
  }
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);
  return { filters: facets, products: paged.map(toProductCardDTO), total };
};

export const searchProducts = (query: string, page: number = 1, limit: number = 12): FacetedSearchResult => {
  const lowerQuery = query.toLowerCase();
  const filtered = products.filter((p) =>
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
  const facets = Object.entries(facetMap).map(([k, counts]) => ({ k, v: Object.keys(counts), counts }));
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);
  return { filters: facets, products: paged.map(toProductCardDTO), total };
};

export const getVendorProducts = (vendorId: string, page: number = 1, limit: number = 10): { products: Product[]; total: number } => {
  const vendorProducts = products.filter((p) => p.vendorId === vendorId);
  return { products: vendorProducts.slice((page - 1) * limit, page * limit), total: vendorProducts.length };
};

export const createProduct = (data: Omit<Product, "_id" | "slug" | "createdAt" | "updatedAt">): Product => {
  const newProduct: Product = { ...data, _id: `p${generateId()}`, slug: generateSlug(data.name), createdAt: new Date(), updatedAt: new Date() };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, vendorId: string, data: Partial<Product>): Product | undefined => {
  const index = products.findIndex((p) => p._id === id && p.vendorId === vendorId);
  if (index === -1) return undefined;
  const updated = { ...products[index], ...data, updatedAt: new Date() };
  if (data.name) updated.slug = generateSlug(data.name);
  products[index] = updated;
  return updated;
};

export const deleteProduct = (id: string, vendorId?: string): boolean => {
  const index = vendorId ? products.findIndex((p) => p._id === id && p.vendorId === vendorId) : products.findIndex((p) => p._id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};
