import { getTeachers } from "@/lib/data-loader";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
    const teachers = await getTeachers();
    const teacher = teachers.find(t => t.id === params.id);

    if (!teacher) {
        notFound();
    }

    return (
        <>
        <div className="bg-primary/10">
            <div className="container mx-auto max-w-5xl px-4 py-6">
                <Button asChild variant="outline" size="sm" className="bg-background">
                    <Link href="/teachers">
                        <ArrowLeft className="mr-2" />
                        Back to Faculty
                    </Link>
                </Button>
            </div>
        </div>
        <div className="container mx-auto max-w-5xl px-4 py-16">
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="relative h-48 w-48 rounded-full overflow-hidden shadow-lg mb-4">
                        <Image
                            src={teacher.imageUrl}
                            alt={`Photo of ${teacher.name}`}
                            fill
                            priority
                            className="object-cover"
                            sizes="192px"
                            data-ai-hint="teacher portrait"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-primary text-center">{teacher.name}</h1>
                    <Badge variant="secondary" className="mt-2 bg-accent/20 text-accent-foreground">{teacher.subject}</Badge>
                </div>
                <div className="md:col-span-2">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-primary border-b pb-2 mb-4">Biography</h2>
                            <p className="text-muted-foreground leading-relaxed">{teacher.bio}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-3">Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-accent" />
                                    <span className="text-muted-foreground">{teacher.experience} of experience</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-accent" />
                                    <span className="text-muted-foreground">{teacher.name.split(' ').join('.').toLowerCase()}@piiss.example</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export async function generateStaticParams() {
  const teachers = await getTeachers();
  return teachers.map(teacher => ({
    id: teacher.id,
  }));
}
