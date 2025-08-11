
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Check Your Results</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Enter your roll number to view your report card.
        </p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{ student: Student; report: ReportCard } | null | 'not_found'>(null);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const studentData = await getStudents();
      setStudents(studentData);
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    setSearchResult(null);
    setSelectedSession(null);
    setAvailableSessions([]);

    const student = students.find(s => s.rollNumber.toLowerCase() === searchTerm.toLowerCase());

    if (student && student.results) {
      setFoundStudent(student);
      const sessions = Object.values(student.results).map(r => r.session).filter(Boolean);
      setAvailableSessions(sessions);
      if (sessions.length === 1) {
        handleSessionSelect(sessions[0]);
      }
    } else {
      setFoundStudent(null);
      setSearchResult('not_found');
    }
  };

  const handleSessionSelect = (session: string) => {
    setSelectedSession(session);
    if (foundStudent && foundStudent.results) {
        const report = Object.values(foundStudent.results).find(r => r.session === session);
        if (report) {
            setSearchResult({ student: foundStudent, report });
        } else {
            setSearchResult('not_found');
        }
    }
  }

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Find Report Card</CardTitle>
                <CardDescription>Enter a student's roll number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="e.g., '101'"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                </form>
                 {foundStudent && availableSessions.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Session</label>
                        <Select onValueChange={handleSessionSelect} value={selectedSession || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an academic session to view results" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSessions.map(session => (
                                    <SelectItem key={session} value={session}>{session}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
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
