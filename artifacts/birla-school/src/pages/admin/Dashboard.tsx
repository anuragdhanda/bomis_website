import { useAdminAuth } from "@/lib/store";
import { Link, useLocation, useParams } from "wouter";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Newspaper, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Admin Views
import DashboardHome from "./views/DashboardHome";
import NewsAdmin from "./views/NewsAdmin";
import GalleryAdmin from "./views/GalleryAdmin";
import FacultyAdmin from "./views/FacultyAdmin";
import InquiriesAdmin from "./views/InquiriesAdmin";

const NAV_ITEMS = [
  { id: "", label: "Overview", icon: LayoutDashboard },
  { id: "news", label: "News & Events", icon: Newspaper },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "faculty", label: "Faculty", icon: Users },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function AdminDashboard() {
  const { isLoggedIn, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const params = useParams();
  const page = params.page || "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/admin/login");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;

  const renderView = () => {
    switch (page) {
      case "news": return <NewsAdmin />;
      case "gallery": return <GalleryAdmin />;
      case "faculty": return <FacultyAdmin />;
      case "inquiries": return <InquiriesAdmin />;
      default: return <DashboardHome />;
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === page) || NAV_ITEMS[0];

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Admin Portal</h2>
              <p className="text-white/60 text-xs mt-1">Birla Open Minds</p>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6 text-white/80 hover:text-white" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.id} 
                href={`/admin${item.id ? `/${item.id}` : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                  page === item.id 
                    ? "bg-primary text-white" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-foreground" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">{currentNav.label}</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="text-sm text-primary font-medium hover:underline">
              View Live Site
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {renderView()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
