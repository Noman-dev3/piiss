import { getTestimonials } from "@/lib/data-loader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Star } from "lucide-react";

export async function TestimonialsCarousel() {
  const testimonials = await getTestimonials();

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            What Our Community Says
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Words of appreciation from parents and alumni who have been part of the PIISS family.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <div className="p-4">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                       <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                        <Image
                          src={testimonial.imageUrl}
                          alt={`Photo of ${testimonial.name}`}
                          fill
                          className="object-cover"
                           sizes="96px"
                           data-ai-hint="person portrait"
                        />
                      </div>
                      <p className="text-lg text-foreground/90 italic mb-4 max-w-2xl">"{testimonial.quote}"</p>
                      <h3 className="text-xl font-bold text-primary">{testimonial.name}</h3>
                      <p className="text-muted-foreground">{testimonial.role}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
