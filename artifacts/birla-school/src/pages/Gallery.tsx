import { motion } from "framer-motion";
import { useState } from "react";
import { useListGallery } from "@workspace/api-client-react";
import { GalleryItemCategory } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INFRA_IMAGES = [
  { src: "/gallery/infra-building-front.png", alt: "School Building Front View" },
  { src: "/gallery/infra-entrance.png", alt: "School Entrance" },
  { src: "/gallery/infra-building-2.png", alt: "Campus Infrastructure" },
  { src: "/gallery/infra-building-3.png", alt: "Campus Block" },
  { src: "/gallery/infra-building-4.png", alt: "Campus Wing" },
  { src: "/gallery/infra-building-side.png", alt: "Building Side View" },
  { src: "/gallery/infra-building-field.png", alt: "School Ground & Field" },
  { src: "/gallery/school-building.png", alt: "School Overview" },
];

const ACADEMIC_IMAGES = [
  { url: "/gallery/academics/academics-admission-counselling.jpg", title: "Admission Counselling" },
  { url: "/gallery/academics/academics-parent-teacher-meeting.jpg", title: "Parent Teacher Meeting" },
  { url: "/gallery/academics/academics-language-project.jpg", title: "Language Project" },
  { url: "/gallery/academics/academics-parent-interaction.jpg", title: "Parent Interaction" },
  { url: "/gallery/academics/academics-classroom-learning.jpg", title: "Classroom Learning" },
  { url: "/gallery/academics/academics-learning-activity.jpg", title: "Learning Activity" },
  { url: "/gallery/academics/academics-classroom-discussion.jpg", title: "Classroom Discussion" },
  { url: "/gallery/academics/academics-school-activity.jpg", title: "Academic School Activity" },
  { url: "/gallery/academics/academics-student-project.jpg", title: "Student Project" },
  { url: "/gallery/academics/academics-classroom-session.jpg", title: "Classroom Session" },
  { url: "/gallery/academics/academics-academic-guidance.jpg", title: "Academic Guidance" },
  { url: "/gallery/academics/academics-student-learning.jpg", title: "Student Learning" },
];

const SPORTS_IMAGES = [
  { url: "/gallery/sports/uploaded-sports-01.png", title: "Outdoor Sports Training" },
  { url: "/gallery/sports/uploaded-sports-02.png", title: "Volleyball Practice" },
  { url: "/gallery/sports/uploaded-sports-03.png", title: "Wrestling Training" },
  { url: "/gallery/sports/uploaded-sports-04.png", title: "Archery Practice" },
  { url: "/gallery/sports/uploaded-sports-05.png", title: "Wrestling Practice" },
  { url: "/gallery/sports/uploaded-sports-06.png", title: "Sports Coaching" },
  { url: "/gallery/sports/uploaded-sports-07.png", title: "Indoor Sports Training" },
  { url: "/gallery/sports/uploaded-sports-08.png", title: "Archery Training" },
  { url: "/gallery/sports/uploaded-sports-09.png", title: "Sports Activity" },
  { url: "/gallery/sports/uploaded-sports-10.png", title: "Student Sports Activity" },
  { url: "/gallery/sports/uploaded-sports-11.png", title: "Team Sports Practice" },
  { url: "/gallery/sports/uploaded-sports-12.png", title: "Athletics Training" },
];

const CULTURAL_IMAGES = [
  { url: "/gallery/cultural/uploaded-cultural-01.jpg", title: "Holi Celebration" },
  { url: "/gallery/cultural/uploaded-cultural-02.jpg", title: "Holi Memories" },
  { url: "/gallery/cultural/uploaded-cultural-03.jpg", title: "Cultural Celebration" },
  { url: "/gallery/cultural/uploaded-cultural-04.jpg", title: "Student Celebration" },
  { url: "/gallery/cultural/uploaded-cultural-05.jpg", title: "Colour Festival" },
  { url: "/gallery/cultural/uploaded-cultural-06.jpg", title: "School Community Celebration" },
  { url: "/gallery/cultural/uploaded-cultural-07.jpg", title: "Cultural Activities" },
  { url: "/gallery/cultural/uploaded-cultural-08.jpg", title: "Holi with Friends" },
];

