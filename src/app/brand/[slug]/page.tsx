
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import { firestore } from '@/firebase/server'; // استيراد من ملف الخادم الجديد

// تعريف واجهة الخصائص (props) لمكونات الخادم
interface PageProps {
  params: { slug: string };
}

// دالة لجلب المنتجات حسب العلامة التجارية من جهة الخادم
async function getProductsByBrand(brandName: string): Promise<Product[] | null> {
  try {
    const productsRef = firestore.collection('products');
    // استخدام where للبحث عن المنتجات التي تطابق اسم العلامة التجارية
    const snapshot = await productsRef.where('brand', '==', brandName).get();
    
    if (snapshot.empty) {
      return []; // إرجاع مصفوفة فارغة إذا لم يتم العثور على منتجات
    }

    const products: Product[] = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    return null; // إرجاع null في حالة حدوث خطأ
  }
}

// تعريف المكون كـ async ليتمكن من جلب البيانات
export default async function BrandPage({ params }: PageProps) {
  // فك ترميز الـ slug للحصول على اسم العلامة التجارية الصحيح
  const brandName = decodeURIComponent(params.slug);
  const products = await getProductsByBrand(brandName);

  // في حالة حدوث خطأ أثناء جلب البيانات
  if (products === null) {
    return <div className="text-center py-20">حدث خطأ أثناء جلب المنتجات.</div>;
  }
  
  // إذا لم يتم العثور على منتجات، يمكن عرض صفحة "غير موجود"
  // أو عرض رسالة للمستخدم. هنا نعرض رسالة.
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        منتجات {brandName}
      </h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            لا توجد منتجات متاحة لهذه العلامة التجارية حاليًا.
          </p>
        </div>
      )}
    </div>
  );
}
