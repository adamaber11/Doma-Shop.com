import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">سياسة الخصوصية</CardTitle>
          <CardDescription>آخر تحديث: 24 يوليو 2024</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">1. مقدمة</h2>
                <p>نحن في "Doma Online Shop" ("المتجر"، "نحن") ملتزمون بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا والكشف عن معلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">2. المعلومات التي نجمعها</h2>
                <p>قد نجمع أنواعًا مختلفة من المعلومات، بما في ذلك:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>المعلومات الشخصية:</strong> مثل الاسم، وعنوان البريد الإلكتروني، ورقم الهاتف، وعنوان الشحن عند إنشاء حساب أو إجراء عملية شراء.</li>
                    <li><strong>بيانات المعاملات:</strong> تفاصيل حول المنتجات التي تشتريها وتفاصيل الدفع والشحن.</li>
                    <li><strong>بيانات الاستخدام:</strong> معلومات حول كيفية تفاعلك مع موقعنا، مثل الصفحات التي تزورها والمنتجات التي تشاهدها.</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">3. كيف نستخدم معلوماتك</h2>
                <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>لمعالجة طلباتك وتوصيلها.</li>
                    <li>لإدارة حسابك وتزويدك بدعم العملاء.</li>
                    <li>للتواصل معك بخصوص طلباتك والعروض الترويجية وتحديثات المتجر.</li>
                    <li>لتحسين وتخصيص تجربتك على موقعنا.</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">4. مشاركة المعلومات</h2>
                <p>نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي الخدمة الموثوقين الذين يساعدوننا في تشغيل أعمالنا (مثل شركات الشحن ومعالجي الدفع)، بشرط أن يوافقوا على الحفاظ على سرية هذه المعلومات.</p>
            </section>

             <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">5. أمن البيانات</h2>
                <p>نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">6. التغييرات على هذه السياسة</h2>
                <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">7. تواصل معنا</h2>
                <p>إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر صفحة <a href="/contact" className="text-primary hover:underline">تواصل معنا</a>.</p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
