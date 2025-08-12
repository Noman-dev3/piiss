
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) {
      setError("No teacher ID found in URL.");
      setLoading(false);
      return;
    };
    
    const fetchTeacher = async () => {
      try {
        const data = await getSingleTeacher(params.id as string);
        if (data) {
          setTeacher(data);
        } else {
          setError("Teacher not found.");
        }
      } catch (err) {
        console.error("Failed to fetch teacher:", err);
        setError("Failed to load teacher data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacher();
  }, [params.id]);

  const renderContent = () => {
    if (loading) {
       return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-24" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive">{error}</p>;
    }

    if (teacher) {
      return <TeacherForm initialData={teacher} />;
    }

    return <p>No teacher data available.</p>;
  }

  return (
    <div className="space-y-6">
       <Button asChild variant="outline" size="sm">
          <Link href="/admin/teachers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Teachers
          </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Teacher Profile</CardTitle>
          <CardDescription>Make changes to the teacher's profile below.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(EditTeacherPage);
