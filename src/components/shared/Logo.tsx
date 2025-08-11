import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Back to homepage">
      <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className='hidden sm:block'>
        <div className="font-bold text-lg text-primary">PIISS</div>
        <div className="text-xs text-muted-foreground">Admin Panel</div>
      </div>
    </Link>
  );
}
