import type { Teacher } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Star, BookOpen } from 'lucide-react';

interface TeacherCardProps {
  teacher: Teacher;
}

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-muted-foreground">{label}</span>
        {label === "Experience" ? (
             <span className="font-semibold text-primary">{value}</span>
        ) : (
             <span className="font-semibold text-foreground text-right">{value}</span>
        )}
    </div>
);

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background pt-8 pb-6 px-6">
        <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-purple-500 to-indigo-600 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 bg-yellow-400 p-2 rounded-full shadow-md">
                <Star className="w-4 h-4 text-white fill-white" />
            </div>
        </div>

        <h3 className="text-xl font-bold text-primary">{teacher.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{teacher.role}</p>

        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6">
            <BookOpen className="mr-2" />
            {teacher.subject}
        </Badge>
      
      <CardContent className="space-y-4 text-sm text-left p-0">
          <DetailRow label="Experience" value={teacher.experience} />
          <hr/>
          <DetailRow label="Department" value={teacher.department} />
           <hr/>
          <DetailRow label="Qualification" value={teacher.qualification} />
      </CardContent>
    </Card>
  );
}
