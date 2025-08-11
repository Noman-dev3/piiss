import type { ReportCard, Student } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ResultCardProps {
    student: Student;
    report: ReportCard;
}

export function ResultCard({ student, report }: ResultCardProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">{student.name}</CardTitle>
                        <CardDescription>
                            Roll No: {student.rollNo} | Class: {student.class}-{student.section}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <Badge>{report.term} - {report.year}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Attendance: {report.attendance}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(report.grades).map(([subject, grade]) => (
                            <TableRow key={subject}>
                                <TableCell className="font-medium">{subject}</TableCell>
                                <TableCell className="text-right font-bold">{grade}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
                <h4 className="font-semibold">Teacher's Remarks</h4>
                <p className="text-sm text-muted-foreground italic">"{report.teacher_remarks}"</p>
            </CardFooter>
        </Card>
    )
}
