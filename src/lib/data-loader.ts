'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Teacher, Student, ReportCard, News, GalleryImage, Announcement, Topper, Testimonial, Event, FAQ } from '@/types';

function parseCsv<T>(csv: string): T[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const entry = {} as any;
    headers.forEach((header, i) => {
      let value = values[i] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      entry[header] = value;
    });
    return entry as T;
  });
}

const dataCache = new Map<string, any>();

async function loadData<T>(fileName: string, parser?: (content: string) => T): Promise<T> {
  if (process.env.NODE_ENV === 'development') {
    dataCache.delete(fileName);
  }

  if (dataCache.has(fileName)) {
    return dataCache.get(fileName);
  }

  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = parser ? parser(content) : JSON.parse(content);
    dataCache.set(fileName, data);
    return data;
  } catch (error) {
    console.error(`Failed to load data from ${fileName}:`, error);
    throw new Error(`Could not load data from ${fileName}.`);
  }
}

export const getTeachers = async () => loadData<Teacher[]>('teachers.csv', parseCsv);
export const getStudents = async () => loadData<Student[]>('students.csv', parseCsv);
export const getReportCards = async () => loadData<ReportCard[]>('report-cards.json');
export const getNews = async () => loadData<News[]>('news.json');
export const getGalleryImages = async () => loadData<GalleryImage[]>('gallery.json');
export const getAnnouncements = async () => loadData<Announcement[]>('announcements.json');
export const getToppers = async () => loadData<Topper[]>('toppers.json');
export const getTestimonials = async () => loadData<Testimonial[]>('testimonials.json');
export const getEvents = async () => loadData<Event[]>('events.json');
export const getFaqs = async () => loadData<FAQ[]>('faq.json');

export const getRawData = async () => {
  const [
    siteSettings,
    eventsData,
    newsData,
    teachersData,
    faqData,
    publicResultsMetadata,
    announcementsData,
  ] = await Promise.all([
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'site-settings.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'events.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'news.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'teachers.csv'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'faq.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'public-results-metadata.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'src', 'data', 'announcements.json'), 'utf-8'),
  ]);

  return {
    siteSettings,
    eventsData,
    newsData,
    teachersData,
    faqData,
    publicResultsMetadata,
    announcementsData,
  };
};
