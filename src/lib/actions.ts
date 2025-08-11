'use server';

import { z } from 'zod';
import { smartSearch } from '@/ai/flows/smart-search';
import { getRawData, getStudents } from './data-loader';
import { db } from './firebase';
import { ref, push, serverTimestamp, set, child, get } from 'firebase/database';
import Papa from 'papaparse';
import type { Student, ReportCard } from '@/types';

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
  if (!rawData.subject) rawData.subject = '';

  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Please fix the errors below.",
      fields: rawData,
      issues: validatedFields.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message),
    };
  }
  
  try {
    const submissionsRef = ref(db, 'contactSubmissions');
    await push(submissionsRef, {
      ...validatedFields.data,
      submittedAt: serverTimestamp(),
    });
    return { message: "Thank you for your message! We will get back to you shortly." };
  } catch (error) {
    console.error("Error saving contact form submission: ", error);
    return { message: "An error occurred while submitting the form. Please try again." };
  }
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
  supportingDocument: z.any().optional(),
});

export async function submitAdmissionForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = admissionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: "Please fix the errors below.",
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message),
    }
  }

  const { applicantName, supportingDocument, ...restOfData } = validatedFields.data;
  
  // In a real app, you would handle file upload to Firebase Storage here.
  // For now, we'll just save the form data without the file.
  
  try {
    const submissionsRef = ref(db, 'admissionSubmissions');
    await push(submissionsRef, {
      applicantName,
      ...restOfData,
      submittedAt: serverTimestamp(),
      // In a real scenario, you'd store the file URL from Storage here.
      documentUrl: supportingDocument && supportingDocument.size > 0 ? supportingDocument.name : null,
    });
     return { message: `Thank you, ${applicantName}! Your admission form has been submitted successfully.` };
  } catch (error) {
     console.error("Error saving admission form submission: ", error);
     return { message: "An error occurred while submitting the form. Please try again." };
  }
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

type UploadResult = {
    success: boolean;
    message: string;
}

const parseCsv = <T>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<T>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if(results.errors.length) {
                    reject(new Error(results.errors.map(e => e.message).join(', ')));
                } else {
                    resolve(results.data);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

const fileToAction = async (formData: FormData, dbPath: string, idKey: string): Promise<UploadResult> => {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        let dataToUpload: Record<string, any> = {};
        
        if (file.type === 'application/json') {
             const fileContent = await file.text();
             const parsedData = JSON.parse(fileContent);
             parsedData.forEach((item: any) => {
                if (item[idKey]) {
                    dataToUpload[item[idKey]] = item;
                }
             });
        } else {
            const parsedData = await parseCsv<any>(file);
            parsedData.forEach((item: any) => {
                if (item[idKey]) {
                    dataToUpload[item[idKey]] = item;
                }
            });
        }
        
        if (Object.keys(dataToUpload).length === 0) {
            return { success: false, message: `CSV/JSON must contain a "${idKey}" column/property for each entry.` };
        }

        const dbRef = ref(db, dbPath);
        await set(dbRef, dataToUpload);

        return { success: true, message: 'Data uploaded successfully!' };
    } catch (error: any) {
        console.error(`Error uploading to ${dbPath}:`, error);
        return { success: false, message: error.message || 'An error occurred during upload.' };
    }
};

export async function uploadTeachersCsv(formData: FormData): Promise<UploadResult> {
    return fileToAction(formData, 'teachers', 'id');
}

export async function uploadStudentsCsv(formData: FormData): Promise<UploadResult> {
    return fileToAction(formData, 'students', 'Roll_Number');
}

export async function uploadResultsJson(formData: FormData): Promise<UploadResult> {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        const fileContent = await file.text();
        const resultsData: ReportCard[] = JSON.parse(fileContent);

        if (!Array.isArray(resultsData)) {
            return { success: false, message: 'JSON file should contain an array of result objects.' };
        }
        
        const students = await getStudents();
        const studentMapByRollNo = new Map(students.map(s => [s.rollNumber, s.id]));

        for (const result of resultsData) {
            if (!result.roll_number) {
                console.warn('Skipping result without roll_number:', result);
                continue;
            }
            const studentId = result.roll_number;
            if (studentMapByRollNo.has(studentId)) {
                const resultsRef = ref(db, `students/${studentId}/results`);
                await push(resultsRef, result);
            } else {
                console.warn(`No student found for roll number: ${result.roll_number}`);
            }
        }

        return { success: true, message: 'Results uploaded and linked to students successfully!' };
    } catch (error: any) {
        console.error(`Error uploading results:`, error);
        return { success: false, message: error.message || 'An error occurred during upload.' };
    }
}
