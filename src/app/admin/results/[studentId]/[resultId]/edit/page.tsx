
'use client';
import withAuth from "@/lib/withAuth";
import { useEffect, useState } from "react";
import { getSingleReportCard } from "@/lib/data-loader";
import { ReportCard, Student } from "@/types";
import { EditResultForm } from "./_components/EditResultForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageParams {
  studentId: string;
  resultId: string;
}

function EditResultPage({ params }: { params: PageParams }) {
  const [reportCard, setReportCard] = useState<{ student: Student; report: ReportCard } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getSingleReportCard(params.studentId, params.resultId);
        setReportCard(data);
      } catch (error) {
        console.error("Failed to fetch report card:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.studentId, params.resultId]);

  return (
    <div className="space-y-6">
       <Button asChild variant="outline" size="sm">
          <Link href="/admin/results">
              <ArrowLeft className="mr-2" />
              Back to All Results
          </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Report Card</CardTitle>
          <CardDescription>Make changes to the student's report card below. Changes will be saved directly to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
          ) : reportCard ? (
            <EditResultForm initialData={reportCard} />
          ) : (
            <p>Report card not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(EditResultPage);
