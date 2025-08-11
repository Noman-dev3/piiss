import Image from 'next/image';
import Link from 'next/link';
import { getGalleryImages } from '@/lib/data-loader';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export async function GalleryPreview() {
  const allImages = await getGalleryImages();
  const previewImages = allImages.slice(0, 5);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="space-y-4 mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Campus Life in Pictures
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A glimpse into the vibrant and dynamic life at PIISS.
            </p>
          </div>
          <Button asChild>
            <Link href="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((img, index) => (
                <div key={img.id} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
                    <Card className="overflow-hidden h-full w-full group">
                        <div className="relative aspect-video h-full w-full">
                         <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            data-ai-hint={img.hint}
                            />
                        </div>
                    </Card>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
