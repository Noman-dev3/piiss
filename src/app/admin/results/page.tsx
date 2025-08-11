'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadResultsJson } from "@/lib/actions";
import { useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info } from "lucide-react";

function ResultsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleResultsUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadResultsJson(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                 // Optionally, you can trigger a refresh of student data on the students page
                 // from here if needed, but the primary view is on the students page.
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
             <h2 className="text-3xl font-bold tracking-tight">Manage Results</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Results</CardTitle>
                    <CardDescription>Upload a JSON file to add new report cards for existing students. The file should be an object where keys are student roll numbers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                         <Info className="h-4 w-4" />
                        <AlertTitle>JSON Format</AlertTitle>
                        <AlertDescription>
                            Should be an object of result objects. Each key must be a `roll_number` that matches an existing student.
                        </AlertDescription>
                    </Alert>
                    <form action={handleResultsUpload} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="results-json">Report Cards (.json)</Label>
                            <Input id="results-json" name="file" type="file" accept=".json" required />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            <FileUp className="mr-2" />
                            {isPending ? 'Uploading...' : 'Upload Results JSON'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(ResultsPage);
