
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSiteSettings } from '@/lib/data-loader';
import type { SiteSettings } from '@/types';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/results', label: 'Results' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function NavLink({ href, label, currentPath, dropdown, closeMenu }: { href: string; label: string; currentPath: string; dropdown?: {href: string, label: string}[], closeMenu?: () => void }) {
    if (dropdown) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className={cn(
                        'flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary',
                        currentPath.startsWith(href) ? 'text-primary' : 'text-muted-foreground'
                    )}>
                        {label} <ChevronDown className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {dropdown.map(item => (
                         <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} onClick={closeMenu}>{item.label}</Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Link
            href={href}
            onClick={closeMenu}
            className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                currentPath === href ? 'text-primary' : 'text-muted-foreground'
            )}
        >
            {label}
        </Link>
    )
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
            <Logo siteName={settings?.siteName} siteTagline={settings?.tagline} />
             <nav className="hidden items-center gap-6 lg:flex">
                {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} currentPath={pathname} />
                ))}
            </nav>
        </div>
        
        <div className="hidden items-center gap-2 lg:flex">
            <form action="/search" method="GET" className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    name="q"
                    placeholder="Ask me anything..."
                    className="w-full rounded-full bg-secondary pl-9"
                    aria-label="Search website"
                />
            </form>
        </div>
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetHeader>
                <Logo siteName={settings?.siteName} siteTagline={settings?.tagline} />
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                <form action="/search" method="GET" className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="q"
                        placeholder="Ask me anything..."
                        className="w-full rounded-full bg-secondary pl-9"
                        aria-label="Search website"
                    />
                </form>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} currentPath={pathname} closeMenu={() => setMobileMenuOpen(false)} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
