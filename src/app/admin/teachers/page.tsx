'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { uploadTeachersCsv } from "@/lib/actions";
import type { Teacher } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { getTeachers } from "@/lib/data-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info } from "lucide-react";

function TeachersPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const fetchTeachers = async () => {
        const data = await getTeachers();
        setTeachers(data);
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleFileUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadTeachersCsv(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchTeachers(); // Refresh the list
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Teachers</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Teacher Data</CardTitle>
                    <CardDescription>Upload a CSV file to add or update the teacher list. This will overwrite all existing teacher data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>CSV Format</AlertTitle>
                        <AlertDescription>
                            The CSV file must contain the following columns: `id`, `name`, `role`, `subject`, `department`, `experience`, `qualification`, `imageUrl`.
                        </AlertDescription>
                    </Alert>
                    <form action={handleFileUpload} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="teachers-csv">Teacher Data (.csv)</Label>
                            <Input id="teachers-csv" name="file" type="file" accept=".csv" required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            <FileUp className="mr-2" />
                            {isPending ? 'Uploading...' : 'Upload CSV'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Teacher List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Experience</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.length > 0 ? teachers.map(teacher => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.subject}</TableCell>
                                    <TableCell>{teacher.role}</TableCell>
                                    <TableCell>{teacher.experience}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No teachers found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(TeachersPage);
