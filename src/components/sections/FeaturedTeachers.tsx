import { getTeachers } from '@/lib/data-loader';
import { TeacherCard } from '@/components/TeacherCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';

export async function FeaturedTeachers() {
  const allTeachers = await getTeachers();
  const featured = allTeachers.slice(0, 4);

  return (
    <section id="teachers" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
            <Badge className="bg-primary/10 text-primary py-2 px-4 rounded-full font-semibold hover:bg-primary/20">
              <Users className="mr-2 h-4 w-4" />
              Meet Our Faculty
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                World-Class <span className="text-primary">Educators</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our passionate team of expert teachers brings decades of experience and innovative teaching methods to inspire and nurture every student.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
         <div className="text-center mt-12">
            <Button asChild>
                <Link href="/teachers">
                View All Faculty <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
