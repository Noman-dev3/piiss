
'use server';

import { z } from 'zod';
import { smartSearch } from '@/ai/flows/smart-search';
import { getRawData } from './data-loader';
import { db, storage } from './firebase';
import { ref, push, serverTimestamp, set, child, get, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Papa from 'papaparse';
import type { Student, ReportCard, Teacher, SiteSettings, GalleryImage, Event, Topper, Testimonial, Announcement, FAQ } from '@/types';
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

  try {
    const submissionsRef = ref(db, 'admissionSubmissions');
    const newSubmissionRef = push(submissionsRef);
    await set(newSubmissionRef, {
      ...validatedFields.data,
      submittedAt: serverTimestamp(),
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

const fileToAction = async (formData: FormData, dbPath: string, idKey: string): Promise<UploadResult> => {
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
                updates[`${dbPath}/${id}`] = { ...item, id };
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return { success: false, message: `CSV must contain a "${idKey}" column for each entry.` };
        }

        const dbRef = ref(db);
        await update(dbRef, updates);

        revalidatePath(`/admin/${dbPath}`);

        return { success: true, message: 'Data uploaded successfully!' };
    } catch (error: any) {
        console.error(`Error uploading to ${dbPath}:`, error);
        return { success: false, message: error.message || 'An error occurred during upload.' };
    }
};

export async function uploadTeachersCsv(formData: FormData): Promise<UploadResult> {
    return fileToAction(formData, 'teachers', 'teacherId');
}

export async function uploadStudentsCsv(formData: FormData): Promise<UploadResult> {
    return fileToAction(formData, 'students', 'rollNumber');
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
        revalidatePath('/admin/results');
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

        revalidatePath('/admin/results');
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
        
        revalidatePath('/', 'layout');
        revalidatePath('/admin/settings');

        return { success: true, message: 'Site settings updated successfully.' };
    } catch (error: any) {
        console.error('Error updating site settings:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

const galleryImageSchema = z.object({
    src: z.instanceof(File).refine(file => file.size > 0, { message: "Image is required." }),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    hint: z.string().min(1, "AI Hint is required."),
});

export async function createGalleryImage(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = galleryImageSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.src, 'gallery');

        const galleryRef = ref(db, 'gallery');
        const newImageRef = push(galleryRef);
        
        const newImage: Omit<GalleryImage, 'id'> = {
            src: imageUrl,
            alt: validatedData.data.title, // Use title for alt text
            title: validatedData.data.title,
            description: validatedData.data.description,
            hint: validatedData.data.hint,
        };

        await set(newImageRef, newImage);
        
        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Image added to gallery.' };

    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteGalleryImage(id: string): Promise<UploadResult> {
    try {
        const imageRef = ref(db, `gallery/${id}`);
        const snapshot = await get(imageRef);
        
        if (snapshot.exists()) {
            const imageToDelete = snapshot.val();
            if (imageToDelete && imageToDelete.src && imageToDelete.src.includes('firebasestorage.googleapis.com')) {
                const imageStorageRef = storageRef(storage, imageToDelete.src);
                await deleteObject(imageStorageRef).catch(err => console.error("Could not delete file from storage", err));
            }
            await remove(imageRef);
        }

        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, message: 'Image deleted from gallery.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Events ---
const eventSchema = z.object({
    title: z.string().min(1, "Title is required."),
    date: z.string().min(1, "Date is required."),
    description: z.string().min(1, "Description is required."),
    imageFile: z.instanceof(File).refine(file => file.size > 0, { message: "Image is required." }),
});

export async function createEvent(formData: FormData): Promise<UploadResult> {
    const rawData = {
        title: formData.get('title'),
        date: formData.get('date'),
        description: formData.get('description'),
        imageFile: formData.get('imageUrl'), // The form uses name="imageUrl" for the file input
    };
    const validatedData = eventSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.imageFile, 'events');
        const eventRef = ref(db, 'events');
        const newEventRef = push(eventRef);
        
        const newEvent: Omit<Event, 'id'> = {
            title: validatedData.data.title,
            date: validatedData.data.date,
            description: validatedData.data.description,
            imageUrl: imageUrl
        };
        
        await set(newEventRef, newEvent);

        revalidatePath('/events');
        revalidatePath('/admin/events');
        return { success: true, message: 'Event created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteEvent(id: string): Promise<UploadResult> {
    try {
        const eventRef = ref(db, `events/${id}`);
        await remove(eventRef);
        
        revalidatePath('/events');
        revalidatePath('/admin/events');
        return { success: true, message: 'Event deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Toppers ---
const topperSchema = z.object({
    name: z.string().min(1, "Name is required."),
    class: z.string().min(1, "Class is required."),
    percentage: z.string().min(1, "Percentage is required."),
    imageFile: z.instanceof(File).refine(file => file.size > 0, { message: "Image is required." }),
});

export async function createTopper(formData: FormData): Promise<UploadResult> {
    const rawData = {
        name: formData.get('name'),
        class: formData.get('class'),
        percentage: formData.get('percentage'),
        imageFile: formData.get('imageUrl'),
    };
    const validatedData = topperSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const imageUrl = await uploadFile(validatedData.data.imageFile, 'toppers');
        const toppersRef = ref(db, 'toppers');
        const newTopperRef = push(toppersRef);

        const newTopper: Omit<Topper, 'id'> = {
            name: validatedData.data.name,
            class: validatedData.data.class,
            percentage: validatedData.data.percentage,
            imageUrl
        };
        await set(newTopperRef, newTopper);

        revalidatePath('/');
        revalidatePath('/admin/toppers');
        return { success: true, message: 'Topper added successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function deleteTopper(id: string): Promise<UploadResult> {
    try {
        const topperRef = ref(db, `toppers/${id}`);
        await remove(topperRef);

        revalidatePath('/');
        revalidatePath('/admin/toppers');
        return { success: true, message: 'Topper deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

// --- CRUD for Testimonials ---
const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required."),
    role: z.string().min(1, "Role is required."),
    quote: z.string().min(1, "Quote is required."),
});

export async function createTestimonial(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = testimonialSchema.safeParse(rawData);
    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const testimonialRef = ref(db, 'testimonials');
        const newTestimonialRef = push(testimonialRef);
        await set(newTestimonialRef, validatedData.data);

        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        return { success: true, message: 'Testimonial added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteTestimonial(id: string): Promise<UploadResult> {
    try {
        const testimonialRef = ref(db, `testimonials/${id}`);
        await remove(testimonialRef);
        
        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        return { success: true, message: 'Testimonial deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

// --- CRUD for Announcements ---
const announcementSchema = z.object({
    text: z.string().min(1, "Text is required."),
    link: z.string().optional(),
});

export async function createAnnouncement(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = announcementSchema.safeParse(rawData);
    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const announcementRef = ref(db, 'announcements');
        const newAnnouncementRef = push(announcementRef);
        await set(newAnnouncementRef, validatedData.data);

        revalidatePath('/');
        revalidatePath('/admin/announcements');
        return { success: true, message: 'Announcement added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteAnnouncement(id: string): Promise<UploadResult> {
    try {
        const announcementRef = ref(db, `announcements/${id}`);
        await remove(announcementRef);
        
        revalidatePath('/');
        revalidatePath('/admin/announcements');
        return { success: true, message: 'Announcement deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

// --- CRUD for FAQs ---
const faqSchema = z.object({
    question: z.string().min(1, "Question is required."),
    answer: z.string().min(1, "Answer is required."),
});

export async function createFaq(formData: FormData): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = faqSchema.safeParse(rawData);
    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const faqRef = ref(db, 'faq');
        const newFaqRef = push(faqRef);
        await set(newFaqRef, validatedData.data);

        revalidatePath('/admin/faq');
        return { success: true, message: 'FAQ added.' };
    } catch (e: any) { return { success: false, message: e.message } }
}

export async function deleteFaq(id: string): Promise<UploadResult> {
    try {
        const faqRef = ref(db, `faq/${id}`);
        await remove(faqRef);

        revalidatePath('/admin/faq');
        return { success: true, message: 'FAQ deleted.' };
    } catch (e: any) { return { success: false, message: e.message } }
}


const teacherSchema = z.object({
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
  imageFile: z.any().optional(),
});

async function handleTeacher(formData: FormData, isUpdate: boolean): Promise<UploadResult> {
    const rawData = Object.fromEntries(formData);
    const validatedData = teacherSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { success: false, message: validatedData.error.errors.map(e => e.message).join(', ') };
    }
    
    const { id, imageFile, ...data } = validatedData.data;
    let imageUrl = data.imageUrl;

    if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await uploadFile(imageFile, 'teachers');
    }

    if (!isUpdate && !imageUrl) {
        return { success: false, message: 'An image is required for a new teacher.' };
    }

    try {
        const teacherData = { ...data, imageUrl: imageUrl || '' };
        
        if (isUpdate && id) {
            await set(ref(db, `teachers/${id}`), teacherData);
        } else {
            await set(ref(db, `teachers/${data.teacherId}`), { ...teacherData, id: data.teacherId });
        }
        
        revalidatePath('/teachers');
        revalidatePath('/admin/teachers');
        const message = isUpdate ? 'Teacher updated successfully.' : 'Teacher created successfully.';
        return { success: true, message };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}

export async function createTeacher(formData: FormData): Promise<UploadResult> {
    return handleTeacher(formData, false);
}

export async function updateTeacher(formData: FormData): Promise<UploadResult> {
    return handleTeacher(formData, true);
}

export async function deleteTeacher(id: string): Promise<UploadResult> {
    try {
        await remove(ref(db, `teachers/${id}`));
        revalidatePath('/teachers');
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Teacher deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' };
    }
}
