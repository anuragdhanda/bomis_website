import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Globe, Layers, Award, Star, ArrowDown } from "lucide-react";

// ── Animated Counter ───────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); } else setVal(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Floating Particle ──────────────────────────────────────────────────────────
function Particle({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -40, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

// ── Morphing SVG blob ──────────────────────────────────────────────────────────
function MorphBlob({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <motion.path fill={color}
        initial={{ d: "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.4,42.2C65.5,55.2,55.2,66.6,42.5,74.4C29.8,82.2,14.9,86.5,0.3,86C-14.2,85.5,-28.4,80.2,-40.7,72.2C-53,64.2,-63.4,53.5,-70.3,40.8C-77.2,28.1,-80.7,14,-80.4,0.2C-80.1,-13.6,-76,-27.2,-68.8,-38.8C-61.5,-50.4,-51,-60,-39,-67C-27,-74,-13.5,-78.5,1.2,-80.5C15.9,-82.5,30.6,-83.6,44.7,-76.4Z" }}
        animate={{ d: [
          "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.4,42.2C65.5,55.2,55.2,66.6,42.5,74.4C29.8,82.2,14.9,86.5,0.3,86C-14.2,85.5,-28.4,80.2,-40.7,72.2C-53,64.2,-63.4,53.5,-70.3,40.8C-77.2,28.1,-80.7,14,-80.4,0.2C-80.1,-13.6,-76,-27.2,-68.8,-38.8C-61.5,-50.4,-51,-60,-39,-67C-27,-74,-13.5,-78.5,1.2,-80.5C15.9,-82.5,30.6,-83.6,44.7,-76.4Z",
          "M43.2,-73.5C55.6,-67.5,65.2,-55.4,71.8,-41.9C78.4,-28.4,82.1,-14.2,81.1,-0.6C80.1,13,74.4,26,66.2,37.5C58.1,49,47.4,59,35,66.4C22.5,73.9,8.3,78.6,-6.9,79.4C-22.1,80.2,-38.2,77,-51.4,69C-64.6,61,-74.9,48.4,-80.5,34C-86.2,19.7,-87.2,-0.4,-82.1,-17.8C-76.9,-35.3,-65.7,-50.2,-51.9,-56.5C-38.1,-62.8,-21.6,-60.5,-5.6,-62.4C10.4,-64.3,30.8,-79.5,43.2,-73.5Z",
          "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.4,42.2C65.5,55.2,55.2,66.6,42.5,74.4C29.8,82.2,14.9,86.5,0.3,86C-14.2,85.5,-28.4,80.2,-40.7,72.2C-53,64.2,-63.4,53.5,-70.3,40.8C-77.2,28.1,-80.7,14,-80.4,0.2C-80.1,-13.6,-76,-27.2,-68.8,-38.8C-61.5,-50.4,-51,-60,-39,-67C-27,-74,-13.5,-78.5,1.2,-80.5C15.9,-82.5,30.6,-83.6,44.7,-76.4Z",
        ]}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

// ── Tilt Card ──────────────────────────────────────────────────────────────────
function TiltCard({ icon: Icon, title, desc, gradient }: { icon: any; title: string; desc: string; gradient: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 20;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -20;
    setTilt({ x, y });
  };

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ rotateX: tilt.y, rotateY: tilt.x, transformStyle: "preserve-3d" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative rounded-3xl p-6 cursor-pointer overflow-hidden border border-white/10 shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
      </div>
      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
    </motion.div>
  );
}

// ── Scroll progress bar ────────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#F15A29] origin-left z-[100]" style={{ scaleX }} />;
}

// ── Text reveal ────────────────────────────────────────────────────────────────
function RevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <motion.span key={i} className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.05, duration: 0.5 }}>
          {w}
        </motion.span>
      ))}
    </p>
  );
}

// ── Glowing ring ───────────────────────────────────────────────────────────────
function GlowRing({ size, color, duration }: { size: number; color: string; duration: number }) {
  return (
    <motion.div className="absolute rounded-full border-2 pointer-events-none"
      style={{ width: size, height: size, borderColor: color, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

// ── Typewriter ─────────────────────────────────────────────────────────────────
const WORDS = ["Excellence", "Innovation", "Leadership", "Creativity", "Brilliance"];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timer = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timer = setTimeout(() => setDeleting(true), 1500);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx(i => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx]);

  return (
    <span className="text-[#F15A29]">
      {displayed}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
    </span>
  );
}

// ── Stat Card (extracted to respect rules of hooks) ───────────────────────────
function StatCard({ stat, index }: { stat: { label: string; value: number; suffix?: string }; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="text-center">
      <p className="text-4xl sm:text-5xl font-black text-[#F15A29]">
        <Counter to={stat.value} suffix={stat.suffix ?? ""} />
      </p>
      <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
    </motion.div>
  );
}

// ── PARTICLES config ───────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: Math.random() * 100, y: Math.random() * 100,
  size: 4 + Math.random() * 8,
  color: i % 3 === 0 ? "#F15A29" : i % 3 === 1 ? "#8B1E2D" : "#ffffff",
  delay: Math.random() * 3,
}));

