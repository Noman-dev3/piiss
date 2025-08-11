import { getTestimonials } from "@/lib/data-loader";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Star, User } from "lucide-react";

export async function TestimonialsCarousel() {
  const testimonials = await getTestimonials();

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
            What Our Community <span className="text-primary">Says</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from parents, students, and alumni about their experiences at our school
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-background shadow-lg rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{testimonial.role}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
