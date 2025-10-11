import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

async function getRecommendations(currentProduct: Product) {
  try {
    const productCatalog = products.map(p => p.name).join(', ');
    const browsingHistory = `User viewed: ${currentProduct.name}`;
    const purchaseHistory = 'User has not purchased anything yet.';

    const result = await getProductRecommendations({
      productCatalog,
      browsingHistory,
      purchaseHistory,
    });
    
    const recommendedNames = result.recommendations
      .split(',')
      .map(name => name.trim());
      
    const recommendedProducts = products
      .filter(p => recommendedNames.includes(p.name) && p.id !== currentProduct.id)
      .slice(0, 4);

    return recommendedProducts;
  } catch (error) {
    console.error("Failed to get product recommendations:", error);
    // Fallback to simple category-based recommendations
    return products.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 4);
  }
}

export default async function ProductRecommendations({ currentProduct }: { currentProduct: Product }) {
  const recommendations = await getRecommendations(currentProduct);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-headline text-3xl font-bold text-center mb-8">
        قد يعجبك أيضاً
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
