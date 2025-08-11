import Image from 'next/image';
import Link from 'next/link';
import { getGalleryImages } from '@/lib/data-loader';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../ui/badge';

export async function GalleryPreview() {
  const allImages = await getGalleryImages();
  const previewImages = allImages.slice(0, 6);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
              School Life <span className="text-primary">Gallery</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Glimpses of our vibrant school community and memorable moments
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewImages.map((img) => (
                <Card key={img.id} className="overflow-hidden h-full w-full group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="relative aspect-[4/3] h-full w-full">
                        <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        data-ai-hint={img.hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 text-white transition-transform duration-300 translate-y-8 group-hover:translate-y-0">
                        <h3 className="text-xl font-bold">{img.title}</h3>
                        <p className="text-sm opacity-90">{img.description}</p>
                    </div>
                </Card>
            ))}
        </div>
        <div className="text-center mt-12">
            <Button asChild>
                <Link href="/gallery">
                View Full Gallery <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
