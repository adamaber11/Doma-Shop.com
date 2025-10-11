import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">شروط الخدمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-muted-foreground">
          <p>
            نحن بصدد إعداد شروط الخدمة التي تحكم استخدامك لموقعنا.
          </p>
          <p>
            الهدف هو ضمان علاقة واضحة وعادلة بيننا وبين عملائنا الكرام. يرجى مراجعة هذه الصفحة قريبًا.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
