'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentsCsv, uploadResultsJson } from "@/lib/actions";
import type { Student, ReportCard } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { getStudents, getReportCards } from "@/lib/data-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info } from "lucide-react";

type StudentWithReportCount = Student & { reportCount: number };

function StudentsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [students, setStudents] = useState<StudentWithReportCount[]>([]);
    
    const fetchStudentsAndReports = async () => {
        const studentsData = await getStudents();
        const studentsWithCounts = await Promise.all(
            studentsData.map(async (student) => {
                const reports = await getReportCards(student.id);
                return { ...student, reportCount: reports.length };
            })
        );
        setStudents(studentsWithCounts);
    };

    useEffect(() => {
        fetchStudentsAndReports();
    }, []);

    const handleStudentsUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadStudentsCsv(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchStudentsAndReports();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const handleResultsUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadResultsJson(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchStudentsAndReports();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Students & Results</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Students</CardTitle>
                        <CardDescription>Upload a CSV file to add or update student data. The file must include an 'id' column.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>CSV Format</AlertTitle>
                            <AlertDescription>
                                Required columns: `id`, `rollNo`, `name`, `class`, `section`.
                            </AlertDescription>
                        </Alert>
                        <form action={handleStudentsUpload} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="students-csv">Student Data (.csv)</Label>
                                <Input id="students-csv" name="file" type="file" accept=".csv" required />
                            </div>
                            <Button type="submit" disabled={isPending}>
                                <FileUp className="mr-2" />
                                {isPending ? 'Uploading...' : 'Upload Students CSV'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Results</CardTitle>
                        <CardDescription>Upload a JSON file to add new report cards for existing students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                             <Info className="h-4 w-4" />
                            <AlertTitle>JSON Format</AlertTitle>
                            <AlertDescription>
                                Should be an array of result objects. Each object must have a `rollNo` that matches an existing student.
                            </AlertDescription>
                        </Alert>
                        <form action={handleResultsUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="results-json">Report Cards (.json)</Label>
                                <Input id="results-json" name="file" type="file" accept=".json" required />
                            </div>
                            <Button type="submit" disabled={isPending}>
                                <FileUp className="mr-2" />
                                {isPending ? 'Uploading...' : 'Upload Results JSON'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Results Loaded</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length > 0 ? students.map(student => (
                                <TableRow key={student.rollNo}>
                                    <TableCell>{student.rollNo}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.class} - {student.section}</TableCell>
                                    <TableCell>
                                        {student.reportCount > 0 ? `${student.reportCount} report(s)` : 'No'}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No students found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(StudentsPage);
