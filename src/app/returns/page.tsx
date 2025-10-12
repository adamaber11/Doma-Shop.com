import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">سياسة الاسترجاع والاستبدال</CardTitle>
          <CardDescription>رضاكم هو أولويتنا القصوى.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">1. فترة الاسترجاع والاستبدال</h2>
                <p>يمكنك طلب استرجاع أو استبدال المنتجات في غضون 7 أيام من تاريخ استلام الطلب. يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وفي عبوته الأصلية مع جميع الملصقات.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">2. المنتجات غير القابلة للاسترجاع</h2>
                <p>بعض المنتجات غير قابلة للاسترجاع لأسباب صحية، مثل الملابس الداخلية، أو المنتجات المخصصة، أو المنتجات التي تم فتحها واستخدامها.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">3. عملية الاسترجاع</h2>
                <p>لبدء عملية الاسترجاع، يرجى اتباع الخطوات التالية:</p>
                <ul className="list-decimal list-inside space-y-1">
                    <li>تواصل مع فريق خدمة العملاء لدينا عبر صفحة <a href="/contact" className="text-primary hover:underline">تواصل معنا</a> مع ذكر رقم طلبك والمنتجات التي ترغب في إرجاعها.</li>
                    <li>بعد الموافقة على طلبك، سنقوم بترتيب عملية استلام المنتج منك.</li>
                    <li>بمجرد استلام المنتج وفحصه والتأكد من مطابقته للشروط، سنقوم بمعالجة المبلغ المسترد.</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">4. المبالغ المستردة</h2>
                <p>ستتم معالجة المبالغ المستردة إلى طريقة الدفع الأصلية في غضون 7-14 يوم عمل بعد استلام المنتج المرتجع. يرجى ملاحظة أنه قد يتم خصم رسوم الشحن الأصلية من المبلغ المسترد.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">5. المنتجات المعيبة أو التالفة</h2>
                <p>إذا استلمت منتجًا معيبًا أو تالفًا، فيرجى الاتصال بنا فورًا خلال 48 ساعة من الاستلام. سنقوم بترتيب استبدال المنتج أو استرداد كامل المبلغ بما في ذلك رسوم الشحن.</p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
