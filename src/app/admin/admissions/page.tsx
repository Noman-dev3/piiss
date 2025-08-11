
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import type { Admission } from "@/types";
import { approveAdmission, rejectAdmission } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";

function AdmissionsPage() {
    const { toast } = useToast();
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

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
            } else {
                setAdmissions([]);
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

    const handleAction = (action: 'approve' | 'reject', admission: Admission) => {
        startTransition(async () => {
            const result = action === 'approve' 
                ? await approveAdmission(admission.id, admission)
                : await rejectAdmission(admission.id, admission);
            
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await fetchAdmissions();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }

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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto"/></TableCell>
                                    </TableRow>
                                ))
                            ) : admissions.length > 0 ? admissions.map(admission => (
                                <TableRow key={admission.id}>
                                    <TableCell>{admission.applicantName}</TableCell>
                                    <TableCell>{admission.appliedClass}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            admission.status === 'approved' ? 'default' :
                                            admission.status === 'rejected' ? 'destructive' :
                                            'secondary'
                                        } className="capitalize">
                                            {admission.status || 'pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-green-500 hover:text-green-600"
                                            onClick={() => handleAction('approve', admission)}
                                            disabled={isPending || admission.status !== 'pending'}
                                        >
                                            <Check className="h-4 w-4"/>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => handleAction('reject', admission)}
                                            disabled={isPending || admission.status !== 'pending'}
                                        >
                                            <X className="h-4 w-4"/>
                                        </Button>
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
