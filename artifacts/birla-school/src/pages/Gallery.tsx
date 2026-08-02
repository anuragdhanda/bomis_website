import { motion } from "framer-motion";
import { useState } from "react";
import { useListGallery } from "@workspace/api-client-react";
import { GalleryItemCategory } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Images" },
  { id: GalleryItemCategory.academics, label: "Academics" },
  { id: GalleryItemCategory.sports, label: "Sports" },
  { id: GalleryItemCategory.events, label: "Events" },
  { id: GalleryItemCategory.cultural, label: "Cultural" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<{url: string, title: string} | null>(null);

  const queryParams = activeCategory === "all" ? undefined : { category: activeCategory as GalleryItemCategory };
  const { data: galleryItems, isLoading } = useListGallery(queryParams);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Gallery
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            Glimpses of life, learning, and celebrations at Bright Open Minds.
          </motion.p>
        </div>
      </section>

      <section className="py-12 bg-background flex-1">
        <div className="container mx-auto px-4">
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className={`w-full rounded-xl ${i % 2 === 0 ? 'h-64' : 'h-96'}`} />
              ))}
            </div>
          ) : galleryItems && galleryItems.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {galleryItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 6) * 0.1 }}
                  className="break-inside-avoid rounded-xl overflow-hidden bg-muted group relative cursor-pointer border border-border shadow-sm hover:shadow-md"
                  onClick={() => setLightboxImage({ url: item.imageUrl, title: item.title })}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="text-white font-bold text-lg">{item.title}</div>
                    <div className="text-primary font-medium text-sm capitalize">{item.category}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/30 rounded-xl border border-border border-dashed">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-2xl font-bold text-foreground mb-2">No Images Found</h3>
              <p className="text-muted-foreground">There are no images in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <X className="h-6 w-6" />
          </button>
          <div 
            className="max-w-5xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" 
            />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-medium text-center text-lg">{lightboxImage.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
