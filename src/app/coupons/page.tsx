'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Gift, Scissors, Sparkles, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { CouponGame } from '@/lib/types';
import Confetti from 'react-confetti';
import { useToast } from '@/hooks/use-toast';

function CouponBox({
  coupon,
  isCorrect,
  isFlipped,
  onClick,
  disabled,
}: {
  coupon: string;
  isCorrect: boolean;
  isFlipped: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className={cn(
        'aspect-square w-full perspective-1000',
        !disabled && 'cursor-pointer'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={cn(
          'relative h-full w-full preserve-3d transition-transform duration-700',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div className="absolute backface-hidden h-full w-full rounded-lg bg-gradient-to-br from-primary to-primary/70 flex flex-col items-center justify-center p-4 shadow-lg">
          <Gift className="h-1/2 w-1/2 text-primary-foreground" />
          <p className="text-primary-foreground font-bold text-lg mt-2 text-center">
            اختر واكسب
          </p>
        </div>
        {/* Back */}
        <div
          className={cn(
            'absolute backface-hidden h-full w-full rounded-lg flex flex-col items-center justify-center p-2 text-center rotate-y-180 shadow-lg',
            isCorrect
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-destructive to-red-700'
          )}
        >
          {isCorrect ? (
            <>
              <Sparkles className="h-8 w-8 text-white" />
              <p className="font-bold text-white mt-2">مبروك!</p>
              <p className="text-white text-sm">استخدم كود:</p>
              <p className="font-mono text-lg font-bold text-yellow-300 bg-black/20 px-2 py-1 rounded-md mt-1">
                {coupon}
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8 text-white" />
              <p className="font-bold text-white mt-2">حظ أوفر!</p>
              <p className="text-white text-sm">هذا الكوبون غير صحيح</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const couponGameRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'couponGames', 'active') : null),
    [firestore]
  );
  const { data: couponGame, isLoading } = useDoc<CouponGame>(couponGameRef);

  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const played = localStorage.getItem('hasPlayedCouponGame');
    if (played) {
      setHasPlayed(true);
    }
  }, []);

  const handleBoxClick = (index: number) => {
    if (hasPlayed || flippedIndex !== null) return;

    setFlippedIndex(index);
    localStorage.setItem('hasPlayedCouponGame', 'true');
    setHasPlayed(true);

    if (couponGame && index === couponGame.correctCouponIndex) {
      setShowConfetti(true);
      toast({
        title: '🎉 تهانينا! لقد فزت بخصم!',
        description: `استخدم الكود ${couponGame.coupons[index].value} للحصول على خصم ${couponGame.discountPercentage}%`,
        duration: 10000,
      });
    }
  };

  const handleReset = () => {
    localStorage.removeItem('hasPlayedCouponGame');
    setHasPlayed(false);
    setFlippedIndex(null);
    setShowConfetti(false);
  };
  
  if (!isClient || isLoading) {
    return (
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8 max-w-6xl mx-auto">
            {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  if (!couponGame) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Scissors className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-8 text-4xl font-headline font-bold">كوبونات الخصم</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          لا توجد لعبة كوبونات نشطة حاليًا.
        </p>
        <p className="mt-2 text-muted-foreground">
          اطلب من مدير المتجر إعداد لعبة جديدة!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">جرّب حظك واربح كوبون خصم!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          لديك محاولة واحدة فقط. اختر صندوقًا واكتشف ما إذا كنت محظوظًا اليوم!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8 max-w-6xl mx-auto">
        {couponGame.coupons.map((coupon, index) => (
          <CouponBox
            key={index}
            coupon={coupon.value}
            isCorrect={index === couponGame.correctCouponIndex}
            isFlipped={flippedIndex === index}
            onClick={() => handleBoxClick(index)}
            disabled={hasPlayed}
          />
        ))}
      </div>
      
      {hasPlayed && (
        <Card className="mt-12 max-w-md mx-auto text-center bg-secondary">
          <CardContent className="p-6">
             <h3 className="text-xl font-semibold">
                {flippedIndex === couponGame.correctCouponIndex
                ? 'لقد فزت!'
                : 'لقد انتهت محاولتك.'}
            </h3>
            <p className="text-muted-foreground mt-2">
                 {flippedIndex === couponGame.correctCouponIndex
                ? `استخدم الكود أعلاه للحصول على خصمك. الكود صالح للاستخدام مرة واحدة.`
                : 'شكرًا للعب! يمكنك العودة لاحقًا لتجربة حظك مرة أخرى في الألعاب القادمة.'}
            </p>
             {process.env.NODE_ENV === 'development' && (
                <Button onClick={handleReset} variant="link" className="mt-4">
                    (للمطور) إعادة تعيين اللعبة
                </Button>
            )}
          </CardContent>
        </Card>
      )}

       <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
