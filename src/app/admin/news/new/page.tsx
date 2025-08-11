
'use client';
import withAuth from "@/lib/withAuth";
import { NewsForm } from "../_components/NewsForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NewNewsPage() {
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
          <CardTitle>Create New News Article</CardTitle>
          <CardDescription>Fill out the form below to publish a new article to the website.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(NewNewsPage);
