import type { Order } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This file now only exports mock order data for demonstration.
// Product data is fetched directly from Firestore.

export const orders: Order[] = [
  {
    id: 'ORD-001',
    date: '2023-10-26',
    total: 2100,
    status: 'Delivered',
  },
  {
    id: 'ORD-002',
    date: '2023-10-28',
    total: 2100,
    status: 'Shipped',
  },
  {
    id: 'ORD-003',
    date: '2023-11-01',
    total: 920,
    status: 'Processing',
  },
   {
    id: 'ORD-004',
    date: '2023-10-15',
    total: 350,
    status: 'Cancelled',
  },
];
