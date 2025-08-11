'use client';

import { useEffect, useState, useMemo } from 'react';
import { TeacherCard } from '@/components/TeacherCard';
import type { Teacher } from '@/types';
import { getTeachers } from '@/lib/data-loader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Our Faculty</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Meet the dedicated professionals who make our school exceptional.
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    )
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Failed to load teachers", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const subjects = useMemo(() => ['all', ...Array.from(new Set(teachers.map(t => t.subject)))], [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || teacher.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [teachers, searchTerm, subjectFilter]);

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
         { !loading && filteredTeachers.length === 0 && (
            <div className="text-center col-span-full py-16">
                <h3 className="text-xl font-semibold">No teachers found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter.</p>
            </div>
        )}
      </div>
    </>
  );
}
