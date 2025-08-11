import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
      <GraduationCap className="h-8 w-8 text-accent" />
      <span className="text-xl font-bold tracking-tight text-primary">
        PIISS
      </span>
    </Link>
  );
}
