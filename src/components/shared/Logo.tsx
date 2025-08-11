
'use client'

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
    isAdmin?: boolean;
    siteName?: string;
    siteTagline?: string;
}

export function Logo({ isAdmin = false, siteName, siteTagline }: LogoProps) {
  const name = isAdmin ? "Admin" : (siteName || "PIISS");
  const tagline = isAdmin ? "Dashboard" : (siteTagline || "School Website");

  return (
    <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-3" aria-label="Back to homepage">
      <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className='hidden sm:block group-data-[collapsible=icon]:hidden'>
        <div className="font-bold text-lg text-primary">{name}</div>
        <div className="text-xs text-muted-foreground">{tagline}</div>
      </div>
    </Link>
  );
}
