'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: '/', label: 'Home' },
  { 
    href: '/about', 
    label: 'About',
    dropdown: [
        { href: '/about', label: 'About Us' },
        { href: '/about#mission', label: 'Our Mission' },
        { href: '/about#vision', label: 'Our Vision' },
    ]
  },
  { href: '/admissions', label: 'Admissions' },
  { href: '/results', label: 'Results' },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
            <Logo />
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                        Admin <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <User className='mr-2' /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <Link href="#">Admin Panel</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
              <SheetHeader>
                <Logo />
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
                <Button variant="outline" className="rounded-full w-full">Admin</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
