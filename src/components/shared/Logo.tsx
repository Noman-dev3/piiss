import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Back to homepage">
      <div className="size-12 bg-primary rounded-lg flex items-center justify-center">
        <GraduationCap className="h-7 w-7 text-primary-foreground" />
      </div>
      <div className='hidden sm:block'>
        <div className="font-bold text-lg text-primary">Greenfield International School</div>
        <div className="text-xs text-muted-foreground">Excellence in Education</div>
      </div>
    </Link>
  );
}