const STATS = [
  { label: "Students Enrolled", value: 2800, suffix: "+" },
  { label: "Years of Excellence", value: 25,   suffix: "+" },
  { label: "Award-Winning Faculty", value: 120, suffix: "+" },
  { label: "Campus Acres",          value: 15,  suffix: "" },
];

const FEATURES = [
  { icon: Sparkles, title: "Smart Classrooms",     desc: "AI-powered interactive boards and immersive 3D learning tools for every subject.",                gradient: "from-orange-500 to-red-600" },
  { icon: Globe,    title: "Global Curriculum",     desc: "IB & CBSE integrated syllabus preparing students for universities worldwide.",                    gradient: "from-[#8B1E2D] to-purple-700" },
  { icon: Zap,      title: "Innovation Lab",        desc: "Robotics, coding, electronics — a fully equipped maker-space for young innovators.",               gradient: "from-yellow-500 to-orange-600" },
  { icon: Layers,   title: "Holistic Development",  desc: "Sports, arts, music, theatre — designed to nurture every dimension of a student's personality.",  gradient: "from-blue-600 to-indigo-700" },
  { icon: Award,    title: "National Achievers",    desc: "Consistent top rankers in CBSE boards, Olympiads, and national-level competitions.",               gradient: "from-green-600 to-teal-700" },
  { icon: Star,     title: "Alumni Network",        desc: "2000+ alumni in IITs, IIMs, Oxford, MIT — a powerful network you join for life.",                  gradient: "from-pink-600 to-rose-700" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Showcase() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(heroScroll, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      <ScrollProgressBar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Particles */}
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

        {/* Blobs */}
        <motion.div className="absolute w-[600px] h-[600px] -top-40 -left-40 opacity-30" style={{ y: heroY }}>
          <MorphBlob color="#F15A29" />
        </motion.div>
        <motion.div className="absolute w-[500px] h-[500px] -bottom-20 -right-20 opacity-20" style={{ y: heroY }}>
          <MorphBlob color="#8B1E2D" />
        </motion.div>

        {/* Rings */}
        <div className="absolute left-1/2 top-1/2">
          <GlowRing size={300} color="#F15A29" duration={3} />
          <GlowRing size={500} color="#8B1E2D" duration={4.5} />
          <GlowRing size={700} color="#F15A29" duration={6} />
        </div>

        {/* Content */}
        <motion.div className="relative z-10 text-center px-6 max-w-4xl" style={{ opacity: heroOpacity }}>
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm px-4 py-2 rounded-full mb-8 backdrop-blur">
            <Sparkles className="w-4 h-4 text-[#F15A29]" /> School of the Future
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            Shaping Minds <br /> With <Typewriter />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Birla Open Minds International School — where world-class education meets limitless potential.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a href="/admissions" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-[#F15A29] text-white font-bold rounded-2xl shadow-lg hover:bg-[#d94e22] transition text-base">
              Apply Now →
            </motion.a>
            <motion.a href="/student-portal" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition text-base backdrop-blur">
              Student Portal
            </motion.a>
          </motion.div>

          {/* Scroll hint */}
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown className="w-6 h-6 text-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── REVEAL TEXT ── */}
      <section className="py-24 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RevealText
            text="We don't just teach students. We shape the thinkers, leaders, and innovators who will define tomorrow."
            className="text-2xl sm:text-4xl font-bold text-white leading-tight"
          />
          <motion.div className="mt-8 h-1 bg-gradient-to-r from-transparent via-[#F15A29] to-transparent"
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }} />
        </div>
      </section>

      {/* ── 3D TILT CARDS ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Why BOMIS Stands Apart</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Hover the cards to experience our 3D interactive showcase</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 1000 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <TiltCard {...f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL SCROLL MARQUEE ── */}
      <section className="py-10 bg-[#F15A29] overflow-hidden">
        <motion.div className="flex gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white/90 text-lg font-semibold shrink-0">
              🏆 BOMIS · Rajound · Excellence in Education · Nurturing Future Leaders ·
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── PARALLAX GALLERY ── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-14">
            Campus Life
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "/attached_assets/generated_images/hero-1.jpg", label: "Our Campus",      delay: 0     },
              { src: "/attached_assets/generated_images/hero-2.jpg", label: "Modern Spaces",   delay: 0.15  },
              { src: "/attached_assets/generated_images/hero-3.jpg", label: "Student Life",    delay: 0.3   },
            ].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: img.delay, duration: 0.7 }}
                whileHover={{ y: -8 }}
                className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer">
                <img src={img.src} alt={img.label} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white font-bold text-lg">{img.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-r from-[#F15A29] to-[#8B1E2D] relative overflow-hidden">
        <motion.div className="absolute inset-0 opacity-20"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black text-white mb-6">
            Your Child's Future Starts Here
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg mb-10">
            Join 2800+ students experiencing world-class education at BOMIS, Rajound.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a href="/admissions" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white text-[#F15A29] font-bold rounded-2xl shadow-xl hover:shadow-2xl transition text-base">
              Begin Admission Process →
            </motion.a>
            <motion.a href="/contact" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white/20 border border-white/40 text-white font-bold rounded-2xl hover:bg-white/30 transition text-base">
              Talk to Us
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
