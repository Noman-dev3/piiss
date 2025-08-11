'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitAdmissionForm, type FormState } from '@/lib/actions';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from './ui/textarea';

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
  const [state, formAction] = useActionState(submitAdmissionForm, initialState);
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
          <fieldset className="space-y-6">
            <legend className="text-lg font-medium text-primary mb-4">Applicant Information</legend>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Full Name *</Label>
                <Input id="applicantName" name="applicantName" placeholder="e.g., John Doe" required />
                {getIssue('applicantName') && <p className="text-sm text-destructive mt-1">{getIssue('applicantName')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" name="dob" type="date" required />
                {getIssue('dob') && <p className="text-sm text-destructive mt-1">{getIssue('dob')}</p>}
              </div>
            </div>
            <div className="space-y-2">
                <Label>Gender *</Label>
                <RadioGroup name="gender" className="flex gap-4" defaultValue="male">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                    </div>
                </RadioGroup>
                {getIssue('gender') && <p className="text-sm text-destructive mt-1">{getIssue('gender')}</p>}
            </div>
          </fieldset>
          
           <fieldset className="space-y-6">
             <legend className="text-lg font-medium text-primary mb-4">Parent/Guardian Information</legend>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="parentName">Full Name *</Label>
                <Input id="parentName" name="parentName" placeholder="e.g., Jane Doe" required />
                {getIssue('parentName') && <p className="text-sm text-destructive mt-1">{getIssue('parentName')}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="parentEmail">Email *</Label>
                <Input id="parentEmail" name="parentEmail" type="email" placeholder="e.g., jane.doe@email.com" required />
                {getIssue('parentEmail') && <p className="text-sm text-destructive mt-1">{getIssue('parentEmail')}</p>}
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="parentPhone">Phone Number *</Label>
              <Input id="parentPhone" name="parentPhone" type="tel" placeholder="e.g., +1 555 123 4567" required />
              {getIssue('parentPhone') && <p className="text-sm text-destructive mt-1">{getIssue('parentPhone')}</p>}
            </div>
          </fieldset>

           <fieldset className="space-y-6">
              <legend className="text-lg font-medium text-primary mb-4">Academic Information</legend>
               <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="appliedClass">Applying for Class *</Label>
                    <Input id="appliedClass" name="appliedClass" placeholder="e.g., Grade 5" required />
                    {getIssue('appliedClass') && <p className="text-sm text-destructive mt-1">{getIssue('appliedClass')}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="previousSchool">Previous School (if any)</Label>
                    <Input id="previousSchool" name="previousSchool" placeholder="e.g., Greenfield Middle School" />
                </div>
              </div>
          </fieldset>
          
          <div className="space-y-2">
            <Label htmlFor="supportingDocument">Supporting Document (Optional)</Label>
            <Input id="supportingDocument" name="supportingDocument" type="file" accept=".pdf,.png,.jpg,.jpeg" />
             <p className="text-xs text-muted-foreground">Birth certificate or previous report card. Max 5MB.</p>
            {getIssue('supportingDocument') && <p className="text-sm text-destructive mt-1">{getIssue('supportingDocument')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments (Optional)</Label>
            <Textarea id="comments" name="comments" placeholder="Any other information you would like to share." />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
