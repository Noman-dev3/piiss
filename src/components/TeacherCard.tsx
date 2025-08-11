import Image from 'next/image';
import type { Teacher } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Link href={`/teachers/${teacher.id}`} className="group">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden shrink-0">
            <Image
              src={teacher.imageUrl}
              alt={`Photo of ${teacher.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="96px"
              data-ai-hint="teacher portrait"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl group-hover:text-accent transition-colors">{teacher.name}</CardTitle>
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground hover:bg-accent/30">{teacher.subject}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> {teacher.experience} of experience
          </p>
          <p className="text-sm text-foreground/80">{teacher.bio}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
