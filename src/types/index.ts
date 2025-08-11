
export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  contact: string;
  salary: string;
  dateJoined: string;
  subject?: string;
  role?: string;
  experience?: string;
  department?: string;
  qualification?: string;
  bio?: string;
  imageUrl?: string;
}

export interface Student {
  id: string; // The key from Firebase (rollNumber)
  name: string;
  rollNumber: string; // From CSV: Roll_Number
  class: string;
  gender: string;
  contact?: string;
  address?: string;
  results?: Record<string, ReportCard>; // To hold nested results
  section?: string;
  rollNo?: string;
}

export interface ReportCard {
  id: string; // The key from Firebase
  roll_number: string;
  class: string;
  session: string;
  subjects: Record<string, number>;
  grade: string;
}

export interface GalleryImage {
  id?: string;
  src: string;
  alt: string;
  hint: string;
  title: string;
  description: string;
}

export interface Announcement {
  id?: string;
  text: string;
  link?: string;
}

export interface Topper {
  id?: string;
  name: string;
  class: string;
  percentage: string;
  imageUrl: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  quote: string;
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  description: string;
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  phone: string;
  address: string;
  about: {
    story: string;
    stats: {
      value: string;
      label: string;
    }[];
    imageUrl: string;
  };
  missionVision: {
    title: string;
    description: string;
    icon: string;
  }[];
}
