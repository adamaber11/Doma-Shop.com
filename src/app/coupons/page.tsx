'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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
  isRevealed,
  isCorrectGuess,
  onClick,
  disabled,
}: {
  coupon: string;
  isRevealed: boolean;
  isCorrectGuess: boolean;
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
          isRevealed && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div className="absolute backface-hidden h-full w-full rounded-lg bg-gradient-to-br from-primary to-primary/70 flex flex-col items-center justify-center p-4 shadow-lg">
          <Gift className="h-1/2 w-1/2 text-primary-foreground" />
          <p className="text-primary-foreground font-bold text-lg mt-2 text-center">
            اخترني الآن
          </p>
        </div>
        {/* Back */}
        <div
          className={cn(
            'absolute backface-hidden h-full w-full rounded-lg flex flex-col items-center justify-center p-2 text-center rotate-y-180 shadow-lg',
            isCorrectGuess
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-destructive to-red-700'
          )}
        >
          {isCorrectGuess ? (
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
              <p className="text-white text-sm">لقد انتهت محاولتك</p>
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
  const { user } = useUser();
  
  const couponGameRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'couponGames', 'active') : null),
    [firestore]
  );
  const { data: couponGame, isLoading } = useDoc<CouponGame>(couponGameRef);

  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number; }>({ width: 0, height: 0 });

  useEffect(() => {
    setIsClient(true);
    const playedStatus = localStorage.getItem('couponGameHasPlayed');
    if (playedStatus === 'true') {
      setHasPlayed(true);
    }
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const canPlay = !hasPlayed;

  const handleBoxClick = (index: number) => {
    if (!canPlay || flippedIndex !== null || !couponGame) return;

    setHasPlayed(true);
    localStorage.setItem('couponGameHasPlayed', 'true');
    setFlippedIndex(index);

    const isCorrect = index === couponGame.correctCouponIndex;

    if (isCorrect) {
      setShowConfetti(true);
      toast({
        title: '🎉 تهانينا! لقد فزت بخصم!',
        description: `استخدم الكود ${couponGame.coupons[index].value} للحصول على خصم ${couponGame.discountPercentage}%`,
        duration: 10000,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'حظ أوفر!',
            description: 'لم يحالفك الحظ هذه المرة.',
        });
    }
  };

  const handleReset = () => {
    localStorage.removeItem('couponGameHasPlayed');
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
  
  const alreadyPlayed = !canPlay || flippedIndex !== null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">جرّب حظك واربح كوبون خصم!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
            {alreadyPlayed
             ? "لقد استخدمت محاولتك الوحيدة. حظًا أوفر في المرة القادمة!"
             : "لديك محاولة واحدة فقط. اختر صندوقًا واكتشف ما إذا كنت محظوظًا!"
            }
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8 max-w-6xl mx-auto">
        {couponGame.coupons.map((coupon, index) => (
          <CouponBox
            key={index}
            coupon={coupon.value}
            isRevealed={flippedIndex === index}
            isCorrectGuess={flippedIndex === index && index === couponGame.correctCouponIndex}
            onClick={() => handleBoxClick(index)}
            disabled={alreadyPlayed}
          />
        ))}
      </div>
      
      {alreadyPlayed && user?.email === 'adamaber50@gmail.com' && process.env.NODE_ENV === 'development' && (
        <Card className="mt-12 max-w-md mx-auto text-center bg-secondary">
          <CardContent className="p-6">
             <h3 className="text-xl font-semibold">
                إعادة تعيين اللعبة (للمطور)
            </h3>
            <Button onClick={handleReset} variant="link" className="mt-2">
                إعادة تعيين المحاولة
            </Button>
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
