import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">تواصل معنا</CardTitle>
          <CardDescription>
            نحن هنا لمساعدتك. إذا كان لديك أي أسئلة أو استفسارات، فلا تتردد في التواصل معنا.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">البريد الإلكتروني</h3>
              <p className="text-muted-foreground">
                للاستفسارات العامة والمساعدة، يمكنك مراسلتنا عبر البريد الإلكتروني. نهدف للرد في غضون 24 ساعة.
              </p>
              <a href="mailto:support@doma.shop" className="text-primary hover:underline">
                support@doma.shop
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">الهاتف</h3>
              <p className="text-muted-foreground">
                للحصول على مساعدة فورية خلال ساعات العمل (من الأحد إلى الخميس، 9 صباحًا - 5 مساءً).
              </p>
              <a href="tel:+97100000000" className="text-primary hover:underline" dir="ltr">
                +971 00 000 0000
              </a>
            </div>
          </div>
          <div className="text-sm text-muted-foreground pt-4">
            <p>
              شكرًا لاهتمامك بـ {APP_NAME}. نتطلع دائمًا لخدمتك بأفضل شكل ممكن.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
