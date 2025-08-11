'use client'
import { useState, useEffect } from "react";
import { getAnnouncements } from "@/lib/data-loader";
import type { Announcement } from "@/types";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export function AnnouncementsTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements().then(data => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
        <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
            <div className="container mx-auto max-w-7xl px-4">
                <Skeleton className="h-12 w-full bg-primary-foreground/10" />
            </div>
        </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  const tickerContent = announcements.map(announcement => (
    announcement.link ? (
      <Link href={announcement.link} key={announcement.id} className="text-sm mx-8 whitespace-nowrap hover:underline">
        {announcement.text}
      </Link>
    ) : (
      <span key={announcement.id} className="text-sm mx-8 whitespace-nowrap">
        {announcement.text}
      </span>
    )
  ));


  return (
    <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container mx-auto max-w-7xl px-4 flex items-center h-12">
            <Megaphone className="h-5 w-5 mr-4 shrink-0" />
            <div className="overflow-hidden relative w-full h-full">
                <div className="absolute inset-y-0 flex items-center animate-marquee whitespace-nowrap">
                    {tickerContent}
                </div>
                <div className="absolute inset-y-0 flex items-center animate-marquee2 whitespace-nowrap">
                     {tickerContent}
                </div>
                 <style jsx>{`
                    @keyframes marquee {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-100%); }
                    }
                    @keyframes marquee2 {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(0%); }
                    }
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                    .animate-marquee2 {
                        animation: marquee2 30s linear infinite;
                    }
                `}</style>
            </div>
        </div>
    </div>
  )
}
