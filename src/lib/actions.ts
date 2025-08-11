
'use server';

import { z } from 'zod';
import { smartSearch } from '@/ai/flows/smart-search';
import { getRawData } from './data-loader';
import { db } from './firebase';
import { ref, push, serverTimestamp, set, child, get, update, remove } from 'firebase/database';
import Papa from 'papaparse';
import type { Student, ReportCard, Teacher, SiteSettings, News, GalleryImage } from '@/types';
import { sendContactFormEmail, sendAdmissionFormEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

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
    
    // Send email notifications
    await sendContactFormEmail(validatedFields.data);

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

  const { supportingDocument, ...restOfData } = validatedFields.data;
  
  // In a real app, you would handle file upload to Firebase Storage here.
  // For now, we'll just save the form data without the file.
  
  try {
    const submissionsRef = ref(db, 'admissionSubmissions');
    const newSubmissionRef = push(submissionsRef);
    await set(newSubmissionRef, {
      ...restOfData,
      submittedAt: serverTimestamp(),
      // In a real scenario, you'd store the file URL from Storage here.
      documentUrl: supportingDocument && supportingDocument.size > 0 ? supportingDocument.name : null,
    });

    // Send email notification
    await sendAdmissionFormEmail(validatedFields.data);

     return { message: `Thank you, ${validatedFields.data.applicantName}! Your admission form has been submitted successfully.` };
  } catch (error) {
     console.error("Error saving admission form submission: ", error);
     return { message: "An error occurred while submitting the form. Please try again." };
  }
}


