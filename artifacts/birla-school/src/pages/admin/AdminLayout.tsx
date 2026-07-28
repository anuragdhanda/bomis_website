import { useAdminAuth } from "@/lib/store";
import { Link, useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Image as ImageIcon,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetDashboardStats } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/admin",            label: "Overview",       icon: LayoutDashboard, exact: true },
  { href: "/admin/news",       label: "News & Events",  icon: Newspaper },
  { href: "/admin/gallery",    label: "Gallery",        icon: ImageIcon },
  { href: "/admin/faculty",    label: "Faculty",        icon: Users },
  { href: "/admin/inquiries",  label: "Inquiries",      icon: MessageSquare },
];

interface AdminLayoutProps {
  children: ReactNode;
  /** Title shown in the top header */
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isLoggedIn, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: stats } = useGetDashboardStats();

  useEffect(() => {
    if (!isLoggedIn) setLocation("/admin/login");
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? location === item.href : location.startsWith(item.href);

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden font-sans">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-[#8B1E2D] text-white shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:shrink-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">Admin Portal</p>
              <p className="text-white/55 text-[11px] leading-tight mt-0.5">Birla Open Minds</p>
            </div>
          </div>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const newBadge = item.href === "/admin/inquiries" && stats?.newInquiries
              ? stats.newInquiries
              : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  active
                    ? "bg-[#F15A29] text-white shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {newBadge ? (
                  <span className="ml-auto bg-white text-[#8B1E2D] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {newBadge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => { logout(); setLocation("/admin/login"); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-5 lg:px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#F15A29] font-medium hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Site
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
