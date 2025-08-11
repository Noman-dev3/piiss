export interface Teacher {
  id: string;
  bio: string;
  name: string;
  role: string;
  subject: string;
  department: string;
  experience: string;
  qualification: string;
  imageUrl: string;
}

export interface Student {
  rollNo: string;
  name: string;
  class: string;
  section: string;
  id: string;
}

export interface ReportCard {
  id: string; // Added to uniquely identify a report card
  rollNo: number;
  term: string;
  year: number;
  grades: Record<string, string>;
  attendance: string;
  teacher_remarks: string;
}

export interface News {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  hint: string;
  title: string;
  description: string;
}

export interface Announcement {
  id: number;
  text: string;
  link?: string;
}

export interface Topper {
  id: number;
  name: string;
  class: string;
  percentage: string;
  imageUrl: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
}

export interface FAQ {
    id: number;
    question: string;
    answer: string;
}
