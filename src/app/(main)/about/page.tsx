
import { Award, Target, Eye, BookOpen, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/data-loader';

function PageHeader({title, tagline}: {title: string, tagline: string}) {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">About {title}</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          {tagline}
        </p>
      </div>
    </div>
  );
}

const iconMap = {
    Target: <Target className="h-8 w-8 text-accent" />,
    Eye: <Eye className="h-8 w-8 text-accent" />,
    Award: <Award className="h-8 w-8 text-accent" />,
    Default: <BookOpen className="h-8 w-8 text-accent" />,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader title={settings.siteName} tagline={settings.tagline} />
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Welcome to {settings.siteName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a passion for knowledge and a commitment to student growth, PIISS stands as a beacon of modern education. We blend rigorous academic programs with a strong emphasis on moral and ethical values, preparing our students not just for exams, but for life.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our dedicated faculty, state-of-the-art facilities, and a vibrant community create an inspiring learning atmosphere where every student is encouraged to explore their interests and talents.
              </p>
              <Button>
                <Download className="mr-2" />
                Download Prospectus
              </Button>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="https://placehold.co/600x400.png"
                alt="School Campus"
                fill
                className="object-cover"
                data-ai-hint="school campus"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.missionVision.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background">
                <CardHeader>
                    <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
                        {iconMap[feature.icon as keyof typeof iconMap] || iconMap.Default}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="pt-2">{feature.description}</CardDescription>
                </CardHeader>
                </Card>
            ))}
            </div>
        </div>
      </section>
    </>
  );
}
