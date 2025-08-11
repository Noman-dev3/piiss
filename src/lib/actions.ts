
'use server';

import { z } from 'zod';
import { smartSearch } from '@/ai/flows/smart-search';
import { getRawData } from './data-loader';
import { db, storage } from './firebase';
import { ref, push, serverTimestamp, set, child, get, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Papa from 'papaparse';
import type { Student, ReportCard, Teacher, SiteSettings, News, GalleryImage, Event, Topper, Testimonial, Announcement, FAQ } from '@/types';
import { sendContactFormEmail, sendAdmissionFormEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

// Helper for file uploads
const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileRef = storageRef(storage, `${path}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

const contactSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type FormState = {
  success: boolean;
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
      success: false,
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

    return { success: true, message: "Thank you for your message! We will get back to you shortly." };
  } catch (error) {
    console.error("Error saving contact form submission: ", error);
    return { success: false, message: "An error occurred while submitting the form. Please try again." };
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
      success: false,
      message: "Please fix the errors below.",
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message),
    }
  }

  const { supportingDocument, ...restOfData } = validatedFields.data;
  
  let documentUrl: string | null = null;
  if (supportingDocument instanceof File && supportingDocument.size > 0) {
      documentUrl = await uploadFile(supportingDocument, 'admission-documents');
  }
  
  try {
    const submissionsRef = ref(db, 'admissionSubmissions');
    const newSubmissionRef = push(submissionsRef);
    await set(newSubmissionRef, {
      ...restOfData,
      submittedAt: serverTimestamp(),
      documentUrl: documentUrl,
    });

    // Send email notification
    await sendAdmissionFormEmail(validatedFields.data);

     return { success: true, message: `Thank you, ${validatedFields.data.applicantName}! Your admission form has been submitted successfully.` };
  } catch (error) {
     console.error("Error saving admission form submission: ", error);
     return { success: false, message: "An error occurred while submitting the form. Please try again." };
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
    
    const currentSettingsSnapshot = await get(ref(db, 'settings'));
    const settings: Partial<SiteSettings> = currentSettingsSnapshot.exists() ? currentSettingsSnapshot.val() : {};

    settings.siteName = data.siteName as string;
    settings.tagline = data.tagline as string;
    settings.phone = data.phone as string;
    settings.address = data.address as string;
    
    if (!settings.about) settings.about = { story: '', stats: [], imageUrl: '' };
    settings.about.story = data.aboutStory as string;
    
    const aboutImageFile = formData.get('aboutImage') as File;
    if (aboutImageFile && aboutImageFile.size > 0) {
        settings.about.imageUrl = await uploadFile(aboutImageFile, 'settings');
    }
    
    if (data.about_stats) {
       settings.about.stats = JSON.parse(data.about_stats as string);
    }
    
    if (data.missionVision) {
      settings.missionVision = JSON.parse(data.missionVision as string);
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
  imageFile: z.any().optional(),
  imageUrl: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

const handleNewsArticle = async (formData: FormData, isUpdate: boolean): Promise<UploadResult> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = newsArticleSchema.safeParse(rawData);
    
    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    const { id, imageFile, ...data } = validatedData.data;
    let imageUrl = data.imageUrl;

    if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await uploadFile(imageFile, 'news');
    }

    if (!isUpdate && !imageUrl) {
        return { success: false, message: 'An image is required for a new news article.' };
    }
    
    try {
        const articleData: Omit<News, 'id' | 'date'> = {
            title: data.title,
            category: data.category,
            content: data.content,
            excerpt: data.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...',
            imageUrl: imageUrl || '', // Ensure imageUrl is not undefined
        };
        
        if (isUpdate && id) {
             const articleRef = ref(db, `news/${id}`);
             // Only update imageUrl if a new one was uploaded
             const updateData: Partial<typeof articleData> = {...articleData};
             if (!imageUrl) {
                delete (updateData as any).imageUrl;
             }
             await update(articleRef, updateData);
        } else {
             const newsRef = ref(db, 'news');
             const newArticleRef = push(newsRef);
             await set(newArticleRef, { ...articleData, date: new Date().toISOString() });
        }
        
        revalidatePath('/news');
        if (id) revalidatePath(`/news/${id}`);
        revalidatePath('/admin/news');

        const message = isUpdate ? 'News article updated successfully.' : 'News article created successfully.';
        return { success: true, message };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
};

export async function createNewsArticle(formData: FormData): Promise<UploadResult> {
    return handleNewsArticle(formData, false);
}

export async function updateNewsArticle(formData: FormData): Promise<UploadResult> {
    return handleNewsArticle(formData, true);
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
    src: z.instanceof(File),
    title: z.string().min(1),
    description: z.string().min(1),
    hint: z.string().min(1),
});

export async function createGalleryImage(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = galleryImageSchema.safeParse(rawData);

    if (!validatedData.success) {
        const fileError = validatedData.error.errors.find(e => e.path.includes('src'));
        return { success: false, message: fileError ? 'An image file is required.' : 'Invalid data provided.' };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.src, 'gallery');

        const snapshot = await get(ref(db, 'gallery'));
        const galleryData: GalleryImage[] = snapshot.val() || [];
        const nextId = galleryData.length > 0 ? Math.max(...galleryData.map((item) => item.id || 0)) + 1 : 1;
        
        const newImage: GalleryImage = {
            id: nextId,
            src: imageUrl,
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
        const galleryData: GalleryImage[] = snapshot.val() || [];
        
        const imageToDelete = galleryData.find((image: GalleryImage) => image.id === id);
        if (imageToDelete && imageToDelete.src.includes('firebasestorage.googleapis.com')) {
            const imageStorageRef = storageRef(storage, imageToDelete.src);
            await deleteObject(imageStorageRef).catch(err => console.error("Could not delete file from storage", err));
        }

        const newGalleryData = galleryData.filter((image: GalleryImage) => image.id !== id);

        await set(ref(db, 'gallery'), newGalleryData);

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Image deleted from gallery.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Events ---
const eventSchema = z.object({
    title: z.string().min(1),
    date: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.instanceof(File),
});

export async function createEvent(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = eventSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: 'Invalid event data provided.' };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.imageUrl, 'events');
        const snapshot = await get(ref(db, 'events'));
        const data: Event[] = snapshot.val() || [];
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
        
        const newEvent: Event = { id: nextId, ...validatedData.data, imageUrl };
        
        const newData = [...data, newEvent];
        await set(ref(db, 'events'), newData);

        revalidatePath('/events');
        revalidatePath('/admin/events');
        return { success: true, message: 'Event created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteEvent(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'events'));
        const data: Event[] = snapshot.val() || [];
        const newData = data.filter(item => item.id !== id);
        await set(ref(db, 'events'), newData);
        
        revalidatePath('/events');
        revalidatePath('/admin/events');
        return { success: true, message: 'Event deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Toppers ---
const topperSchema = z.object({
    name: z.string().min(1),
    class: z.string().min(1),
    percentage: z.string().min(1),
    imageUrl: z.instanceof(File),
});

export async function createTopper(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = topperSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: 'Invalid topper data provided.' };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.imageUrl, 'toppers');
        const snapshot = await get(ref(db, 'toppers'));
        const data: Topper[] = snapshot.val() || [];
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;

        const newTopper: Topper = { id: nextId, ...validatedData.data, imageUrl };
        const newData = [...data, newTopper];
        await set(ref(db, 'toppers'), newData);

        revalidatePath('/');
        revalidatePath('/admin/toppers');
        return { success: true, message: 'Topper added successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteTopper(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'toppers'));
        const data: Topper[] = snapshot.val() || [];
        const newData = data.filter(item => item.id !== id);
        await set(ref(db, 'toppers'), newData);

        revalidatePath('/');
        revalidatePath('/admin/toppers');
        return { success: true, message: 'Topper deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Testimonials ---
const testimonialSchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    quote: z.string().min(1),
});

export async function createTestimonial(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = testimonialSchema.safeParse(rawData);
    if (!validatedData.success) return { success: false, message: 'Invalid data.' };
    
    try {
        const snapshot = await get(ref(db, 'testimonials'));
        const data: Testimonial[] = snapshot.val() || [];
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
        const newData = [...data, { id: nextId, ...validatedData.data }];
        await set(ref(db, 'testimonials'), newData);

        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        return { success: true, message: 'Testimonial added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteTestimonial(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'testimonials'));
        const data: Testimonial[] = snapshot.val() || [];
        const newData = data.filter(item => item.id !== id);
        await set(ref(db, 'testimonials'), newData);
        
        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        return { success: true, message: 'Testimonial deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

// --- CRUD for Announcements ---
const announcementSchema = z.object({
    text: z.string().min(1),
    link: z.string().optional(),
});

export async function createAnnouncement(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = announcementSchema.safeParse(rawData);
    if (!validatedData.success) return { success: false, message: 'Invalid data.' };

    try {
        const snapshot = await get(ref(db, 'announcements'));
        const data: Announcement[] = snapshot.val() || [];
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
        const newData = [...data, { id: nextId, ...validatedData.data }];
        await set(ref(db, 'announcements'), newData);

        revalidatePath('/');
        revalidatePath('/admin/announcements');
        return { success: true, message: 'Announcement added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteAnnouncement(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'announcements'));
        const data: Announcement[] = snapshot.val() || [];
        const newData = data.filter(item => item.id !== id);
        await set(ref(db, 'announcements'), newData);
        
        revalidatePath('/');
        revalidatePath('/admin/announcements');
        return { success: true, message: 'Announcement deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

// --- CRUD for FAQs ---
const faqSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
});

export async function createFaq(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = faqSchema.safeParse(rawData);
    if (!validatedData.success) return { success: false, message: 'Invalid data.' };

    try {
        const snapshot = await get(ref(db, 'faq'));
        const data: FAQ[] = snapshot.val() || [];
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
        const newData = [...data, { id: nextId, ...validatedData.data }];
        await set(ref(db, 'faq'), newData);

        revalidatePath('/admin/faq');
        return { success: true, message: 'FAQ added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteFaq(id: number): Promise<UploadResult> {
    try {
        const snapshot = await get(ref(db, 'faq'));
        const data: FAQ[] = snapshot.val() || [];
        const newData = data.filter(item => item.id !== id);
        await set(ref(db, 'faq'), newData);

        revalidatePath('/admin/faq');
        return { success: true, message: 'FAQ deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}
