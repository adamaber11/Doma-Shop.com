import Link from 'next/link';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <span className="font-headline text-2xl font-bold text-primary">
        {APP_NAME}
      </span>
    </Link>
  );
}
