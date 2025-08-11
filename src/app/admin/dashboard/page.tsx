'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, Newspaper, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import withAuth from '@/lib/withAuth';

function DashboardPage() {
    const [stats, setStats] = useState({
        teachers: 0,
        news: 0,
        gallery: 0,
        events: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersSnap, newsSnap, gallerySnap, eventsSnap] = await Promise.all([
                    getDocs(collection(db, 'teachers')),
                    getDocs(collection(db, 'news')),
                    getDocs(collection(db, 'gallery')),
                    getDocs(collection(db, 'events')),
                ]);
                setStats({
                    teachers: teachersSnap.size,
                    news: newsSnap.size,
                    gallery: gallerySnap.size,
                    events: eventsSnap.size,
                });
            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Teachers', icon: Users, value: stats.teachers, key: 'teachers' },
        { title: 'News Articles', icon: Newspaper, value: stats.news, key: 'news' },
        { title: 'Gallery Images', icon: ImageIcon, value: stats.gallery, key: 'gallery' },
        { title: 'Total Events', icon: FileText, value: stats.events, key: 'events' },
    ];

    return (
        <>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                    <Card key={card.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? '...' : card.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Dashboard!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>From here you can manage all aspects of your school website. Use the navigation bar above to manage content.</p>
                </CardContent>
            </Card>
        </>
    );
}

export default withAuth(DashboardPage);
