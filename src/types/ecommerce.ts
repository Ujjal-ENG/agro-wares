// Core E-Commerce Types

export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantAxis {
  key: string;
  label: string;
  values: string[];
}

export interface VariantMatrix {
  axes: VariantAxis[];
}

export interface Subcategory {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  variantMatrix: VariantMatrix;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantCombo {
  [key: string]: string;
}

export interface ProductVariant {
  combo: VariantCombo;
  sku: string;
  price: number;
  stock: number;
  images: string[];
  extra?: Record<string, unknown>;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface Product {
  _id: string;
  vendorId: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  slug: string;
  description: string;
  seo: ProductSEO;
  defaultImage: string;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
  variants: ProductVariant[];
  variantValues: Record<string, string[]>; // Flattened for filtering
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface ProductCardDTO {
  _id: string;
  name: string;
  slug: string;
  vendorName: string;
  minPrice: number;
  maxPrice: number;
  defaultImage: string;
  inStock: boolean;
}

export interface ProductDetailDTO extends ProductCardDTO {
  description: string;
  variantMatrix: VariantMatrix;
  variants: ProductVariant[];
}

export interface FacetValue {
  k: string;
  v: string[];
  counts: Record<string, number>;
}

export interface FacetedSearchResult {
  filters: FacetValue[];
  products: ProductCardDTO[];
  total: number;
}
