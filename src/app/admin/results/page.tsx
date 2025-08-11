'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { uploadResultsJson } from "@/lib/actions";
import { useEffect, useState, useTransition } from "react";
import { getAllReportCards } from "@/lib/data-loader";
import type { ReportCard, Student } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info } from "lucide-react";

interface DisplayReportCard extends ReportCard {
  studentName: string;
  studentRollNo: string;
}

function ResultsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [reportCards, setReportCards] = useState<DisplayReportCard[]>([]);

    const fetchReports = async () => {
        const data = await getAllReportCards();
        setReportCards(data);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleResultsUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadResultsJson(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchReports();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
             <h2 className="text-3xl font-bold tracking-tight">Manage Results</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Results</CardTitle>
                    <CardDescription>Upload a JSON file to add new report cards for existing students. The file should be an object where keys are student roll numbers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                         <Info className="h-4 w-4" />
                        <AlertTitle>JSON Format</AlertTitle>
                        <AlertDescription>
                            Should be an object of result objects. Each key must be a `roll_number` that matches an existing student.
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

            <Card>
                <CardHeader>
                    <CardTitle>All Student Results</CardTitle>
                    <CardDescription>This table shows all the individual report cards currently in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Term</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Session</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportCards.length > 0 ? reportCards.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell>{report.studentRollNo}</TableCell>
                                    <TableCell>{report.studentName}</TableCell>
                                    <TableCell>{report.term}</TableCell>
                                    <TableCell>{report.year}</TableCell>
                                    <TableCell>{report.session}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No results found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(ResultsPage);