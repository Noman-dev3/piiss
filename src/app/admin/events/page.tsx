
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getEvents } from "@/lib/data-loader";
import { createEvent, deleteEvent } from "@/lib/actions";
import type { Event } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";

function EventsPage() {
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await getEvents();
            setEvents(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch events.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        startDeleteTransition(async () => {
            const result = await deleteEvent(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchEvents();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddEventAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createEvent(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchEvents();
                formRef.current?.reset();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New Event</CardTitle>
                    <CardDescription>Create a new event to display on the website.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddEventAction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image File</Label>
                                <Input id="imageUrl" name="imageUrl" type="file" accept="image/*" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Annual Sports Day" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="A short description of the event." required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : <> <PlusCircle className="mr-2" /> Add Event </>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>View and delete events.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading events...</TableCell>
                                </TableRow>
                            ) : events.length > 0 ? events.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <Image src={event.imageUrl} alt={event.title} width={100} height={60} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
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
                                                        This will permanently delete this event.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(event.id)} disabled={isDeleting}>
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No events found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(EventsPage);
