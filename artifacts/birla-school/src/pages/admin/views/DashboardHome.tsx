import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, Image as ImageIcon, Users, MessageSquare, BellRing, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const statCards = [
  { label: "New Inquiries",    icon: BellRing,      color: "text-red-500",    bg: "bg-red-500/10",    href: "/admin/inquiries", key: "newInquiries" as const },
  { label: "Total Inquiries",  icon: MessageSquare, color: "text-blue-500",   bg: "bg-blue-500/10",   href: "/admin/inquiries", key: "totalInquiries" as const },
  { label: "News Articles",    icon: Newspaper,     color: "text-green-500",  bg: "bg-green-500/10",  href: "/admin/news",      key: "totalNews" as const },
  { label: "Upcoming Events",  icon: Calendar,      color: "text-amber-500",  bg: "bg-amber-500/10",  href: "/admin/news",      key: "totalEvents" as const },
  { label: "Faculty Members",  icon: Users,         color: "text-purple-500", bg: "bg-purple-500/10", href: "/admin/faculty",   key: "totalFaculty" as const },
  { label: "Gallery Images",   icon: ImageIcon,     color: "text-pink-500",   bg: "bg-pink-500/10",   href: "/admin/gallery",   key: "totalGallery" as const },
];

export default function DashboardHome() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-56 bg-muted rounded-lg mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back, Admin</h2>
      <p className="text-muted-foreground mb-8">Manage your school portal from here.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={stat.href}>
              <div className="group bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {stats?.[stat.key] ?? 0}
                  </p>
                  <p className="text-muted-foreground font-medium text-sm">{stat.label}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick access links */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Add News / Event", href: "/admin/news", icon: Newspaper, color: "bg-green-500" },
            { label: "Add Gallery Image", href: "/admin/gallery", icon: ImageIcon, color: "bg-pink-500" },
            { label: "Add Faculty Member", href: "/admin/faculty", icon: Users, color: "bg-purple-500" },
            { label: "View Inquiries", href: "/admin/inquiries", icon: MessageSquare, color: "bg-blue-500" },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
