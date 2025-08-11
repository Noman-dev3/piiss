import { Award, Target, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Welcome to PIISS
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Founded with a passion for knowledge and a commitment to student growth, PIISS stands as a beacon of modern education.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
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
  );
}
