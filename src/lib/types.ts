import { Timestamp } from "firebase/firestore";

export interface ProductVariant {
  color: string;
  hex: string;
  imageUrls: string[];
  imageHints: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrls: string[]; // Default images if no variants
  imageHints: string[]; // Default hints
  variants?: ProductVariant[];
  rating: number;
  category: string;
  brand: string;
  sizes?: string[];
  stock: number;
  isFeatured?: boolean;
  isDeal?: boolean;
  isBestSeller?: boolean;
  dealEndDate?: Timestamp;
  material?: string;
  countryOfOrigin?: string;
  features?: string[];
}

export interface CartItem extends Product {
  id: string; // Product ID + optional size + optional color
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Brand {
    id: string;
    name: string;
    logoUrl: string;
    logoHint: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderDate?: Timestamp;
  date?: string; // For mock data compatibility
  totalAmount?: number;
  total?: number; // For mock data compatibility
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: ShippingAddress;
  items?: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  itemPrice: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

    