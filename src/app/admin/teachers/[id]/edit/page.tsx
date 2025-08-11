
'use client';
import withAuth from "@/lib/withAuth";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { getSingleTeacher } from "@/lib/data-loader";
import type { Teacher } from "@/types";
import { TeacherForm } from "../../_components/TeacherForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EditTeacherPage() {
  const params = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchTeacher = async () => {
      try {
        const data = await getSingleTeacher(params.id);
        setTeacher(data);
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [params.id]);

  return (
    <div className="space-y-6">
       <Button asChild variant="outline" size="sm">
          <Link href="/admin/teachers">
              <ArrowLeft className="mr-2" />
              Back to All Teachers
          </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Teacher Profile</CardTitle>
          <CardDescription>Make changes to the teacher's profile below.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
          ) : teacher ? (
            <TeacherForm initialData={teacher} />
          ) : (
            <p>Teacher not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(EditTeacherPage);
