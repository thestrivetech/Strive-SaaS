/**
 * Marketplace Cart Types
 * TypeScript types for cart functionality
 */

/**
 * Cart item representation
 */
export interface CartItem {
  id: string;
  cartId: string;
  toolId: string;
  bundleId?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Shopping cart representation
 */
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}
