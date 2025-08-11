import { Award, Target, Eye, BookOpen, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">About PIISS</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Excellence in Education, Foundation for Life.
        </p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: <Target className="h-8 w-8 text-accent" />,
    title: 'Our Mission',
    description: 'To foster a dynamic learning environment that challenges students to achieve their full potential and become compassionate, responsible global citizens.',
  },
  {
    icon: <Eye className="h-8 w-8 text-accent" />,
    title: 'Our Vision',
    description: 'To be a leading educational institution recognized for innovation, academic excellence, and the holistic development of every student.',
  },
  {
    icon: <Award className="h-8 w-8 text-accent" />,
    title: 'Our Values',
    description: 'We are committed to integrity, respect, collaboration, and a lifelong passion for learning, creating a strong foundation for success.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Welcome to Pakistan Islamic International School System</h2>
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
            {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background">
                <CardHeader>
                    <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
                    {feature.icon}
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
