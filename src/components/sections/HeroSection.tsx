import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sparkles, GraduationCap, Users, Trophy, BookOpen } from 'lucide-react';
import { getSiteSettings } from '@/lib/data-loader';

const StatCard = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="glassmorphic rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 text-white/80">
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
)

export async function HeroSection() {
  const settings = await getSiteSettings();

  return (
    <section className="relative bg-gradient-to-br from-primary via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full opacity-50 glow"></div>
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-white/10 rounded-full opacity-50 glow delay-1000"></div>
      
      <div className="container mx-auto max-w-7xl px-4 py-20 md:py-32 relative z-10">
        <div className='flex flex-col items-center text-center'>
            <Badge variant="outline" className="glassmorphic border-none text-white backdrop-blur-md mb-6">
                <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                Welcome to the Future of Education
            </Badge>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
              {settings.siteName.split(' ')[0]}
              <br />
              <span className='text-accent'>{settings.siteName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl text-white/80">
              {settings.tagline}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg">
                <Link href="/admissions">Explore Programs</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full text-white hover:bg-white/10 bg-transparent border-white/50">
                <Link href="/contact">
                    Contact Us
                </Link>
              </Button>
            </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard icon={<Users className="h-8 w-8 text-white/80"/>} label="Expert Faculty" />
            <StatCard icon={<GraduationCap className="h-8 w-8 text-white/80"/>} label="Holistic Learning" />
            <StatCard icon={<BookOpen className="h-8 w-8 text-white/80"/>} label="Modern Curriculum" />
            <StatCard icon={<Trophy className="h-8 w-8 text-white/80"/>} label="Top Achievements" />
        </div>
      </div>
    </section>
  );
}
