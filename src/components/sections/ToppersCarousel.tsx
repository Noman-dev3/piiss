import { getToppers } from "@/lib/data-loader";
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

export async function ToppersCarousel() {
  const toppers = await getToppers();

  return (
    <section id="toppers" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Our Academic Stars
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Celebrating the outstanding achievements of our top-performing students.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {toppers.map((topper) => (
              <CarouselItem key={topper.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-accent/20">
                        <Image
                          src={topper.imageUrl}
                          alt={`Photo of ${topper.name}`}
                          fill
                          className="object-cover"
                          sizes="128px"
                          data-ai-hint="student portrait"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-primary">{topper.name}</h3>
                      <p className="text-muted-foreground">{topper.class}</p>
                      <div className="mt-4 flex items-center gap-2 text-accent font-bold text-lg">
                        <Star className="h-5 w-5 fill-current" />
                        <span>{topper.percentage}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
