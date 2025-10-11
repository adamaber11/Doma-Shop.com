import type { Product, Order } from './types';
import { PlaceHolderImages } from './placeholder-images';

function getImageUrl(id: string): [string, string, string] {
    const placeholder = PlaceHolderImages.find(p => p.id === id);
    if (placeholder) {
        return [placeholder.imageUrl, placeholder.imageHint, placeholder.description];
    }
    return ["https://picsum.photos/seed/default/600/800", "placeholder", "Default placeholder image"];
}

const [img1, hint1, desc1] = getImageUrl('prod-1');
const [img2, hint2, desc2] = getImageUrl('prod-2');
const [img3, hint3, desc3] = getImageUrl('prod-3');
const [img4, hint4, desc4] = getImageUrl('prod-4');
const [img5, hint5, desc5] = getImageUrl('prod-5');
const [img6, hint6, desc6] = getImageUrl('prod-6');
const [img7, hint7, desc7] = getImageUrl('prod-7');
const [img8, hint8, desc8] = getImageUrl('prod-8');

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'ساعة يد أنيقة',
    description: desc1,
    price: 1250,
    imageUrl: img1,
    imageHint: hint1,
    rating: 4.8,
    category: 'Accessories',
  },
  {
    id: 'prod-2',
    name: 'دفتر جلدي يدوي الصنع',
    description: desc2,
    price: 350,
    imageUrl: img2,
    imageHint: hint2,
    rating: 4.9,
    category: 'Stationery',
  },
  {
    id: 'prod-3',
    name: 'نظارات شمسية مصممة',
    description: desc3,
    price: 850,
    imageUrl: img3,
    imageHint: hint3,
    rating: 4.7,
    category: 'Accessories',
  },
  {
    id: 'prod-4',
    name: 'قلم حبر معدني',
    description: desc4,
    price: 520,
    imageUrl: img4,
    imageHint: hint4,
    rating: 4.6,
    category: 'Stationery',
  },
  {
    id: 'prod-5',
    name: 'وشاح حريري فاخر',
    description: desc5,
    price: 480,
    imageUrl: img5,
    imageHint: hint5,
    rating: 4.8,
    category: 'Accessories',
  },
  {
    id: 'prod-6',
    name: 'حقيبة عمل جلدية',
    description: desc6,
    price: 2100,
    imageUrl: img6,
    imageHint: hint6,
    rating: 4.9,
    category: 'Bags',
  },
  {
    id: 'prod-7',
    name: 'مجموعة شموع عطرية',
    description: desc7,
    price: 220,
    imageUrl: img7,
    imageHint: hint7,
    rating: 4.5,
    category: 'Home',
  },
  {
    id: 'prod-8',
    name: 'سماعات رأس عالية الجودة',
    description: desc8,
    price: 1500,
    imageUrl: img8,
    imageHint: hint8,
    rating: 4.7,
    category: 'Electronics',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    date: '2023-10-26',
    items: [
      { ...products[0], quantity: 1 },
      { ...products[2], quantity: 1 },
    ],
    total: products[0].price + products[2].price,
    status: 'Delivered',
  },
  {
    id: 'ORD-002',
    date: '2023-10-28',
    items: [{ ...products[5], quantity: 1 }],
    total: products[5].price,
    status: 'Shipped',
  },
  {
    id: 'ORD-003',
    date: '2023-11-01',
    items: [
      { ...products[6], quantity: 2 },
      { ...products[4], quantity: 1 },
    ],
    total: products[6].price * 2 + products[4].price,
    status: 'Processing',
  },
   {
    id: 'ORD-004',
    date: '2023-10-15',
    items: [{ ...products[1], quantity: 1 }],
    total: products[1].price,
    status: 'Cancelled',
  },
];
