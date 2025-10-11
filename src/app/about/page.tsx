import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">من نحن</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-muted-foreground">
          <p>
            مرحبًا بك في {process.env.NEXT_PUBLIC_APP_NAME || 'متجرنا'}! نحن فريق من الشغوفين بالجودة والأناقة، ونسعى لتقديم تجربة تسوق فريدة ومميزة.
          </p>
          <p>
            تأسس متجرنا على مبدأ أن الفخامة تكمن في التفاصيل. من اختيار المنتجات بعناية فائقة إلى تصميم تجربة مستخدم سلسة، نضع دائمًا عملائنا في المقام الأول.
          </p>
          <p>
            هذه الصفحة هي مجرد بداية. نعمل حاليًا على تطوير محتوى غني يعكس قصتنا ورؤيتنا بشكل أفضل. شكرًا لكونك جزءًا من رحلتنا.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
