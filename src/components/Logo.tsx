import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Store } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Store className="h-7 w-7 text-primary" />
      <div className="flex flex-col">
        <span className="font-headline text-2xl font-bold leading-none">
          <span className="text-foreground">Do</span>
          <span className="text-primary">m</span>
          <span className="text-foreground">a</span>
        </span>
        <span className="text-xs text-muted-foreground">Online Shop</span>
      </div>
    </Link>
  );
}
