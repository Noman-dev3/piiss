import type { Teacher } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Star, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface TeacherCardProps {
  teacher: Teacher;
}

const DetailRow = ({ label, value }: { label: string, value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground text-right">{value}</span>
        </div>
    );
};


export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background pt-8 pb-6 px-6 flex flex-col">
        <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 via-primary/50 to-primary/80 flex items-center justify-center mx-auto overflow-hidden">
                 {teacher.imageUrl ? (
                    <Image
                        src={teacher.imageUrl}
                        alt={`Photo of ${teacher.name}`}
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <User className="w-16 h-16 text-primary" />
                )}
            </div>
            <div className="absolute -top-1 right-[calc(50%-4rem)] bg-accent p-2 rounded-full shadow-md">
                <Star className="w-4 h-4 text-white fill-white" />
            </div>
        </div>

        <h3 className="text-xl font-bold text-primary">{teacher.name}</h3>
        {teacher.role && <p className="text-sm text-muted-foreground mb-4">{teacher.role}</p>}

        {teacher.subject && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 mx-auto">
                <BookOpen className="mr-2" />
                {teacher.subject}
            </Badge>
        )}
      
      <CardContent className="space-y-4 text-sm text-left p-0 flex-grow flex flex-col justify-end">
          <DetailRow label="Experience" value={teacher.experience} />
          <hr/>
          <DetailRow label="Department" value={teacher.department} />
           <hr/>
          <DetailRow label="Qualification" value={teacher.qualification} />
      </CardContent>
    </Card>
  );
}
