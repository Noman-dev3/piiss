import Link from 'next/link';
import { getEvents } from '@/lib/data-loader';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export async function NewsAndEvents() {
  const allEvents = await getEvents();
  const latestEvents = allEvents.slice(0, 3);

  return (
    <section id="events" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
            Upcoming Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our latest school activities and programs
          </p>
        </div>
        {latestEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden group flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-56 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      data-ai-hint="school event"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild variant="outline">
                    <Link href="/events">
                    View All Events <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No upcoming events scheduled at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
