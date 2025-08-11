'use server';

import { db } from './firebase';
import { ref, get, child } from 'firebase/database';
import type { Teacher, Student, ReportCard, News, GalleryImage, Announcement, Topper, Testimonial, Event, FAQ } from '@/types';


// Helper function to fetch data from a path in Realtime Database
async function fetchData<T>(path: string): Promise<T[]> {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object of objects into an array, using the key from firebase as the id
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
}

// Helper function to fetch a single item by ID
async function fetchSingleItem<T>(path: string, id: string): Promise<T | null> {
    try {
        const dbRef = ref(db, `${path}/${id}`);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return { ...snapshot.val(), id: snapshot.key } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching item ${id} from ${path}:`, error);
        return null;
    }
}


export const getTeachers = async () => fetchData<Teacher>('teachers');
export const getStudents = async () => fetchData<Student>('students');
export const getReportCards = async (studentId: string) => fetchData<ReportCard>(`students/${studentId}/results`);
export const getNews = async () => fetchData<News>('news');
export const getGalleryImages = async () => fetchData<GalleryImage>('gallery');
export const getAnnouncements = async () => fetchData<Announcement>('announcements');
export const getToppers = async () => fetchData<Topper>('toppers');
export const getTestimonials = async () => fetchData<Testimonial>('testimonials');
export const getEvents = async () => fetchData<Event>('events');
export const getFaqs = async () => fetchData<FAQ>('faq');

export const getSingleNews = async (id: string) => fetchSingleItem<News>('news', id);
export const getSingleTeacher = async (id: string) => fetchSingleItem<Teacher>('teachers', id);


// This remains for AI actions that need raw string data
export const getRawData = async () => {
    const [
      teachers,
      events,
      news,
      faq,
      announcements,
      siteSettings,
      publicResultsMetadata,
    ] = await Promise.all([
      getTeachers(),
      getEvents(),
      getNews(),
      getFaqs(),
      getAnnouncements(),
      get(ref(db, 'siteSettings')),
      get(ref(db, 'publicResultsMetadata')),
    ]);

    return {
      siteSettings: JSON.stringify(siteSettings.val() || {}),
      eventsData: JSON.stringify(events),
      newsData: JSON.stringify(news),
      teachersData: JSON.stringify(teachers),
      faqData: JSON.stringify(faq),
      publicResultsMetadata: JSON.stringify(publicResultsMetadata.val() || {}),
      announcementsData: JSON.stringify(announcements),
    };
};
