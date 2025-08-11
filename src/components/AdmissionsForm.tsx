'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitAdmissionForm, type FormState } from '@/lib/actions';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UploadCloud } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Submitting...' : 'Submit Application'}
    </Button>
  );
}

export function AdmissionsForm() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(submitAdmissionForm, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.issues) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.message && state.issues) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      })
    }
  }, [state, toast]);

  const getIssue = (path: string) => state.issues?.find(issue => issue.startsWith(path))?.replace(path + ': ', '');

  return (
    <Card className="w-full shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">Admission Application Form</CardTitle>
        <CardDescription>Please fill out the form carefully. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="applicantName">Applicant's Full Name *</Label>
              <Input id="applicantName" name="applicantName" placeholder="e.g., John Doe" required />
              {getIssue('applicantName') && <p className="text-sm text-destructive mt-1">{getIssue('applicantName')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input id="dob" name="dob" type="date" required />
              {getIssue('dob') && <p className="text-sm text-destructive mt-1">{getIssue('dob')}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian's Full Name *</Label>
              <Input id="parentName" name="parentName" placeholder="e.g., Jane Doe" required />
              {getIssue('parentName') && <p className="text-sm text-destructive mt-1">{getIssue('parentName')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent/Guardian's Email *</Label>
              <Input id="parentEmail" name="parentEmail" type="email" placeholder="e.g., jane.doe@email.com" required />
              {getIssue('parentEmail') && <p className="text-sm text-destructive mt-1">{getIssue('parentEmail')}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appliedClass">Applying for Class *</Label>
            <Input id="appliedClass" name="appliedClass" placeholder="e.g., Grade 5" required />
            {getIssue('appliedClass') && <p className="text-sm text-destructive mt-1">{getIssue('appliedClass')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportingDocument">Supporting Document (Optional)</Label>
            <Input id="supportingDocument" name="supportingDocument" type="file" accept=".pdf,.png,.jpg,.jpeg" />
             <p className="text-xs text-muted-foreground">Birth certificate or previous report card. Max 5MB.</p>
            {getIssue('supportingDocument') && <p className="text-sm text-destructive mt-1">{getIssue('supportingDocument')}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
