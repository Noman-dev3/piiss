import { getTeachers } from '@/lib/data-loader';
import { TeacherCard } from '@/components/TeacherCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export async function FeaturedTeachers() {
  const allTeachers = await getTeachers();
  const featured = allTeachers.slice(0, 3);

  return (
    <section id="teachers" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="space-y-4 mb-6 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Meet Our Expert Faculty
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                Our dedicated and passionate educators are the heart of our institution.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/teachers">
                View All Teachers <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>
    </section>
  );
}
