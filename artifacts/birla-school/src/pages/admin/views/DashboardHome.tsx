import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, Image as ImageIcon, Users, MessageSquare, BellRing } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHome() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "New Inquiries", value: stats?.newInquiries || 0, icon: BellRing, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "News Articles", value: stats?.totalNews || 0, icon: Newspaper, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Upcoming Events", value: stats?.totalEvents || 0, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Faculty Members", value: stats?.totalFaculty || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Gallery Images", value: stats?.totalGallery || 0, icon: ImageIcon, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Welcome Back, Admin</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
