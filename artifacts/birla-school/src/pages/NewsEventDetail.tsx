import { useParams, Link } from "wouter";
import { useGetNewsEvent } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function NewsEventDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: item, isLoading, isError } = useGetNewsEvent(id, { query: { enabled: !!id, queryKey: [id] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h2>
        <p className="text-muted-foreground mb-8">The news or event you are looking for does not exist or has been removed.</p>
        <Link href="/news-events" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to News & Events
        </Link>
      </div>
    );
  }

  return (
    <article className="flex flex-col w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/news-events" className="inline-flex items-center gap-2 text-primary font-medium hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> {item.type}
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              Published: {format(new Date(item.publishedAt), "MMMM dd, yyyy")}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            {item.title}
          </h1>

          {item.eventDate && (
            <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg mb-8 inline-block">
              <span className="text-secondary font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Date: {format(new Date(item.eventDate), "MMMM dd, yyyy")}
              </span>
            </div>
          )}

          {item.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-12 shadow-md">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
          )}

          {item.excerpt && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-8 border-l-4 border-primary pl-6">
              {item.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none text-foreground/80 leading-loose">
            {item.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i} className="mb-6">{paragraph}</p> : null
            ))}
          </div>
        </motion.div>
      </div>
    </article>
  );
}