const CATEGORIES = [
  { id: "all", label: "All Images" },
  { id: GalleryItemCategory.academics, label: "Academics" },
  { id: GalleryItemCategory.sports, label: "Sports" },
  { id: GalleryItemCategory.events, label: "Events" },
  { id: GalleryItemCategory.cultural, label: "Cultural" },
  { id: "infrastructure", label: "Infrastructure" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isInfrastructure = activeCategory === "infrastructure";
  const queryParams = activeCategory === "all" || isInfrastructure ? undefined : { category: activeCategory as GalleryItemCategory };
  const { data: galleryItems, isLoading } = useListGallery(isInfrastructure ? undefined : queryParams);

  const apiGalleryItems = Array.isArray(galleryItems)
    ? galleryItems.map((item) => ({ url: item.imageUrl, title: item.title, category: item.category, id: item.id }))
    : [];
  const apiImageUrls = new Set(apiGalleryItems.map((item) => item.url));
  const localAcademicItems = ACADEMIC_IMAGES
    .filter((item) => !apiImageUrls.has(item.url))
    .map((item) => ({ ...item, category: GalleryItemCategory.academics }));
  const localSportsItems = SPORTS_IMAGES
    .filter((item) => !apiImageUrls.has(item.url))
    .map((item) => ({ ...item, category: GalleryItemCategory.sports }));
  const localCulturalItems = CULTURAL_IMAGES
    .filter((item) => !apiImageUrls.has(item.url))
    .map((item) => ({ ...item, category: GalleryItemCategory.cultural }));
  const visibleGalleryItems = activeCategory === "academics"
    ? [...localAcademicItems, ...apiGalleryItems]
    : activeCategory === "sports"
      ? [...localSportsItems, ...apiGalleryItems]
    : activeCategory === "cultural"
      ? [...localCulturalItems, ...apiGalleryItems]
    : activeCategory === "all"
      ? [...localAcademicItems, ...localSportsItems, ...localCulturalItems, ...apiGalleryItems]
      : apiGalleryItems;

  // Build the full list of images visible in the current view
  const allImages: { url: string; title: string }[] = [
    ...(activeCategory === "all" || isInfrastructure
      ? INFRA_IMAGES.map((img) => ({ url: img.src, title: img.alt }))
      : []),
    ...(!isInfrastructure
      ? visibleGalleryItems.map((item) => ({ url: item.url, title: item.title }))
      : []),
  ];

  const lightboxImage = lightboxIndex !== null ? allImages[lightboxIndex] ?? null : null;

  const openLightbox = (url: string, title: string) => {
    const idx = allImages.findIndex((img) => img.url === url && img.title === title);
    setLightboxIndex(idx !== -1 ? idx : null);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % allImages.length);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
  };

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

          {/* Infrastructure Photos */}
          {(activeCategory === "all" || isInfrastructure) && (
            <div className={activeCategory === "all" ? "mb-14" : ""}>
              {activeCategory === "all" && (
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Infrastructure</h2>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {INFRA_IMAGES.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="break-inside-avoid rounded-xl overflow-hidden bg-muted group relative cursor-pointer border border-border shadow-sm hover:shadow-md"
                    onClick={() => openLightbox(img.src, img.alt)}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="text-white font-bold text-lg">{img.alt}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* API-backed Grid (hidden when Infrastructure filter is active) */}
          {!isInfrastructure && (
            isLoading && visibleGalleryItems.length === 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className={`w-full rounded-xl ${i % 2 === 0 ? 'h-64' : 'h-96'}`} />
                ))}
              </div>
            ) : visibleGalleryItems.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {visibleGalleryItems.map((item, idx) => (
                  <motion.div
                    key={`${item.url}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 6) * 0.1 }}
                    className="break-inside-avoid rounded-xl overflow-hidden bg-muted group relative cursor-pointer border border-border shadow-sm hover:shadow-md"
                    onClick={() => openLightbox(item.url, item.title)}
                  >
                    <img 
                      src={item.url} 
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
            )
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-xl"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 md:left-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-all z-10"
            onClick={goPrev}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-md">
              <p className="text-white font-medium text-center text-lg">{lightboxImage.title}</p>
              <p className="text-white/60 text-center text-sm mt-1">
                {lightboxIndex !== null ? `${lightboxIndex + 1} / ${allImages.length}` : ""}
              </p>
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-all z-10"
            onClick={goNext}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}
