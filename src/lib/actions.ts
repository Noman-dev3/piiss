'use server';

import { z } from 'zod';
import { smartSearch } from '@/ai/flows/smart-search';
import { getRawData } from './data-loader';

const contactSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  // Handle case where select is not touched
  if (!rawData.subject) rawData.subject = '';

  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Please fix the errors below.",
      fields: rawData,
      issues: validatedFields.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message),
    };
  }

  console.log("New Contact Form Submission:");
  console.log("Name:", `${validatedFields.data.firstName} ${validatedFields.data.lastName}`);
  console.log("Email:", validatedFields.data.email);
  console.log("Phone:", validatedFields.data.phone);
  console.log("Subject:", validatedFields.data.subject);
  console.log("Message:", validatedFields.data.message);
  
  return { message: "Thank you for your message! We will get back to you shortly." };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const admissionSchema = z.object({
  applicantName: z.string().min(2, "Applicant name is required."),
  dob: z.string().date("A valid date of birth is required."),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }),
  parentName: z.string().min(2, "Parent name is required."),
  parentEmail: z.string().email("A valid parent email is required."),
  parentPhone: z.string().min(5, "A valid phone number is required."),
  appliedClass: z.string().min(1, "Class is required."),
  previousSchool: z.string().optional(),
  comments: z.string().optional(),
  supportingDocument: z
    .any()
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => !file || file.size === 0 || ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .pdf files are accepted."
    ).optional(),
});

export async function submitAdmissionForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = admissionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      message: "Please fix the errors below.",
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message),
    }
  }

  const { applicantName, parentEmail, supportingDocument } = validatedFields.data;
  
  console.log("New Admission Form Submission for:", validatedFields.data);
  
  if (supportingDocument && supportingDocument.size > 0) {
    console.log("Received document:", supportingDocument.name, "Size:", supportingDocument.size);
    // In a real application, you would upload this file to Firebase Storage here.
    // const fileBuffer = Buffer.from(await supportingDocument.arrayBuffer());
    // ... upload logic ...
  }

  // Here you would save to Firebase DB, send emails, etc.

  return { message: `Thank you, ${applicantName}! Your admission form has been submitted successfully.` };
}


export async function handleSearch(query: string) {
  if (!query) {
    return { results: "" };
  }

  try {
    const rawData = await getRawData();
    const result = await smartSearch({
      query,
      ...rawData,
    });
    return { results: result.results };
  } catch (error) {
    console.error("Smart search failed:", error);
    return { error: 'An error occurred during the search. Please try again.' };
  }
}
