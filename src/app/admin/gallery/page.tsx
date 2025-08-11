
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition, useRef } from "react";
import { getGalleryImages } from "@/lib/data-loader";
import { createGalleryImage, deleteGalleryImage } from "@/lib/actions";
import type { GalleryImage } from "@/types";
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

function GalleryPage() {
    const { toast } = useToast();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const data = await getGalleryImages();
            setImages(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch gallery images.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleDelete = (id?: number) => {
        if (!id) return;
        startTransition(async () => {
            const result = await deleteGalleryImage(id);
             if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchImages();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }
    
    const handleAddImageAction = async (formData: FormData) => {
        const result = await createGalleryImage(formData);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            await fetchImages();
            formRef.current?.reset();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Manage Gallery</h2>
            
             <Card>
                <CardHeader>
                    <CardTitle>Add New Image</CardTitle>
                    <CardDescription>Upload a new image to the website's gallery.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAddImageAction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="src">Image File</Label>
                                <Input id="src" name="src" type="file" accept="image/*" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Science Fair 2024" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="A short description of the image." required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hint">AI Hint</Label>
                            <Input id="hint" name="hint" placeholder="e.g., student project" required />
                        </div>
                        <Button type="submit">
                            <PlusCircle className="mr-2" />
                            Add Image
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Gallery Images</CardTitle>
                    <CardDescription>View and delete images from the gallery.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Preview</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading images...</TableCell>
                                </TableRow>
                            ) : images.length > 0 ? images.map(image => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                        <Image src={image.src} alt={image.alt} width={100} height={60} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{image.title}</TableCell>
                                    <TableCell>{image.description}</TableCell>
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
                                                        This will permanently delete the image from the gallery.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(image.id)} disabled={isPending}>
                                                        {isPending ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No images found in gallery.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(GalleryPage);
