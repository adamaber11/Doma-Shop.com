import { redirect } from 'next/navigation';

// The "/shopping" route is conceptually the same as viewing all products.
// We redirect to the main products page to avoid duplicate content.
export default function ShoppingPage() {
  redirect('/products');
}
