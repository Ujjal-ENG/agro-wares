import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ProductVariant, FlashSale } from "@/types/ecommerce";
import { getFlashSalePrice, isFlashSaleActive } from "@/types/ecommerce";

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  variant: ProductVariant;
  selection: Record<string, string>;
  quantity: number;
  flashSale?: FlashSale;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, sku: string, quantity: number) => void;
  removeFromCart: (productId: string, sku: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to get effective price considering flash sale
const getEffectivePrice = (item: CartItem): number => {
  if (item.flashSale && isFlashSaleActive(item.flashSale)) {
    const flashPrice = getFlashSalePrice(item.variant.price, item.flashSale);
    return flashPrice ?? item.variant.price;
  }
  return item.variant.price;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.variant.sku === item.variant.sku
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variant.sku === item.variant.sku
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sku);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variant.sku === sku ? { ...i, quantity } : i
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string, sku: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variant.sku === sku))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  
  // Calculate total price with flash sale support
  const totalPrice = items.reduce((sum, i) => {
    const effectivePrice = getEffectivePrice(i);
    return sum + effectivePrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Export helper for components to use
export { getEffectivePrice };