export async function handleSearch(query: string): Promise<{ results?: string; error?: string }> {
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

const parseCsv = <T>(fileContent: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<T>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
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

const fileToAction = async (formData: FormData, dbPath: string, idKey: string, keyMapping?: Record<string, string>): Promise<UploadResult> => {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        const fileContent = await file.text();
        const parsedData = await parseCsv<any>(fileContent);
        
        const updates: Record<string, any> = {};
        
        parsedData.forEach((item: any) => {
            const id = item[idKey]?.trim();
            if (id) {
                 if (keyMapping) {
                    const newItem: Record<string, any> = {};
                    for (const oldKey in item) {
                        const newKey = keyMapping[oldKey.trim()] || oldKey.trim();
                        newItem[newKey] = item[oldKey];
                    }
                    updates[`${dbPath}/${id}`] = newItem;
                } else {
                   updates[`${dbPath}/${id}`] = item;
                }
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return { success: false, message: `CSV must contain a "${idKey}" column for each entry.` };
        }

        const dbRef = ref(db);
        await update(dbRef, updates);

        return { success: true, message: 'Data uploaded successfully!' };
    } catch (error: any) {
        console.error(`Error uploading to ${dbPath}:`, error);
        return { success: false, message: error.message || 'An error occurred during upload.' };
    }
};

export async function uploadTeachersCsv(formData: FormData): Promise<UploadResult> {
    const keyMapping = {
        'Teacher_ID': 'teacherId',
        'Name': 'name',
        'Contact': 'contact',
        'Salary': 'salary',
        'Photo_Path': 'photoPath',
        'Date_Joined': 'dateJoined'
    };
    return fileToAction(formData, 'teachers', 'Teacher_ID', keyMapping);
}


export async function uploadStudentsCsv(formData: FormData): Promise<UploadResult> {
    const keyMapping = {
        'Name': 'name',
        'Roll_Number': 'rollNumber',
        'Class': 'class',
        'Gender': 'gender',
        'Contact': 'contact',
        'Address': 'address'
    };
    return fileToAction(formData, 'students', 'Roll_Number', keyMapping);
}


export async function uploadResultsJson(formData: FormData): Promise<UploadResult> {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        const fileContent = await file.text();
        let resultsData;
        try {
            resultsData = JSON.parse(fileContent);
        } catch (e) {
            return { success: false, message: 'Invalid JSON file.' };
        }
        
        if (!Array.isArray(resultsData)) {
            resultsData = [resultsData];
        }

        const updates: Record<string, any> = {};
        let newResultsCount = 0;
        let skippedResultsCount = 0;

        for (const result of resultsData) {
            const rollNo = result.roll_number;
            const studentSnapshot = await get(child(ref(db), `students/${rollNo}`));
            
            if (studentSnapshot.exists()) {
                const studentData = studentSnapshot.val();
                const studentId = studentSnapshot.key;
                const existingResults = studentData.results ? Object.values(studentData.results) : [];
                
                const isDuplicate = existingResults.some(
                    (existingResult: any) => existingResult.session === result.session
                );

                if (isDuplicate) {
                    skippedResultsCount++;
                    continue;
                }

                const newResultKey = push(child(ref(db), `students/${studentId}/results`)).key;
                if(newResultKey) {
                    updates[`/students/${studentId}/results/${newResultKey}`] = result;
                    newResultsCount++;
                }
            } else {
                console.warn(`No student found for roll number: ${rollNo}`);
            }
        }

        if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
        }
        
        let message = '';
        if (newResultsCount > 0) {
            message += `${newResultsCount} new results uploaded. `;
        }
        if (skippedResultsCount > 0) {
            message += `${skippedResultsCount} duplicate results were skipped.`;
        }
        if (newResultsCount === 0 && skippedResultsCount === 0) {
            message = 'No new results to upload or no matching students found.';
        }

        return { success: true, message: message.trim() };

    } catch (error: any) {
        console.error(`Error uploading results:`, error);
        return { success: false, message: error.message || 'An error occurred during upload.' };
    }
}


const updateReportCardSchema = z.object({
  studentId: z.string(),
  resultId: z.string(),
  studentName: z.string(),
  rollNumber: z.string(),
  class: z.string().min(1, "Class is required"),
  session: z.string().min(1, "Session is required"),
  grade: z.string().min(1, "Grade is required"),
  subjects: z.array(z.object({
    name: z.string().min(1, 'Subject name is required'),
    marks: z.number().min(0, 'Marks cannot be negative'),
  })).min(1, 'At least one subject is required'),
});


export async function updateReportCard(values: z.infer<typeof updateReportCardSchema>): Promise<UploadResult> {
    const validatedData = updateReportCardSchema.safeParse(values);

    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    const { studentId, resultId, subjects, ...restOfData } = validatedData.data;

    try {
        const reportCardRef = ref(db, `students/${studentId}/results/${resultId}`);
        
        const subjectsAsObject = subjects.reduce((acc, subject) => {
            acc[subject.name] = subject.marks;
            return acc;
        }, {} as Record<string, number>);

        await update(reportCardRef, {
            ...restOfData,
            roll_number: restOfData.rollNumber, 
            subjects: subjectsAsObject,
        });

        return { success: true, message: 'Report card updated successfully.' };
    } catch (error: any) {
        console.error('Error updating report card:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function updateSiteSettings(formData: FormData): Promise<UploadResult> {
    const data = Object.fromEntries(formData.entries());
    
    // Create a mutable copy of the settings
    const currentSettingsSnapshot = await get(ref(db, 'settings'));
    const settings: Partial<SiteSettings> = currentSettingsSnapshot.exists() ? currentSettingsSnapshot.val() : {};

    settings.siteName = data.siteName as string;
    settings.tagline = data.tagline as string;
    settings.phone = data.phone as string;
    settings.address = data.address as string;
    
    if (!settings.about) settings.about = { story: '', stats: [], imageUrl: '' };
    settings.about.story = data.aboutStory as string;
    settings.about.imageUrl = data.aboutImage as string;

    // Reconstruct stats array
    settings.about.stats = [];
    for (let i = 0; i < 4; i++) {
        if (data[`stat_value_${i}`] && data[`stat_label_${i}`]) {
            settings.about.stats.push({
                value: data[`stat_value_${i}`] as string,
                label: data[`stat_label_${i}`] as string,
            });
        }
    }
    
    // Reconstruct mission/vision array
    settings.missionVision = [];
    let i = 0;
    while(data[`mv_title_${i}`] !== undefined) {
         if (data[`mv_title_${i}`]) {
            settings.missionVision.push({
                title: data[`mv_title_${i}`] as string,
                description: data[`mv_description_${i}`] as string,
                icon: data[`mv_icon_${i}`] as string || 'Default',
            });
        }
        i++;
    }

    try {
        await set(ref(db, 'settings'), settings);
        
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/contact');
        revalidatePath('/admin/settings');

        return { success: true, message: 'Site settings updated successfully.' };
    } catch (error: any) {
        console.error('Error updating site settings:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

const newsArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL').min(1, 'Image URL is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

export async function createNewsArticle(values: z.infer<typeof newsArticleSchema>): Promise<UploadResult> {
    const validatedData = newsArticleSchema.safeParse(values);
    if (!validatedData.success) {
        return { success: false, message: 'Invalid data provided.' };
    }
    try {
        const newsRef = ref(db, 'news');
        const newArticleRef = push(newsRef);
        const data: Omit<News, 'id'> = {
            ...validatedData.data,
            date: new Date().toISOString(),
            excerpt: validatedData.data.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...',
        };
        await set(newArticleRef, data);
        revalidatePath('/news');
        revalidatePath('/admin/news');
        return { success: true, message: 'News article created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function updateNewsArticle(values: z.infer<typeof newsArticleSchema>): Promise<UploadResult> {
    const validatedData = newsArticleSchema.safeParse(values);
    if (!validatedData.success || !validatedData.data.id) {
        return { success: false, message: 'Invalid data or missing article ID.' };
    }
    try {
        const { id, ...dataToUpdate } = validatedData.data;
        const articleRef = ref(db, `news/${id}`);
        
        const updatedData = {
            ...dataToUpdate,
            excerpt: dataToUpdate.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...',
        };

        await update(articleRef, updatedData);

        revalidatePath('/news');
        revalidatePath(`/news/${id}`);
        revalidatePath('/admin/news');

        return { success: true, message: 'News article updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteNewsArticle(id: string): Promise<UploadResult> {
    try {
        const articleRef = ref(db, `news/${id}`);
        await remove(articleRef);
        revalidatePath('/news');
        revalidatePath('/admin/news');
        return { success: true, message: 'News article deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

const galleryImageSchema = z.object({
    src: z.string().url(),
    title: z.string().min(1),
    description: z.string().min(1),
    hint: z.string().min(1),
});

export async function createGalleryImage(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = galleryImageSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: 'Invalid data provided for gallery image.' };
    }

    try {
        const snapshot = await get(ref(db, 'gallery'));
        const galleryData = snapshot.val() || [];
        const nextId = galleryData.length > 0 ? Math.max(...galleryData.map((item: GalleryImage) => item.id || 0)) + 1 : 1;
        
        const newImage: GalleryImage = {
            id: nextId,
            src: validatedData.data.src,
            alt: validatedData.data.title, // Use title for alt text
            title: validatedData.data.title,
            description: validatedData.data.description,
            hint: validatedData.data.hint,
        };

        const newGalleryData = [...galleryData, newImage];
        await set(ref(db, 'gallery'), newGalleryData);
        
        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Image added to gallery.' };

    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteGalleryImage(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'gallery'));
        const galleryData = snapshot.val() || [];
        const newGalleryData = galleryData.filter((image: GalleryImage) => image.id !== id);

        await set(ref(db, 'gallery'), newGalleryData);

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Image deleted from gallery.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}
