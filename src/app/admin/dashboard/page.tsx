'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, UserPlus, BookOpen, FileText, ArrowUp } from "lucide-react";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, get, query, limitToLast } from 'firebase/database';
import withAuth from '@/lib/withAuth';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardPage() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        admissions: 0,
        events: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsSnap, teachersSnap, admissionsSnap, eventsSnap, activitySnap] = await Promise.all([
                    get(ref(db, 'students')),
                    get(ref(db, 'teachers')),
                    get(ref(db, 'admissionSubmissions')),
                    get(ref(db, 'events')),
                    get(query(ref(db, 'admissionSubmissions'), limitToLast(3))) // Example: get last 3 admissions
                ]);

                const getCount = (snapshot: any) => snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                
                setStats({
                    students: getCount(studentsSnap),
                    teachers: getCount(teachersSnap),
                    admissions: getCount(admissionsSnap),
                    events: getCount(eventsSnap),
                });

                if (activitySnap.exists()) {
                    const activities = Object.values(activitySnap.val()).map((item: any) => ({
                        type: 'New admission application',
                        name: item.applicantName,
                        time: '2 minutes ago', // Placeholder time
                        icon: <UserPlus className="w-5 h-5 text-green-500" />,
                    }));
                    setRecentActivity(activities.reverse());
                }

            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Students', icon: <GraduationCap className="text-blue-500" />, value: stats.students, change: "+12%", changeColor: 'text-green-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
        { title: 'Total Teachers', icon: <Users className="text-green-500" />, value: stats.teachers, change: "+3%", changeColor: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50' },
        { title: 'Pending Admissions', icon: <UserPlus className="text-yellow-500" />, value: stats.admissions, subtext: 'Requires attention', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
        { title: 'Upcoming Events', icon: <Calendar className="text-purple-500" />, value: stats.events, subtext: 'Next 30 days', bgColor: 'bg-purple-100 dark:bg-purple-900/50' },
    ];
    
     const quickActions = [
        { title: "Manage Students", icon: <GraduationCap />, color: "blue", href: "/admin/students" },
        { title: "Manage Teachers", icon: <Users />, color: "green", href: "/admin/teachers" },
        { title: "Add Results", icon: <FileText />, color: "purple", href: "/admin/results" },
        { title: "Review Admissions", icon: <UserPlus />, color: "yellow", href: "/admin/admissions" },
    ];


    return (
        <>
            <div className="flex flex-col justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">Monitor your school's key metrics and recent activities.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {statCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                             <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                {card.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                             {loading ? <Skeleton className="h-8 w-1/4 mt-1" /> : (
                                <div className="text-2xl font-bold">
                                    {card.value}
                                </div>
                            )}
                            {card.change && <p className={`text-xs ${card.changeColor} flex items-center gap-1`}><ArrowUp className="w-3 h-3"/> {card.change} from last month</p>}
                            {card.subtext && <p className="text-xs text-muted-foreground">{card.subtext}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       {quickActions.map(action => (
                           <Button key={action.title} variant="outline" className={`h-24 flex flex-col gap-2 bg-${action.color}-50 dark:bg-${action.color}-900/20 border-${action.color}-200 dark:border-${action.color}-800/50 text-${action.color}-600 dark:text-${action.color}-400 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/40`} asChild>
                               <Link href={action.href}>
                                    {action.icon}
                                    <span>{action.title}</span>
                               </Link>
                           </Button>
                       ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                         <CardDescription>Latest changes in the system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {loading ? Array.from({length: 3}).map((_, i) => (
                             <div key={i} className="flex items-center gap-4">
                                 <Skeleton className="h-8 w-8 rounded-full" />
                                 <div className="space-y-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                 </div>
                             </div>
                         )) : recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{activity.type}</p>
                                    <p className="text-xs text-muted-foreground">{activity.name} &middot; {activity.time}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default withAuth(DashboardPage);
