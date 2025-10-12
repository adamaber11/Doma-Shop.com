'use client';

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Timestamp;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const calculateTimeLeft = (): TimeLeft | null => {
    const difference = endDate.toMillis() - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial value
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  if (!isClient) {
    // Render a placeholder or nothing on the server to prevent hydration mismatch
    return (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive p-2 rounded-md border border-destructive/20 bg-destructive/10">
            <Timer className="h-4 w-4" />
            <span>جاري تحميل المؤقت...</span>
        </div>
    )
  }

  if (!timeLeft) {
    return (
      <div className="text-center text-sm text-muted-foreground p-2">
        انتهى العرض!
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-destructive p-2 rounded-md border border-destructive/20 bg-destructive/10">
      <Timer className="h-4 w-4" />
      <span className="font-mono">
        {formatNumber(timeLeft.days)}:{formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </span>
      <span>متبقي</span>
    </div>
  );
}
