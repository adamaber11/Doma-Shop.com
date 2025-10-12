import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">شروط الخدمة</CardTitle>
           <CardDescription>آخر تحديث: 24 يوليو 2024</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">1. الموافقة على الشروط</h2>
                <p>باستخدامك لموقعنا "Doma Online Shop"، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، فيُحظر عليك استخدام هذا الموقع أو الوصول إليه.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">2. استخدام الترخيص</h2>
                <p>يتم منح الإذن بتنزيل نسخة واحدة من المواد (معلومات أو برامج) على موقع الويب للعرض الشخصي غير التجاري المؤقت فقط. هذا هو منح ترخيص، وليس نقل ملكية.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">3. إخلاء المسؤولية</h2>
                <p>يتم توفير المواد على موقعنا على أساس "كما هي". لا نقدم أي ضمانات، صريحة أو ضمنية، وبهذا نخلي مسؤوليتنا وننفي جميع الضمانات الأخرى بما في ذلك، على سبيل المثال لا الحصر، الضمانات الضمنية أو شروط القابلية للتسويق أو الملاءمة لغرض معين.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">4. الحسابات</h2>
                <p>عند إنشاء حساب معنا، يجب عليك تزويدنا بمعلومات دقيقة وكاملة وحديثة في جميع الأوقات. يشكل عدم القيام بذلك خرقًا للشروط، مما قد يؤدي إلى الإنهاء الفوري لحسابك على خدمتنا.</p>
            </section>

             <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">5. عمليات الشراء</h2>
                <p>إذا كنت ترغب في شراء أي منتج أو خدمة متاحة من خلال الخدمة ("الشراء")، فقد يُطلب منك تقديم معلومات معينة ذات صلة بعملية الشراء الخاصة بك بما في ذلك، على سبيل المثال لا الحصر، اسمك وعنوان الشحن ومعلومات الدفع.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">6. القانون الحاكم</h2>
                <p>تخضع هذه الشروط وتُفسر وفقًا لقوانين دولة الإمارات العربية المتحدة، بغض النظر عن تعارضها مع أحكام القانون.</p>
            </section>

             <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">7. التغييرات</h2>
                <p>نحتفظ بالحق، وفقًا لتقديرنا الخاص، في تعديل أو استبدال هذه الشروط في أي وقت. سنحاول تقديم إشعار قبل 30 يومًا على الأقل من دخول أي شروط جديدة حيز التنفيذ.</p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
