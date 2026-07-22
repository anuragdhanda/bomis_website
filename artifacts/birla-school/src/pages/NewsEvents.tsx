import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListNewsEvents } from "@workspace/api-client-react";
import { NewsEventType } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsEvents() {
  const { data: newsItems, isLoading: newsLoading } = useListNewsEvents({ type: NewsEventType.news });
  const { data: eventItems, isLoading: eventsLoading } = useListNewsEvents({ type: NewsEventType.event });

  const renderCard = (item: any) => (
    <motion.div
      key={item.id}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden bg-muted relative shrink-0">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/5 text-secondary">
            {item.type === 'news' ? <Newspaper className="h-12 w-12 opacity-50" /> : <Calendar className="h-12 w-12 opacity-50" />}
          </div>
        )}
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          {item.type}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-3">
          <Calendar className="h-4 w-4" />
          {item.eventDate ? (
            <span className="text-secondary font-bold">
              Event Date: {format(new Date(item.eventDate), "MMM dd, yyyy")}
            </span>
          ) : (
            <span>Published: {format(new Date(item.publishedAt), "MMM dd, yyyy")}</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
          {item.excerpt || item.content.substring(0, 120) + "..."}
        </p>
        <Link 
          href={`/news-events/${item.id}`} 
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mt-auto w-fit"
        >
          Read Full Story <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
          <Skeleton className="h-48 w-full" />
          <div className="p-6">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            News & Events
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Stay connected with the latest updates, achievements, and upcoming activities.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-3 w-[400px] bg-muted/50 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">All</TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">News</TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Events</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0 outline-none">
              {(newsLoading || eventsLoading) ? renderSkeletons() : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Combine and sort by date */}
                  {[...(newsItems || []), ...(eventItems || [])]
                    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                    .map(renderCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="news" className="mt-0 outline-none">
              {newsLoading ? renderSkeletons() : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newsItems && newsItems.length > 0 ? (
                    newsItems.map(renderCard)
                  ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                      No news articles available at the moment.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-0 outline-none">
              {eventsLoading ? renderSkeletons() : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {eventItems && eventItems.length > 0 ? (
                    eventItems.map(renderCard)
                  ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                      No upcoming events available at the moment.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </section>
    </div>
  );
}
