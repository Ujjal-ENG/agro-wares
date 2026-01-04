import { Vendor, Category, Subcategory, Product } from "@/types/ecommerce";

// Mock Vendors
export let vendors: Vendor[] = [
  {
    _id: "v1",
    name: "TechGear Pro",
    slug: "techgear-pro",
    email: "sales@techgear.com",
    verified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "v2",
    name: "Fashion Forward",
    slug: "fashion-forward",
    email: "info@fashionforward.com",
    verified: true,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    _id: "v3",
    name: "Home Essentials",
    slug: "home-essentials",
    email: "contact@homeessentials.com",
    verified: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

// Mock Categories
export let categories: Category[] = [
  {
    _id: "cat1",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "cat2",
    name: "Clothing",
    slug: "clothing",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "cat3",
    name: "Home & Garden",
    slug: "home-garden",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Subcategories with Variant Matrices
export let subcategories: Subcategory[] = [
  {
    _id: "sub1",
    categoryId: "cat1",
    name: "Smartphones",
    slug: "smartphones",
    variantMatrix: {
      axes: [
        { key: "storage", label: "Storage", values: ["64GB", "128GB", "256GB", "512GB"] },
        { key: "color", label: "Color", values: ["Black", "White", "Blue", "Gold"] },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "sub2",
    categoryId: "cat1",
    name: "Laptops",
    slug: "laptops",
    variantMatrix: {
      axes: [
        { key: "ram", label: "RAM", values: ["8GB", "16GB", "32GB"] },
        { key: "storage", label: "Storage", values: ["256GB SSD", "512GB SSD", "1TB SSD"] },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "sub3",
    categoryId: "cat2",
    name: "T-Shirts",
    slug: "t-shirts",
    variantMatrix: {
      axes: [
        { key: "size", label: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
        { key: "color", label: "Color", values: ["White", "Black", "Navy", "Red", "Green"] },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "sub4",
    categoryId: "cat2",
    name: "Jeans",
    slug: "jeans",
    variantMatrix: {
      axes: [
        { key: "waist", label: "Waist", values: ["28", "30", "32", "34", "36", "38"] },
        { key: "length", label: "Length", values: ["30", "32", "34"] },
        { key: "color", label: "Color", values: ["Light Blue", "Dark Blue", "Black"] },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "sub5",
    categoryId: "cat3",
    name: "Furniture",
    slug: "furniture",
    variantMatrix: {
      axes: [
        { key: "material", label: "Material", values: ["Oak", "Walnut", "Pine", "Metal"] },
        { key: "finish", label: "Finish", values: ["Natural", "Painted", "Stained"] },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Products with Variants
export let products: Product[] = [
  {
    _id: "p1",
    vendorId: "v1",
    categoryId: "cat1",
    subcategoryId: "sub1",
    name: "Galaxy Pro Max",
    slug: "galaxy-pro-max",
    description: "Premium smartphone with cutting-edge features, stunning display, and professional-grade camera system.",
    seo: {
      title: "Galaxy Pro Max - Premium Smartphone",
      description: "Buy the latest Galaxy Pro Max with advanced features",
      keywords: ["smartphone", "galaxy", "android"],
    },
    defaultImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    minPrice: 799,
    maxPrice: 1199,
    totalStock: 150,
    inStock: true,
    variants: [
      { combo: { storage: "64GB", color: "Black" }, sku: "GPM-64-BLK", price: 799, stock: 25, images: [] },
      { combo: { storage: "64GB", color: "White" }, sku: "GPM-64-WHT", price: 799, stock: 20, images: [] },
      { combo: { storage: "128GB", color: "Black" }, sku: "GPM-128-BLK", price: 899, stock: 30, images: [] },
      { combo: { storage: "128GB", color: "Blue" }, sku: "GPM-128-BLU", price: 899, stock: 15, images: [] },
      { combo: { storage: "256GB", color: "Gold" }, sku: "GPM-256-GLD", price: 1099, stock: 10, images: [] },
      { combo: { storage: "512GB", color: "Black" }, sku: "GPM-512-BLK", price: 1199, stock: 5, images: [] },
      { combo: { storage: "256GB", color: "Black" }, sku: "GPM-256-BLK", price: 1099, stock: 0, images: [] },
    ],
    variantValues: {
      storage: ["64GB", "128GB", "256GB", "512GB"],
      color: ["Black", "White", "Blue", "Gold"],
    },
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    _id: "p2",
    vendorId: "v1",
    categoryId: "cat1",
    subcategoryId: "sub2",
    name: "ProBook Elite",
    slug: "probook-elite",
    description: "High-performance laptop for professionals. Ultra-thin design with all-day battery life.",
    seo: {
      title: "ProBook Elite - Professional Laptop",
      description: "Premium laptop for work and creativity",
      keywords: ["laptop", "professional", "ultrabook"],
    },
    defaultImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    minPrice: 1299,
    maxPrice: 2199,
    totalStock: 80,
    inStock: true,
    variants: [
      { combo: { ram: "8GB", storage: "256GB SSD" }, sku: "PBE-8-256", price: 1299, stock: 20, images: [] },
      { combo: { ram: "16GB", storage: "512GB SSD" }, sku: "PBE-16-512", price: 1599, stock: 25, images: [] },
      { combo: { ram: "32GB", storage: "1TB SSD" }, sku: "PBE-32-1TB", price: 2199, stock: 15, images: [] },
      { combo: { ram: "16GB", storage: "256GB SSD" }, sku: "PBE-16-256", price: 1499, stock: 20, images: [] },
    ],
    variantValues: {
      ram: ["8GB", "16GB", "32GB"],
      storage: ["256GB SSD", "512GB SSD", "1TB SSD"],
    },
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-15"),
  },
  {
    _id: "p3",
    vendorId: "v2",
    categoryId: "cat2",
    subcategoryId: "sub3",
    name: "Classic Cotton Tee",
    slug: "classic-cotton-tee",
    description: "Soft, breathable 100% cotton t-shirt. Perfect for everyday wear with a comfortable relaxed fit.",
    seo: {
      title: "Classic Cotton T-Shirt",
      description: "Comfortable cotton tee for everyday wear",
      keywords: ["t-shirt", "cotton", "casual"],
    },
    defaultImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    minPrice: 24.99,
    maxPrice: 29.99,
    totalStock: 500,
    inStock: true,
    variants: [
      { combo: { size: "S", color: "White" }, sku: "CCT-S-WHT", price: 24.99, stock: 50, images: [] },
      { combo: { size: "M", color: "White" }, sku: "CCT-M-WHT", price: 24.99, stock: 60, images: [] },
      { combo: { size: "L", color: "White" }, sku: "CCT-L-WHT", price: 24.99, stock: 40, images: [] },
      { combo: { size: "S", color: "Black" }, sku: "CCT-S-BLK", price: 24.99, stock: 45, images: [] },
      { combo: { size: "M", color: "Black" }, sku: "CCT-M-BLK", price: 24.99, stock: 55, images: [] },
      { combo: { size: "L", color: "Black" }, sku: "CCT-L-BLK", price: 24.99, stock: 35, images: [] },
      { combo: { size: "XL", color: "Navy" }, sku: "CCT-XL-NVY", price: 29.99, stock: 30, images: [] },
      { combo: { size: "XXL", color: "Red" }, sku: "CCT-XXL-RED", price: 29.99, stock: 0, images: [] },
    ],
    variantValues: {
      size: ["S", "M", "L", "XL", "XXL"],
      color: ["White", "Black", "Navy", "Red"],
    },
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01"),
  },
  {
    _id: "p4",
    vendorId: "v2",
    categoryId: "cat2",
    subcategoryId: "sub4",
    name: "Slim Fit Denim",
    slug: "slim-fit-denim",
    description: "Modern slim fit jeans with stretch comfort. Premium denim that moves with you.",
    seo: {
      title: "Slim Fit Denim Jeans",
      description: "Stylish slim fit jeans with stretch",
      keywords: ["jeans", "denim", "slim fit"],
    },
    defaultImage: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    minPrice: 79.99,
    maxPrice: 89.99,
    totalStock: 200,
    inStock: true,
    variants: [
      { combo: { waist: "30", length: "32", color: "Dark Blue" }, sku: "SFD-30-32-DB", price: 79.99, stock: 25, images: [] },
      { combo: { waist: "32", length: "32", color: "Dark Blue" }, sku: "SFD-32-32-DB", price: 79.99, stock: 30, images: [] },
      { combo: { waist: "34", length: "32", color: "Dark Blue" }, sku: "SFD-34-32-DB", price: 79.99, stock: 28, images: [] },
      { combo: { waist: "32", length: "30", color: "Black" }, sku: "SFD-32-30-BLK", price: 89.99, stock: 20, images: [] },
      { combo: { waist: "34", length: "34", color: "Light Blue" }, sku: "SFD-34-34-LB", price: 79.99, stock: 22, images: [] },
    ],
    variantValues: {
      waist: ["30", "32", "34"],
      length: ["30", "32", "34"],
      color: ["Dark Blue", "Black", "Light Blue"],
    },
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    _id: "p5",
    vendorId: "v3",
    categoryId: "cat3",
    subcategoryId: "sub5",
    name: "Modern Coffee Table",
    slug: "modern-coffee-table",
    description: "Elegant minimalist coffee table that complements any living space. Handcrafted with premium materials.",
    seo: {
      title: "Modern Coffee Table",
      description: "Elegant minimalist coffee table for your home",
      keywords: ["furniture", "coffee table", "modern"],
    },
    defaultImage: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400",
    minPrice: 299,
    maxPrice: 499,
    totalStock: 45,
    inStock: true,
    variants: [
      { combo: { material: "Oak", finish: "Natural" }, sku: "MCT-OAK-NAT", price: 349, stock: 10, images: [] },
      { combo: { material: "Walnut", finish: "Natural" }, sku: "MCT-WAL-NAT", price: 399, stock: 8, images: [] },
      { combo: { material: "Oak", finish: "Stained" }, sku: "MCT-OAK-STN", price: 379, stock: 12, images: [] },
      { combo: { material: "Metal", finish: "Painted" }, sku: "MCT-MTL-PNT", price: 299, stock: 15, images: [] },
      { combo: { material: "Walnut", finish: "Stained" }, sku: "MCT-WAL-STN", price: 499, stock: 0, images: [] },
    ],
    variantValues: {
      material: ["Oak", "Walnut", "Metal"],
      finish: ["Natural", "Stained", "Painted"],
    },
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
];

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to generate slug
export const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
