import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-secondary-foreground/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">BIRLA OPEN MINDS</h3>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Nurturing tomorrow's leaders through holistic education, state-of-the-art facilities, and a commitment to excellence in Rajound, Haryana.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-secondary-foreground/70 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground/70 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">About Us</Link>
              </li>
              <li>
                <Link href="/academics" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Academics</Link>
              </li>
              <li>
                <Link href="/admissions" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Admissions</Link>
              </li>
              <li>
                <Link href="/faculty" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Faculty</Link>
              </li>
              <li>
                <Link href="/facilities" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Facilities</Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Discover</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/news-events" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">News & Events</Link>
              </li>
              <li>
                <Link href="/gallery" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Gallery</Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary-foreground/80 hover:text-white hover:underline transition-all">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a
                  href="https://maps.google.com/?q=Birla+Open+Minds+International+School+Rajound+Haryana+136044"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 text-sm hover:text-white transition-colors"
                >
                  HG85+W74, Assandh Kaithal Road,<br />
                  Rajound, Haryana 136044
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="tel:+919653424964"
                  className="text-secondary-foreground/80 text-sm hover:text-white transition-colors"
                >
                  +91 96534 24964
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="mailto:info.rajound@birlaopenminds.com"
                  className="text-secondary-foreground/80 text-sm hover:text-white transition-colors"
                >
                  info.rajound@birlaopenminds.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} Birla Open Minds International School. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm items-center">
            <a href="#" className="text-secondary-foreground/60 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-secondary-foreground/60 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
