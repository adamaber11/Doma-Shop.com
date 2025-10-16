import type { Order } from './types';

// This file now only exports mock order data for demonstration.
// Product data is fetched directly from Firestore.

// Note: This is mock data. The 'orderDate' is represented as a string
// but in a real scenario, it should be a Firestore Timestamp.
// The 'userId' is also a placeholder.
export const orders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'mock-user-1',
    orderDate: '2023-10-26',
    totalAmount: 2100,
    shippingCost: 50,
    status: 'Delivered',
  },
  {
    id: 'ORD-002',
    userId: 'mock-user-2',
    orderDate: '2023-10-28',
    totalAmount: 2100,
    shippingCost: 50,
    status: 'Shipped',
  },
  {
    id: 'ORD-003',
    userId: 'mock-user-1',
    orderDate: '2023-11-01',
    totalAmount: 920,
    shippingCost: 40,
    status: 'Processing',
  },
   {
    id: 'ORD-004',
    userId: 'mock-user-3',
    orderDate: '2023-10-15',
    totalAmount: 350,
    shippingCost: 60,
    status: 'Cancelled',
  },
];
