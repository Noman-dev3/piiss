
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getAnnouncements } from "@/lib/data-loader";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions";
import type { Announcement } from "@/types";
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

function AnnouncementsPage() {
    const { toast } = useToast();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch announcements.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteAnnouncement(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchAnnouncements();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddAnnouncementAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createAnnouncement(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchAnnouncements();
                formRef.current?.reset();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Announcements</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New Announcement</CardTitle>
                    <CardDescription>Create a new announcement for the ticker on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddAnnouncementAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Announcement Text</Label>
                            <Textarea id="text" name="text" placeholder="e.g., Admissions for 2025 are now open!" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Link (Optional)</Label>
                            <Input id="link" name="link" placeholder="e.g., /admissions" />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : <> <PlusCircle className="mr-2" /> Add Announcement </>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Announcements</CardTitle>
                    <CardDescription>View and delete announcements from the ticker.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Text</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">Loading announcements...</TableCell>
                                </TableRow>
                            ) : announcements.length > 0 ? announcements.map(announcement => (
                                <TableRow key={announcement.id}>
                                    <TableCell className="font-medium">{announcement.text}</TableCell>
                                    <TableCell>{announcement.link || 'N/A'}</TableCell>
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
                                                        This will permanently delete this announcement.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(announcement.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No announcements found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(AnnouncementsPage);
