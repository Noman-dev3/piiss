
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getToppers } from "@/lib/data-loader";
import { createTopper, deleteTopper } from "@/lib/actions";
import type { Topper } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ToppersPage() {
    const { toast } = useToast();
    const [toppers, setToppers] = useState<Topper[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchToppers = async () => {
        setLoading(true);
        try {
            const data = await getToppers();
            setToppers(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch toppers.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToppers();
    }, []);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteTopper(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchToppers();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddTopperAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createTopper(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchToppers();
                formRef.current?.reset();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Star Performers (Toppers)</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New Topper</CardTitle>
                    <CardDescription>Add a new student to the star performers list.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddTopperAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Photo URL</Label>
                            <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/photo.png" required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="e.g., Aarav Sharma" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="class">Class</Label>
                                <Input id="class" name="class" placeholder="e.g., Grade 12 - Science" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="percentage">Percentage/Score</Label>
                            <Input id="percentage" name="percentage" placeholder="e.g., 98.5%" required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : <> <PlusCircle className="mr-2" /> Add Topper </>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Toppers</CardTitle>
                    <CardDescription>View and delete students from the star performers list.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading toppers...</TableCell>
                                </TableRow>
                            ) : toppers.length > 0 ? toppers.map(topper => (
                                <TableRow key={topper.id}>
                                    <TableCell>
                                        <Image src={topper.imageUrl} alt={topper.name} width={50} height={50} className="rounded-full object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{topper.name}</TableCell>
                                    <TableCell>{topper.class}</TableCell>
                                    <TableCell>{topper.percentage}</TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this student from the toppers list.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(topper.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No toppers found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(ToppersPage);
