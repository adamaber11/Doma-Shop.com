import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">تواصل معنا</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-muted-foreground">
          <p>
            نحن هنا لمساعدتك. هذه الصفحة قيد التطوير حاليًا، ولكننا نعمل على توفير نموذج تواصل قريبًا.
          </p>
          <p>
            في الوقت الحالي، يمكنك الوصول إلينا عبر البريد الإلكتروني (الخيالي): support@doma.shop
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
