import { getToppers } from "@/lib/data-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section id="star-performers" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
                Our Star <span className="text-primary">Performers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Celebrating the outstanding achievements of our students.
            </p>
        </div>
        {toppers.length > 0 ? (
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
                    <Card className="overflow-hidden bg-background shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
                        <CardHeader className="items-center text-center p-6">
                            <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20">
                                <Image
                                    src={topper.imageUrl}
                                    alt={`Photo of ${topper.name}`}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                    data-ai-hint="student portrait"
                                />
                            </div>
                            <div className="mt-4">
                                <CardTitle>{topper.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{topper.class}</p>
                            </div>
                        </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center p-6 pt-0 text-center">
                        <div className="flex items-center gap-2 text-accent font-bold text-lg">
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
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p className="mb-2">No toppers data available at the moment.</p>
            <p className="text-sm">Please check back later for updates on our star performers.</p>
          </div>
        )}
      </div>
    </section>
  );
}
