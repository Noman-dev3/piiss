export interface Teacher {
  id: string;
  name: string;
  role: string;
  subject: string;
  department: string;
  experience: string;
  qualification: string;
  imageUrl: string;
  bio: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  gender: string;
  contact?: string;
  address?: string;
}

export interface ReportCard {
  id: string;
  student_name: string;
  roll_number: string;
  class: string;
  session: string;
  subjects: Record<string, number>;
  total_marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
  date_created: string;
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
