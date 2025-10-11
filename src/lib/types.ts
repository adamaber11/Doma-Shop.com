import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  rating: number;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
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
  quantity: number;
  itemPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}
