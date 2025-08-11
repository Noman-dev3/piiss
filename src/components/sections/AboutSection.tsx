
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/data-loader';

export async function AboutSection() {
  const settings = await getSiteSettings();
  const story = settings.about?.story;
  const stats = settings.about?.stats;

  return (
    <section id="about" className="py-16 md:py-32 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-primary/10 text-primary py-2 px-4 rounded-full font-semibold hover:bg-primary/20">
              <GraduationCap className="mr-2 h-4 w-4" />
              About Our School
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold">
              Our <span className="text-primary">Story</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              {story}
            </p>

            <div className="grid grid-cols-2 gap-y-8">
              {stats?.map((stat) => (
                <div key={stat.label}>
                  <p className={`text-4xl font-bold text-primary`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[450px] rounded-3xl overflow-hidden p-4 bg-gradient-to-br from-primary/20 to-accent/20">
             <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                    src="https://placehold.co/600x800.png"
                    alt="Classroom"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    data-ai-hint="empty classroom"
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
