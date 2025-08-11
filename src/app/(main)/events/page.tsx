
import { getEvents } from '@/lib/data-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Upcoming Events</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Join us for our exciting school events.
        </p>
      </div>
    </div>
  );
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden group flex flex-col hover:shadow-xl transition-shadow duration-300">
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
      </div>
    </>
  );
}
