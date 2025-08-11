'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchComponent() {
  return (
    <form action="/search" method="GET" className="relative hidden lg:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Smart Search..."
        className="w-full rounded-full bg-background pl-9 pr-4 h-10"
        aria-label="Search website"
      />
    </form>
  );
}

export function MobileSearch() {
  return (
    <form action="/search" method="GET" className="flex w-full items-center gap-2">
      <Input
        type="search"
        name="q"
        placeholder="Smart Search..."
        className="flex-1"
        aria-label="Search website"
      />
      <Button type="submit" size="icon" variant="default">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
