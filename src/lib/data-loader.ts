'use server';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Teacher, Student, ReportCard, News, GalleryImage, Announcement, Topper, Testimonial, Event, FAQ } from '@/types';


// Helper function to fetch a collection and map to type
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

// Helper function to fetch a single document
async function fetchDocument<T>(collectionName: string, id: string): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as unknown as T;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching document ${id} from ${collectionName}:`, error);
        return null;
    }
}

export const getTeachers = async () => fetchCollection<Teacher>('teachers');
export const getStudents = async () => fetchCollection<Student>('students');
export const getReportCards = async () => fetchCollection<ReportCard>('report-cards');
export const getNews = async () => fetchCollection<News>('news');
export const getGalleryImages = async () => fetchCollection<GalleryImage>('gallery');
export const getAnnouncements = async () => fetchCollection<Announcement[]>('announcements');
export const getToppers = async () => fetchCollection<Topper>('toppers');
export const getTestimonials = async () => fetchCollection<Testimonial>('testimonials');
export const getEvents = async () => fetchCollection<Event>('events');
export const getFaqs = async () => fetchCollection<FAQ>('faq');

export const getSingleNews = async (id: string) => fetchDocument<News>('news', id);
export const getSingleTeacher = async (id: string) => fetchDocument<Teacher>('teachers', id);


// This remains for AI actions that need raw string data
export const getRawData = async () => {
    const [
      teachers,
      events,
      news,
      faq,
      announcements,
    ] = await Promise.all([
      getTeachers(),
      getEvents(),
      getNews(),
      getFaqs(),
      getAnnouncements(),
    ]);

    // This is a simplified version. In a real app you might want more data.
    return {
      siteSettings: JSON.stringify({ fullName: "Pakistan Islamic International School System", tagline: "Shaping Minds, Building Futures" }),
      eventsData: JSON.stringify(events),
      newsData: JSON.stringify(news),
      teachersData: JSON.stringify(teachers),
      faqData: JSON.stringify(faq),
      publicResultsMetadata: JSON.stringify({ summary: "Results can be checked via the results page."}),
      announcementsData: JSON.stringify(announcements),
    };
};
