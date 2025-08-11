import { getNews } from '@/lib/data-loader';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const allNews = await getNews();
  const newsItem = allNews.find(item => item.id.toString() === params.id);

  if (!newsItem) {
    notFound();
  }

  return (
    <>
      <div className="bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/news">
                    <ArrowLeft className="mr-2" />
                    Back to News
                </Link>
            </Button>
        </div>
      </div>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-4">{newsItem.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(newsItem.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <Badge variant="secondary">{newsItem.category}</Badge>
              </div>
            </div>
          </header>

          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
            <Image
              src={newsItem.imageUrl}
              alt={newsItem.title}
              fill
              className="object-cover"
              priority
              data-ai-hint="news article"
            />
          </div>
          
          <div 
            className="prose dark:prose-invert max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: newsItem.content }}
          />

        </article>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const news = await getNews();
  return news.map(item => ({
    id: item.id.toString(),
  }));
}
