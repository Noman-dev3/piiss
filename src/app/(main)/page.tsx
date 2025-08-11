import { AboutSection } from "@/components/sections/AboutSection";
import { ContactForm } from "@/components/ContactForm";
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
      <section id="contact" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
            <ContactForm />
        </div>
      </section>
    </>
  );
}
