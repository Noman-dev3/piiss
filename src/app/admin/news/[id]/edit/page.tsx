
'use client';
import withAuth from "@/lib/withAuth";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { getSingleNews } from "@/lib/data-loader";
import type { News } from "@/types";
import { NewsForm } from "../../_components/NewsForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EditNewsPage() {
  const params = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchNews = async () => {
      try {
        const data = await getSingleNews(params.id);
        setNewsItem(data);
      } catch (error) {
        console.error("Failed to fetch news item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [params.id]);

  return (
    <div className="space-y-6">
       <Button asChild variant="outline" size="sm">
          <Link href="/admin/news">
              <ArrowLeft className="mr-2" />
              Back to All News
          </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit News Article</CardTitle>
          <CardDescription>Make changes to the article below. Changes will be saved directly to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
          ) : newsItem ? (
            <NewsForm initialData={newsItem} />
          ) : (
            <p>News article not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(EditNewsPage);
