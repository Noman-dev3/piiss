'use client';

import { useState, useEffect } from 'react';
import type { Student, ReportCard } from '@/types';
import { getStudents, getReportCards } from '@/lib/data-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultCard } from '@/components/ResultCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Check Your Results</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Enter your roll number or name to view your report card.
        </p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{ student: Student; report: ReportCard } | null | 'not_found'>(null);

  useEffect(() => {
    async function loadData() {
      const studentData = await getStudents();
      const reportData = await getReportCards();
      setStudents(studentData);
      setReports(reportData);
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    const foundStudent = students.find(
      s => s.rollNo.toLowerCase() === searchTerm.toLowerCase() || s.name.toLowerCase() === searchTerm.toLowerCase()
    );

    if (foundStudent) {
      const foundReport = reports.find(r => r.rollNo === parseInt(foundStudent.rollNo, 10));
      if (foundReport) {
        setSearchResult({ student: foundStudent, report: foundReport });
      } else {
        setSearchResult('not_found');
      }
    } else {
      setSearchResult('not_found');
    }
  };

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Find Report Card</CardTitle>
                <CardDescription>Enter a student's full name or roll number.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="e.g., 'Aarav Sharma' or '101'"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                </form>
            </CardContent>
        </Card>
        
        <div className="mt-8">
            {searchResult === 'not_found' && (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Found</AlertTitle>
                    <AlertDescription>
                        No student or report card found for the provided details. Please check and try again.
                    </AlertDescription>
                </Alert>
            )}
            {searchResult && typeof searchResult !== 'string' && (
                <ResultCard student={searchResult.student} report={searchResult.report} />
            )}
        </div>
      </div>
    </>
  );
}
