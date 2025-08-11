
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createTeacher, updateTeacher } from '@/lib/actions';
import { Teacher } from '@/types';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  role: z.string().min(1, 'Role is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.string().min(1, 'Experience is required'),
  department: z.string().min(1, 'Department is required'),
  contact: z.string().min(1, 'Contact number is required'),
  dateJoined: z.string().min(1, 'Date joined is required'),
  salary: z.string().min(1, 'Salary is required'),
  bio: z.string().min(10, 'Biography must be at least 10 characters'),
  imageUrl: z.string().optional(),
  imageFile: z.any()
    .refine((file) => !file || file.size > 0, 'Image is required.')
    .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ).optional(),
}).refine(data => data.id || data.imageFile, {
  message: 'Image is required for a new teacher profile.',
  path: ['imageFile'],
});

type FormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
  initialData?: Teacher;
}

export function TeacherForm({ initialData }: TeacherFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      salary: String(initialData.salary),
    } : {
      name: '',
      teacherId: '',
      subject: '',
      role: '',
      qualification: '',
      experience: '',
      department: '',
      contact: '',
      dateJoined: '',
      salary: '',
      bio: '',
      imageUrl: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            const value = values[key as keyof FormValues];
            if (value !== undefined && value !== null) {
                 if (key === 'imageFile') {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                } else {
                    formData.append(key, String(value));
                }
            }
        });

      try {
        const action = isEditMode ? updateTeacher : createTeacher;
        const result = await action(formData);
        
        if (result.success) {
          toast({ title: 'Success', description: result.message });
          router.push('/admin/teachers');
          router.refresh();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="teacherId" render={({ field }) => (
                <FormItem><FormLabel>Teacher ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="qualification" render={({ field }) => (
                <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="experience" render={({ field }) => (
                <FormItem><FormLabel>Experience</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
                <FormItem><FormLabel>Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dateJoined" render={({ field }) => (
                <FormItem><FormLabel>Date Joined</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="salary" render={({ field }) => (
                <FormItem><FormLabel>Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="imageFile" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                </FormControl>
                <FormMessage />
                {initialData?.imageUrl && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Current image is set. Upload a new file to replace it.
                    </p>
                )}
              </FormItem>
            )}
        </div>
        <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem><FormLabel>Biography</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Teacher')}
        </Button>
      </form>
    </Form>
  );
}
