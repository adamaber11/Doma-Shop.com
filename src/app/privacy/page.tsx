import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">سياسة الخصوصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-muted-foreground">
          <p>
            خصوصيتك تهمنا. نحن نعمل حاليًا على صياغة سياسة الخصوصية الخاصة بنا لتكون واضحة وشفافة.
          </p>
          <p>
            قريبًا، ستجد هنا جميع المعلومات المتعلقة بكيفية جمعنا واستخدامنا وحماية بياناتك الشخصية.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
