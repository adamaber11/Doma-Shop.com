
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PopupModal } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const POPUP_DISMISSED_KEY = 'promotionalPopupDismissed';

export default function PromotionalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();

  const popupRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'popupModal') : null),
    [firestore]
  );
  const { data: popupData, isLoading } = useDoc<PopupModal>(popupRef);

  useEffect(() => {
    if (isLoading || !popupData || !popupData.isActive) {
      return;
    }

    const lastDismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastDismissed || new Date().getTime() - parseInt(lastDismissed) > oneDay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show popup after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [popupData, isLoading]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(POPUP_DISMISSED_KEY, new Date().getTime().toString());
  };

  if (!popupData || !popupData.isActive) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-[450px]" />
        ) : (
          <>
            <div className="relative w-full h-[200px]">
              <Image
                src={popupData.imageUrl}
                alt={popupData.title}
                fill
                className="object-cover"
                data-ai-hint={popupData.imageHint}
              />
            </div>
            <div className="p-6 text-center space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">{popupData.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground pt-2">
                  {popupData.content}
                </DialogDescription>
              </DialogHeader>
              <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href={popupData.callToActionLink} onClick={handleClose}>
                  {popupData.callToActionText}
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
