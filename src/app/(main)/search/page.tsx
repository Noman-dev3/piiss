import { handleSearch } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileQuestion, Lightbulb } from 'lucide-react';

function PageHeader({ query }: { query?: string }) {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Search Results</h1>
        {query && <p className="mt-2 text-lg text-primary-foreground/80">Showing results for: "{query}"</p>}
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q || '';
  const searchResult = await handleSearch(query);

  return (
    <>
      <PageHeader query={query} />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {!query ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb />
                Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Use the search bar in the header to find information across the website. 
                You can ask questions like:
              </p>
              <ul className="list-disc pl-5 mt-4 text-muted-foreground space-y-1">
                <li>"Who is the history teacher?"</li>
                <li>"What are Aarav Sharma's grades?"</li>
                <li>"Tell me about Mr. Samuel Chen"</li>
              </ul>
            </CardContent>
          </Card>
        ) : searchResult.error ? (
          <Alert variant="destructive">
            <FileQuestion className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{searchResult.error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>AI-Powered Search Results</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>{searchResult.results}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
