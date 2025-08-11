import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Shaping Minds, Building Futures
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              At PIISS, we provide a nurturing environment for students to excel academically, creatively, and personally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/admissions">Apply Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
             <Image 
              src="https://placehold.co/600x400.png"
              alt="Students learning in a classroom"
              fill
              priority
              className="object-cover"
              data-ai-hint="students classroom"
             />
             <div className="absolute inset-0 bg-primary/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
