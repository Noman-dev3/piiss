
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getTestimonials } from "@/lib/data-loader";
import { createTestimonial, deleteTestimonial } from "@/lib/actions";
import type { Testimonial } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function TestimonialsPage() {
    const { toast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const data = await getTestimonials();
            setTestimonials(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch testimonials.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDelete = async (id?: number) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteTestimonial(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchTestimonials();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddTestimonialAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createTestimonial(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchTestimonials();
                formRef.current?.reset();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Testimonials</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New Testimonial</CardTitle>
                    <CardDescription>Add a new testimonial to display on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddTestimonialAction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="e.g., John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="alumni">Alumni</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quote">Quote</Label>
                            <Textarea id="quote" name="quote" placeholder="Enter the testimonial quote here." required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : <> <PlusCircle className="mr-2" /> Add Testimonial </>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Testimonials</CardTitle>
                    <CardDescription>View and delete existing testimonials.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Quote</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading testimonials...</TableCell>
                                </TableRow>
                            ) : testimonials.length > 0 ? testimonials.map(testimonial => (
                                <TableRow key={testimonial.id}>
                                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                                    <TableCell className="capitalize">{testimonial.role}</TableCell>
                                    <TableCell>{testimonial.quote.substring(0, 50)}...</TableCell>
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
                                                        This will permanently delete this testimonial.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(testimonial.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No testimonials found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(TestimonialsPage);
