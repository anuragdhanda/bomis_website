import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/faculty", label: "Faculty" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news-events", label: "News & Events" },
  { href: "/facilities", label: "Facilities" },
  { href: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/birla-logo.png"
              alt="Birla Open Minds International School"
              className="h-14 w-auto object-contain group-hover:opacity-85 transition-opacity"
            />
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-2xl sm:text-3xl font-bold text-[#F15A29] tracking-wide">BOMIS</span>
              <span className="text-[10px] sm:text-xs font-semibold text-black tracking-widest uppercase">Rajound</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-2",
                    isActive ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="ml-4 px-4 py-2 text-sm font-medium text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Nav Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-6 py-3 text-base font-medium transition-colors hover:bg-muted",
                  location === link.href ? "text-primary bg-primary/5 border-l-4 border-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="mx-6 mt-4 px-4 py-2 text-center text-sm font-medium bg-primary/10 text-primary rounded-md"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
