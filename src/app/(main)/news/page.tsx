import Link from 'next/link';
import Image from 'next/image';
import { getNews } from '@/lib/data-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">News & Announcements</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Stay informed about everything happening at PIISS.
        </p>
      </div>
    </div>
  );
}

export default async function NewsPage() {
  const allNews = await getNews();

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allNews.map((newsItem) => (
            <Card key={newsItem.id} className="overflow-hidden group flex flex-col hover:shadow-xl transition-shadow duration-300">
              <Link href={`/news/${newsItem.id}`} className="flex flex-col h-full">
                <div className="relative h-56 w-full">
                  <Image
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint="news event"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{newsItem.category}</Badge>
                    <span>{new Date(newsItem.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <CardTitle className="mt-2 group-hover:text-accent transition-colors">{newsItem.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{newsItem.excerpt}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
