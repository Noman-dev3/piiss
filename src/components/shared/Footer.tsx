
import Link from 'next/link';
import { Logo } from './Logo';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { getSiteSettings } from '@/lib/data-loader';

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo siteName={settings.siteName} siteTagline={settings.tagline}/>
            <p className="text-sm text-muted-foreground">
              {settings.tagline}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/admissions" className="text-muted-foreground hover:text-primary">Admissions</Link></li>
              <li><Link href="/events" className="text-muted-foreground hover:text-primary">Events</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-primary">News</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{settings.address}</li>
              <li>noman.dev3@gmail.com</li>
              <li>{settings.phone}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
