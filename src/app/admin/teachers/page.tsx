
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { uploadTeachersCsv, deleteTeacher } from "@/lib/actions";
import type { Teacher } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { getTeachers } from "@/lib/data-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function TeachersPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        setLoading(true);
        const data = await getTeachers();
        setTeachers(data);
        setLoading(false);
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

    const handleDelete = (id?: string) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteTeacher(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchTeachers();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manage Teachers</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Teacher List</CardTitle>
                    <CardDescription>View, add, or delete teacher profiles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading teachers...</TableCell>
                                </TableRow>
                            ) : teachers.length > 0 ? teachers.map(teacher => (
                                <TableRow key={teacher.id}>
                                    <TableCell>
                                        <Image src={teacher.imageUrl || 'https://placehold.co/40x40.png'} alt={teacher.name} width={40} height={40} className="rounded-full object-cover" />
                                    </TableCell>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.subject}</TableCell>
                                    <TableCell>{teacher.contact}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this teacher's record.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(teacher.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No teachers found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Upload Teacher Data via CSV</CardTitle>
                    <CardDescription>Bulk upload the teacher list. The system will generate a unique ID for each teacher.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>CSV Format</AlertTitle>
                        <AlertDescription>
                             The CSV file must contain the following columns: `name`, `contact`, `salary`, `dateJoined`, `subject`, `role`, `experience`, `department`, `qualification`, `bio`, and `imageUrl`. The `imageUrl` should be a publicly accessible URL.
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
        </div>
    );
}

export default withAuth(TeachersPage);
