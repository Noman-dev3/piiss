'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentsCsv } from "@/lib/actions";
import type { StudentWithReportCount } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { getStudentsWithReportCounts } from "@/lib/data-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info } from "lucide-react";

function StudentsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [students, setStudents] = useState<StudentWithReportCount[]>([]);

    const fetchStudents = async () => {
        const studentsData = await getStudentsWithReportCounts();
        setStudents(studentsData);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleStudentsUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadStudentsCsv(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchStudents();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
            
            <Card>
                <CardHeader>
                    <CardTitle>Upload Students</CardTitle>
                    <CardDescription>Upload a CSV file to add or update student data. This will use 'Roll_Number' as the unique ID.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>CSV Format</AlertTitle>
                        <AlertDescription>
                            Required columns: `Name`, `Roll_Number`, `Class`, `Gender`, `Contact`, `Address`.
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
                    <CardTitle>Current Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Results Loaded</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length > 0 ? students.map(student => (
                                <TableRow key={student.rollNumber}>
                                    <TableCell>{student.rollNumber}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.class}</TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>{student.contact}</TableCell>
                                    <TableCell>
                                        {student.reportCount > 0 ? `Yes (${student.reportCount})` : 'No'}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No students found.</TableCell>
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
