import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">سياسة الاسترجاع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-muted-foreground">
          <p>
            رضاك هو أولويتنا. نعمل حاليًا على وضع سياسة استرجاع مرنة وعادلة.
          </p>
          <p>
            سيتم توضيح جميع التفاصيل المتعلقة بعملية الاسترجاع والاستبدال هنا قريبًا.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
