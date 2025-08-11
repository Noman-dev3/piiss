
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { GalleryImage } from '@/types';
import { getGalleryImages } from '@/lib/data-loader';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Gallery</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Explore moments of learning, creativity, and joy at PIISS.
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                 <Skeleton key={i} className="h-64 w-full mb-4" />
            ))}
        </div>
    )
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGalleryImages();
        // Ensure data is an array and filter out any invalid entries
        const validImages = Array.isArray(data) ? data.filter(img => img && img.id && img.src) : [];
        setImages(validImages);
      } catch (error) {
        console.error("Failed to load gallery images", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {loading ? <LoadingSkeleton /> : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img) => (
            <Dialog key={img.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer group break-inside-avoid">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={img.src}
                      alt={img.alt || 'Gallery image'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      data-ai-hint={img.hint}
                    />
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-2">
                <div className="relative aspect-video">
                  <Image
                    src={img.src}
                    alt={img.alt || 'Gallery image'}
                    fill
                    className="object-contain"
                    data-ai-hint={img.hint}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        )}
      </div>
    </>
  );
}
