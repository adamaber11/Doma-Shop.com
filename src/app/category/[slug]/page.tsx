
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import { firestore } from '@/firebase/server'; 

// دالة لجلب المنتجات حسب الفئة من جهة الخادم
async function getProductsByCategory(categoryName: string): Promise<Product[] | null> {
    if (!firestore) {
      return [];
    }
    try {
        const productsRef = firestore.collection('products');
        // استخدام where للبحث عن المنتجات التي تطابق اسم الفئة
        const snapshot = await productsRef.where('category', '==', categoryName).get();
        
        if (snapshot.empty) {
            return []; // إرجاع مصفوفة فارغة إذا لم يتم العثور على منتجات
        }

        const products: Product[] = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return null; // إرجاع null في حالة حدوث خطأ
    }
}

// تعريف المكون كـ async ليتمكن من جلب البيانات، مع تعريف الخصائص مباشرة
export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // فك ترميز الـ slug للحصول على اسم الفئة الصحيح
  const categoryName = decodeURIComponent(params.slug);
  const products = await getProductsByCategory(categoryName);
  
  // في حالة حدوث خطأ أثناء جلب البيانات
  if (products === null) {
    return <div className="text-center py-20">حدث خطأ أثناء جلب المنتجات.</div>;
  }
  
    // إذا لم يتم العثور على منتجات، يمكن عرض صفحة "غير موجود"
    // أو عرض رسالة للمستخدم. هنا نعرض رسالة.
  if (products.length === 0) {
     return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-headline text-4xl font-bold text-center mb-8">
                {categoryName}
            </h1>
            <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
                لا توجد منتجات متاحة في هذه الفئة حاليًا.
            </p>
            </div>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        {categoryName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
