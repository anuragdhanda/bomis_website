import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Award, BookOpen, Users } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useCallback } from "react";
import { useListNewsEvents, useListGallery } from "@workspace/api-client-react";
import { format } from "date-fns";
import heroBuildingImg from "@assets/1000012710_1785343069794.png";
import heroGardenImg from "@assets/1000012712_1785343063211.png";
import heroAssemblyImg from "@assets/file_00000000173c8208bd2a49578dac6e25_1785344981644.png";

const HERO_SLIDES = [
  {
    image: heroBuildingImg,
    title: "Excellence in Education",
    subtitle: "Empowering students to think big, aim high, and achieve greatness in a rapidly changing world.",
    cta: "Discover Our Campus",
    link: "/about"
  },
  {
    image: heroGardenImg,
    title: "A Nurturing Environment",
    subtitle: "Where curiosity meets opportunity. Our modern campus provides the perfect setting for holistic growth.",
    cta: "View Facilities",
    link: "/facilities"
  },
  {
    image: heroAssemblyImg,
    title: "Future-Ready Learning",
    subtitle: "Integrating traditional values with modern pedagogy to shape the leaders of tomorrow.",
    cta: "Admission Process",
    link: "/admissions"
  }
];

const TESTIMONIALS = [
  {
    quote: "Choosing Birla Open Minds for our children was the best decision. The perfect balance of academics and co-curricular activities has truly helped them blossom.",
    author: "Priya Sharma",
    role: "Parent of Grade 8 Student"
  },
  {
    quote: "The teachers here are exceptional. They don't just teach from the books; they inspire the students to explore and learn through experience.",
    author: "Rajesh Verma",
    role: "Parent of Grade 5 Student"
  },
  {
    quote: "We are continually impressed by the school's infrastructure and the management's commitment to providing a safe, enriching environment.",
    author: "Anita Patel",
    role: "Parent of Grade 10 Student"
  },
  {
    quote: "The sports and extracurricular programs at BOMIS are outstanding. My son has grown not just academically but as a confident, well-rounded individual.",
    author: "Suresh Kumar",
    role: "Parent of Grade 6 Student"
  },
  {
    quote: "Communication between teachers and parents is excellent. We always feel involved in our daughter's learning journey. Truly a community school.",
    author: "Meena Agarwal",
    role: "Parent of Grade 3 Student"
  },
  {
    quote: "The values instilled here go beyond textbooks. My child has become more disciplined, empathetic, and goal-oriented since joining BOMIS Rajound.",
    author: "Vikram Singh",
    role: "Parent of Grade 11 Student"
  }
];

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [testiRef, testiApi] = useEmblaCarousel({ loop: true });

  const { data: newsEvents } = useListNewsEvents({ limit: 3 });
  const { data: galleryItems } = useListGallery();

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTestiNext = useCallback(() => {
    if (testiApi) testiApi.scrollNext();
  }, [testiApi]);

  useEffect(() => {
    const autoplay = setInterval(scrollNext, 5000);
    return () => clearInterval(autoplay);
  }, [scrollNext]);

  useEffect(() => {
    const autoplay = setInterval(scrollTestiNext, 6000);
    return () => clearInterval(autoplay);
  }, [scrollTestiNext]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] overflow-hidden bg-secondary">
        <div className="absolute inset-0" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {HERO_SLIDES.map((slide, index) => (
              <div key={index} className="relative flex-[0_0_100%] h-full">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 container mx-auto">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl font-medium"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Link 
                      href={slide.link}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-md font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {slide.cta} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Bar */}
      <div className="relative z-20 -mt-10 container mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 divide-border"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        >
          {[
            { stat: "1,200+", label: "Happy Students" },
            { stat: "75+", label: "Expert Teachers" },
            { stat: "25", label: "Years of Excellence" },
            { stat: "120+", label: "Awards & Honours" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center py-8 px-6 text-center ${i < 3 ? "border-r border-b md:border-b-0 border-border" : "border-b md:border-b-0 border-border"}`}
            >
              <span className="text-3xl md:text-4xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                {item.stat}
              </span>
              <span className="text-sm text-muted-foreground mt-1">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
      {/* Highlights Strip */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Holistic Learning</h3>
              <p className="text-muted-foreground mb-6">
                Our curriculum integrates academics with life skills, ensuring every student develops into a well-rounded individual.
              </p>
              <Link href="/about" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 text-secondary">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Us</h3>
              <p className="text-muted-foreground mb-6">
                State-of-the-art facilities, expert faculty, and a proven track record of academic and extra-curricular excellence.
              </p>
              <Link href="/admissions" className="text-secondary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Admissions <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Expert Faculty</h3>
              <p className="text-muted-foreground mb-6">
                Dedicated educators who are passionate about nurturing young minds and fostering a love for lifelong learning.
              </p>
              <Link href="/faculty" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Meet Faculty <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Programs Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4 text-ring border-t-[color:var(--color-red-400)] border-r-[color:var(--color-red-400)] border-b-[color:var(--color-red-400)] border-l-[color:var(--color-red-400)]">
              <span className="w-8 h-0.5 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Programs</span>
              <span className="w-8 h-0.5 bg-primary" />
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              A path for every age,<br />a future for every child.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Our four academic stages flow seamlessly into one another, building confidence year by year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                gradient: "from-emerald-50 to-green-100",
                label: "NURSERY — KG",
                title: "Pre-Primary",
                text: "Play-based foundations that build curiosity, confidence, and early literacy.",
                link: "/academics"
              },
              {
                gradient: "from-yellow-50 to-amber-100",
                label: "GRADES 1 — 5",
                title: "Primary",
                text: "Concept-led learning across subjects, with art, music and outdoor play built in.",
                link: "/academics"
              },
              {
                gradient: "from-sky-50 to-blue-100",
                label: "GRADES 6 — 10",
                title: "Secondary",
                text: "Strong academic core, project work, and CBSE board preparation done thoughtfully.",
                link: "/academics"
              },
              {
                gradient: "from-pink-50 to-rose-100",
                label: "GRADES 11 — 12",
                title: "Sr. Secondary",
                text: "Streams in Science, Commerce & Humanities with mentoring for college and life beyond.",
                link: "/academics"
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative bg-gradient-to-br ${card.gradient} rounded-[20px] p-10 flex flex-col min-h-[220px]`}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-[#F15A29] mb-3">{card.label}</span>
                <h3
                  className="text-3xl font-bold text-foreground mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {card.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1 pr-12">{card.text}</p>
                <div className="absolute bottom-6 right-6">
                  <Link href={card.link}>
                    <button className="w-11 h-11 bg-[#F15A29] rounded-full flex items-center justify-center shadow-md hover:bg-[#d94e22] transition-colors">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Latest News & Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">News & Events</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Stay updated with the latest happenings, achievements, and upcoming events at our campus.
              </p>
            </div>
            <Link 
              href="/news-events" 
              className="bg-background border border-border hover:bg-accent hover:text-white text-foreground px-6 py-2.5 rounded-md font-medium transition-colors"
            >
              View All News
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsEvents && newsEvents.length > 0 ? (
              newsEvents.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden border border-border shadow-sm group"
                >
                  <div className="h-48 overflow-hidden bg-muted relative">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/5 text-secondary">
                        <BookOpen className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider text-foreground">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-primary font-medium mb-3">
                      {format(new Date(item.publishedAt), "MMM dd, yyyy")}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.excerpt || item.content.substring(0, 100) + "..."}
                    </p>
                    <Link href={`/news-events/${item.id}`} className="text-primary font-medium flex items-center gap-1 hover:underline">
                      Read More <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No recent news or events available.
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden bg-white">
        {/* Orange top accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-300 via-primary to-orange-300" />
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "radial-gradient(circle, #F15A29 1.5px, transparent 1.5px)", backgroundSize: "32px 32px"}} />
        {/* Corner blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block text-primary font-semibold text-xs uppercase tracking-widest mb-4 bg-orange-50 px-5 py-2 rounded-full border border-orange-200">
              ⭐ Parent Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2">
              Hear From Our <span className="text-primary">Parents</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
              Real experiences from families who chose BOMIS Rajound for their children's future.
            </p>
          </div>

          {/* Infinite scrolling marquee */}
          <div className="relative overflow-hidden">
            {/* Left fade */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-white to-transparent" />
            {/* Right fade */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-white to-transparent" />

            <style>{`
              @keyframes marquee-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                width: max-content;
                animation: marquee-scroll 28s linear infinite;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="marquee-track gap-6 py-4">
              {/* Render twice for seamless loop */}
              {[...TESTIMONIALS, ...TESTIMONIALS].map((testi, i) => (
                <div
                  key={i}
                  className="group flex-shrink-0 w-[340px] mx-3"
                >
                  <div className="relative bg-white border border-orange-100 rounded-2xl p-7 h-full flex flex-col shadow-sm hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1.5 hover:border-primary/30 transition-all duration-300 cursor-default">
                    {/* Top orange stripe */}
                    <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />

                    {/* Large decorative quote mark */}
                    <div className="text-7xl text-primary/10 font-serif leading-none select-none mb-1 group-hover:text-primary/20 transition-colors -mt-2">
                      ❝
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, s) => (
                        <svg key={s} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-600 leading-relaxed text-[14.5px] flex-1 italic">
                      "{testi.quote}"
                    </p>

                    {/* Divider */}
                    <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

                    {/* Author row */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-orange-300 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-orange-200">
                        {testi.author.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{testi.author}</div>
                        <div className="text-primary text-xs font-medium mt-0.5">{testi.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust badge */}
          <div className="text-center mt-12 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, s) => (
                <svg key={s} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-400 text-sm">Trusted by <span className="text-primary font-semibold">1,200+ families</span> at BOMIS Rajound</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-300 via-primary to-orange-300" />
      </section>
      {/* Gallery Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Campus Life Gallery</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                A glimpse into the vibrant and enriching experiences of our students.
              </p>
            </div>
            <Link 
              href="/gallery" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md font-medium transition-colors"
            >
              View Full Gallery
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryItems && galleryItems.slice(0, 6).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="aspect-square rounded-xl overflow-hidden bg-muted group relative cursor-pointer"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="text-white font-bold text-lg">{item.title}</div>
                  <div className="text-white/80 text-sm capitalize">{item.category}</div>
                </div>
              </motion.div>
            ))}
            
            {(!galleryItems || galleryItems.length === 0) && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No gallery items available yet.
              </div>
            )}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join the Birla Open Minds family and give your child the foundation they need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/admissions" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-md font-semibold text-lg transition-all shadow-md">
              Apply Now
            </Link>
            <Link href="/contact" className="bg-background border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-md font-semibold text-lg transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
