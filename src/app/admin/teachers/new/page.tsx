
'use client';
import withAuth from "@/lib/withAuth";
import { TeacherForm } from "../_components/TeacherForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NewTeacherPage() {
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
          <CardTitle>Create New Teacher Profile</CardTitle>
          <CardDescription>Fill out the form below to add a new teacher to the directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(NewTeacherPage);
