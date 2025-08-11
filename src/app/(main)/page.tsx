import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FeaturedTeachers } from "@/components/sections/FeaturedTeachers";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { HeroSection } from "@/components/sections/HeroSection";
import { NewsAndEvents } from "@/components/sections/NewsAndEvents";
import { AnnouncementsTicker } from "@/components/sections/AnnouncementsTicker";
import { ToppersCarousel } from "@/components/sections/ToppersCarousel";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AnnouncementsTicker />
      <AboutSection />
      <ToppersCarousel />
      <FeaturedTeachers />
      <NewsAndEvents />
      <GalleryPreview />
      <TestimonialsCarousel />
      <ContactSection />
    </>
  );
}
