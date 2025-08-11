
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Check, X } from "lucide-react";

interface Admission {
    id: string;
    applicantName: string;
    appliedClass: string;
    parentName: string;
    parentEmail: string;
    submittedAt: string;
}

function AdmissionsPage() {
    const { toast } = useToast();
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, 'admissionSubmissions'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const admissionList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    submittedAt: new Date(data[key].submittedAt).toLocaleDateString()
                })).reverse();
                setAdmissions(admissionList);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch admission submissions.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmissions();
    }, []);

    return (
        <div className="space-y-6">
             <h2 className="text-3xl font-bold tracking-tight">Manage Admissions</h2>
            
            <Card>
                <CardHeader>
                    <CardTitle>Admission Applications</CardTitle>
                    <CardDescription>Review and manage all submitted admission applications.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant Name</TableHead>
                                <TableHead>Applied Class</TableHead>
                                <TableHead>Parent Name</TableHead>
                                <TableHead>Submission Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto"/></TableCell>
                                    </TableRow>
                                ))
                            ) : admissions.length > 0 ? admissions.map(admission => (
                                <TableRow key={admission.id}>
                                    <TableCell>{admission.applicantName}</TableCell>
                                    <TableCell>{admission.appliedClass}</TableCell>
                                    <TableCell>{admission.parentName}</TableCell>
                                    <TableCell>{admission.submittedAt}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-green-500"><Check className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500"><X className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No admission applications found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(AdmissionsPage);
