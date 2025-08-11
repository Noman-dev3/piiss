import Link from 'next/link';
import Image from 'next/image';
import { getNews } from '@/lib/data-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export async function NewsAndEvents() {
  const allNews = await getNews();
  const latestNews = allNews.slice(0, 3);

  return (
    <section id="news" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="space-y-4 mb-6 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Latest News & Announcements
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                Stay updated with the latest happenings and important announcements from PIISS.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/news">
                View All News <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestNews.map((newsItem) => (
            <Card key={newsItem.id} className="overflow-hidden group">
              <Link href={`/news/${newsItem.id}`}>
                <div className="relative h-56 w-full">
                  <Image
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="news event"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{newsItem.category}</Badge>
                    <span>{new Date(newsItem.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <CardTitle className="mt-2 group-hover:text-accent">{newsItem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{newsItem.excerpt}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
