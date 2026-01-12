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

// ==========================================
// ATTRIBUTES SYSTEM
// ==========================================

/**
 * Attribute Template - Defines what attributes a subcategory requires
 * These are the "specification fields" vendors must fill out
 */
export interface AttributeTemplate {
  key: string;           // e.g., "brand", "screen_size"
  label: string;         // e.g., "Brand", "Screen Size"
  type: "text" | "number" | "select";  // Input type
  options?: string[];    // For select type - predefined options
  required: boolean;
  unit?: string;         // e.g., "inches", "mAh", "GB"
}

/**
 * Product Attribute - Actual attribute value on a product
 * Answers: "What are its features?"
 */
export interface ProductAttribute {
  key: string;           // Matches AttributeTemplate.key
  value: string;         // The actual value
}

// ==========================================
// VARIANTS SYSTEM
// ==========================================

/**
 * Variant Axis - Defines variant-generating attributes
 * These create purchasable SKUs (Color, Size, Storage)
 */
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
  attributeTemplates: AttributeTemplate[];  // Specs to collect
  variantMatrix: VariantMatrix;             // Variant-generating attributes
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

// Flash Sale Types
export interface FlashSale {
  isActive: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  stockLimit?: number;
  soldCount?: number;
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
  
  // Product Attributes (Specifications)
  attributes: ProductAttribute[];
  
  // Variant vs Simple Product
  hasVariants: boolean;
  basePrice?: number;      // For simple products (no variants)
  baseStock?: number;      // For simple products
  baseSku?: string;        // For simple products
  
  // Computed pricing fields
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
  
  // Variants (for products with variants)
  variants: ProductVariant[];
  variantValues: Record<string, string[]>;
  
  // Flash Sale
  flashSale?: FlashSale;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCardDTO {
  _id: string;
  name: string;
  slug: string;
  vendorName: string;
  minPrice: number;
  maxPrice: number;
  defaultImage: string;
  inStock: boolean;
  hasVariants: boolean;
  basePrice?: number;
  flashSale?: FlashSale;
}

export interface ProductDetailDTO extends ProductCardDTO {
  description: string;
  attributes: ProductAttribute[];
  variantMatrix: VariantMatrix;
  variants: ProductVariant[];
  baseStock?: number;
  baseSku?: string;
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

export function getFlashSalePrice(originalPrice: number, flashSale?: FlashSale): number | null {
  if (!flashSale || !flashSale.isActive) return null;
  const now = new Date();
  if (now < new Date(flashSale.startDate) || now > new Date(flashSale.endDate)) return null;
  if (flashSale.stockLimit !== undefined && flashSale.soldCount !== undefined && flashSale.soldCount >= flashSale.stockLimit) return null;
  return flashSale.discountType === 'percentage' 
    ? originalPrice * (1 - flashSale.discountValue / 100)
    : Math.max(0, originalPrice - flashSale.discountValue);
}

export function isFlashSaleActive(flashSale?: FlashSale): boolean {
  if (!flashSale || !flashSale.isActive) return false;
  const now = new Date();
  if (now < new Date(flashSale.startDate) || now > new Date(flashSale.endDate)) return false;
  if (flashSale.stockLimit !== undefined && flashSale.soldCount !== undefined && flashSale.soldCount >= flashSale.stockLimit) return false;
  return true;
}
