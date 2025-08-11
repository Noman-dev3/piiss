
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createNewsArticle, updateNewsArticle } from '@/lib/actions';
import { News } from '@/types';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { Skeleton } from '@/components/ui/skeleton';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(), // For existing images
  imageFile: z.any()
    .refine((file) => !file || file.size > 0, 'Image is required.')
    .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ).optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
}).refine(data => data.id || data.imageFile, {
  message: 'Image is required for a new article.',
  path: ['imageFile'],
});


type FormValues = z.infer<typeof formSchema>;

interface NewsFormProps {
  initialData?: News;
}

export function NewsForm({ initialData }: NewsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      content: initialData.content || '',
    } : {
      title: '',
      category: '',
      imageUrl: '',
      content: '',
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
        const action = isEditMode ? updateNewsArticle : createNewsArticle;
        const result = await action(formData);
        
        if (result.success) {
          toast({ title: 'Success', description: result.message });
          router.push('/admin/news');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Annual Sports Day Winners" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sports" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                    />
                </FormControl>
                <FormMessage />
                {initialData?.imageUrl && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Current image is set. Upload a new file to replace it.
                    </p>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Article')}
        </Button>
      </form>
    </Form>
  );
}
