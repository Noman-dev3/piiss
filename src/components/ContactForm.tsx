'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm, type FormState } from '@/lib/actions';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export function ContactForm() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(submitContactForm, initialState);
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
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
        <form ref={formRef} action={formAction} className="space-y-6">
           <div className="grid md:grid-cols-2 gap-6">
            <div className='space-y-2'>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" placeholder="Enter your first name" required />
              {getIssue('firstName') && <p className="text-sm text-destructive mt-1">{getIssue('firstName')}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" placeholder="Enter your last name" required />
               {getIssue('lastName') && <p className="text-sm text-destructive mt-1">{getIssue('lastName')}</p>}
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" placeholder="Enter your email" required />
             {getIssue('email') && <p className="text-sm text-destructive mt-1">{getIssue('email')}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" placeholder="Enter your phone number" />
          </div>
          <div className='space-y-2'>
            <Label htmlFor="subject">Subject *</Label>
            <Select name="subject">
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="admissions">Admissions</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {getIssue('subject') && <p className="text-sm text-destructive mt-1">{getIssue('subject')}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" name="message" placeholder="Enter your message" required rows={5} />
            {getIssue('message') && <p className="text-sm text-destructive mt-1">{getIssue('message')}</p>}
          </div>
          <SubmitButton />
        </form>
    </div>
  );
}
