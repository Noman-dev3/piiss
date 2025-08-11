
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getFaqs } from "@/lib/data-loader";
import { createFaq, deleteFaq } from "@/lib/actions";
import type { FAQ } from "@/types";
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

function FAQPage() {
    const { toast } = useToast();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const data = await getFaqs();
            setFaqs(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch FAQs.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleDelete = async (id?: number) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteFaq(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchFaqs();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddFaqAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createFaq(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchFaqs();
                formRef.current?.reset();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage FAQs</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New FAQ</CardTitle>
                    <CardDescription>Add a new frequently asked question and its answer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddFaqAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Input id="question" name="question" placeholder="e.g., What are the school timings?" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="answer">Answer</Label>
                            <Textarea id="answer" name="answer" placeholder="Provide a clear and concise answer." required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : <> <PlusCircle className="mr-2" /> Add FAQ </>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All FAQs</CardTitle>
                    <CardDescription>View and delete existing FAQs.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Answer</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">Loading FAQs...</TableCell>
                                </TableRow>
                            ) : faqs.length > 0 ? faqs.map(faq => (
                                <TableRow key={faq.id}>
                                    <TableCell className="font-medium">{faq.question}</TableCell>
                                    <TableCell>{faq.answer.substring(0, 100)}...</TableCell>
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
                                                        This will permanently delete this FAQ.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(faq.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No FAQs found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(FAQPage);
