
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateReportCard } from '@/lib/actions';
import { ReportCard, Student } from '@/types';
import { useRouter } from 'next/navigation';
import { Trash, PlusCircle } from 'lucide-react';
import { useTransition } from 'react';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  marks: z.preprocess((val) => Number(val), z.number().min(0, 'Marks cannot be negative')),
});

const formSchema = z.object({
  studentId: z.string(),
  resultId: z.string(),
  studentName: z.string().min(1, "Student name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  class: z.string().min(1, "Class is required"),
  session: z.string().min(1, "Session is required"),
  grade: z.string().min(1, "Grade is required"),
  subjects: z.array(subjectSchema).min(1, 'At least one subject is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditResultFormProps {
  initialData: {
    student: Student;
    report: ReportCard;
  };
}

export function EditResultForm({ initialData }: EditResultFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: initialData.student.id,
      resultId: initialData.report.id,
      studentName: initialData.student.name,
      rollNumber: initialData.report.roll_number,
      class: initialData.report.class,
      session: initialData.report.session,
      grade: initialData.report.grade,
      subjects: Object.entries(initialData.report.subjects || {}).map(([name, marks]) => ({ name, marks })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const result = await updateReportCard(values);
        if (result.success) {
          toast({ title: 'Success', description: 'Report card updated successfully.' });
          router.push('/admin/results');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Grade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Subjects and Marks</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name={`subjects.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.marks`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Marks</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash className="h-4 w-4" />
                   <span className="sr-only">Remove Subject</span>
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => append({ name: '', marks: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
