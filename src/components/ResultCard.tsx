
import type { ReportCard, Student } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ResultCardProps {
    student: Student;
    report: ReportCard;
}

export function ResultCard({ student, report }: ResultCardProps) {
    // This is a temporary structure until the data model is updated.
    // In a real scenario, these values would come from the report object itself.
    const term = report.session?.includes('Mid') ? 'Mid-Term' : 'Final';
    const year = report.session?.split(' ')[1] || new Date().getFullYear();
    const attendance = "95%"; // Placeholder
    const teacher_remarks = "Excellent progress."; // Placeholder
    const totalMarks = Object.values(report.subjects).reduce((sum, marks) => sum + marks, 0);
    const totalSubjects = Object.keys(report.subjects).length;
    const percentage = totalSubjects > 0 ? (totalMarks / (totalSubjects * 100) * 100).toFixed(2) : 0;

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">{student.name}</CardTitle>
                        <CardDescription>
                            Roll No: {report.roll_number} | Class: {report.class}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <Badge>{term} - {year}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Attendance: {attendance}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Marks (out of 100)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(report.subjects).map(([subject, marks]) => (
                            <TableRow key={subject}>
                                <TableCell className="font-medium">{subject}</TableCell>
                                <TableCell className="text-right font-bold">{marks}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow key="total" className="bg-muted font-bold">
                            <TableCell>Total Marks</TableCell>
                            <TableCell className="text-right">{totalMarks} / {totalSubjects * 100}</TableCell>
                        </TableRow>
                        <TableRow key="percentage" className="bg-muted font-bold">
                            <TableCell>Percentage</TableCell>
                            <TableCell className="text-right">{percentage}%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="bg-muted/50 p-6 flex-col items-start gap-2">
                <div className="flex justify-between w-full">
                    <h4 className="font-semibold">Overall Grade: <Badge variant="secondary">{report.grade}</Badge></h4>
                </div>
                <div>
                    <h4 className="font-semibold">Teacher's Remarks</h4>
                    <p className="text-sm text-muted-foreground italic">"{teacher_remarks}"</p>
                </div>
            </CardFooter>
        </Card>
    )
}
