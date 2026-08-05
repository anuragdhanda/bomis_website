import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle2, Lightbulb, MonitorPlay, Puzzle, Users } from "lucide-react";

const INFRA_IMAGES = [
  { src: "/gallery/infra-building-front.png", alt: "School Building Front View" },
  { src: "/gallery/infra-entrance.png", alt: "School Entrance" },
  { src: "/gallery/infra-building-2.png", alt: "School Infrastructure" },
  { src: "/gallery/infra-building-3.png", alt: "Campus Block" },
  { src: "/gallery/infra-building-4.png", alt: "Campus Wing" },
  { src: "/gallery/infra-building-side.png", alt: "Building Side View" },
  { src: "/gallery/infra-building-field.png", alt: "School Ground & Field" },
  { src: "/gallery/school-building.png", alt: "School Overview" },
];

const CURRICULUM_DATA = {
  preprimary: {
    title: "Pre-Primary (Early Years)",
    description: "Our Early Years program focuses on holistic development through play-based learning. We nurture curiosity, creativity, and foundational skills in a safe, caring environment.",
    subjects: ["Language & Literacy", "Numeracy & Logic", "Environmental Awareness", "Creative Arts", "Physical Education", "Social & Emotional Learning"],
    methodology: "Play-way method, sensory exploration, thematic learning, and interactive storytelling."
  },
  primary: {
    title: "Primary (Grades 1-5)",
    description: "The Primary curriculum encourages inquiry and independent thinking. We build strong academic foundations while fostering creativity and moral values.",
    subjects: ["English", "Hindi / Regional Language", "Mathematics", "Environmental Studies (EVS)", "Computer Science", "Visual & Performing Arts", "Physical Education"],
    methodology: "Project-based learning, collaborative group work, hands-on activities, and continuous assessment."
  },
  middle: {
    title: "Middle School (Grades 6-8)",
    description: "Middle school marks the transition to more structured academic disciplines. We emphasize analytical thinking, problem-solving, and self-expression.",
    subjects: ["English Literature & Language", "Hindi", "Third Language (Sanskrit/French)", "Mathematics", "Science (Physics, Chemistry, Biology)", "Social Science (History, Geography, Civics)", "Information Technology"],
    methodology: "Research-driven projects, interdisciplinary approach, debates, seminars, and practical laboratory work."
  },
  senior: {
    title: "Senior School (Grades 9-12)",
    description: "Our Senior program prepares students for board examinations and higher education. We focus on academic rigor, career guidance, and leadership skills.",
    subjects: ["Science Stream (PCM/PCB)", "Commerce Stream", "Humanities Stream", "Core Languages", "Physical Education", "Various Electives"],
    methodology: "In-depth academic instruction, career counseling, practical application of concepts, and board exam preparation strategies."
  }
};

export default function Academics() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/attached_assets/generated_images/library.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Academics
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            A comprehensive curriculum designed to foster intellectual growth and lifelong learning.
          </motion.p>
        </div>
      </section>

      {/* Curriculum Tabs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Curriculum</h2>
            <p className="text-muted-foreground">Tailored educational journeys for every stage of development.</p>
          </div>

          <Tabs defaultValue="primary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto mb-8 bg-muted/50 p-1">
              <TabsTrigger value="preprimary" className="py-3 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Pre-Primary</TabsTrigger>
              <TabsTrigger value="primary" className="py-3 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Primary</TabsTrigger>
              <TabsTrigger value="middle" className="py-3 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Middle</TabsTrigger>
              <TabsTrigger value="senior" className="py-3 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Senior</TabsTrigger>
            </TabsList>
            
            {Object.entries(CURRICULUM_DATA).map(([key, data]) => (
              <TabsContent key={key} value={key} className="mt-0 outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-8 shadow-sm"
                >
                  <h3 className="text-2xl font-bold text-foreground mb-4">{data.title}</h3>
                  <p className="text-lg text-muted-foreground mb-8">{data.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Core Subjects
                      </h4>
                      <ul className="space-y-3">
                        {data.subjects.map((subject, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            <span className="text-foreground/80">{subject}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
                      <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" /> Teaching Methodology
                      </h4>
                      <p className="text-foreground/80 leading-relaxed">
                        {data.methodology}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="py-24 bg-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Teaching Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We go beyond textbooks to ensure students truly understand and can apply their knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl border border-border shadow-sm text-center"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Puzzle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Experiential Learning</h3>
              <p className="text-muted-foreground">
                Learning by doing. We emphasize practical experiments, field trips, and hands-on activities that make abstract concepts concrete and memorable.
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl border border-border shadow-sm text-center"
            >
              <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Personalized Attention</h3>
              <p className="text-muted-foreground">
                With favorable student-teacher ratios, educators can identify individual learning styles and adapt their teaching to help every student succeed.
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl border border-border shadow-sm text-center"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <MonitorPlay className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Technology Integration</h3>
              <p className="text-muted-foreground">
                Smart classrooms and digital resources complement traditional teaching, making lessons more engaging and preparing students for a digital world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infrastructure Gallery */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Infrastructure</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A world-class campus built to inspire learning — modern facilities, open spaces, and a nurturing environment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {INFRA_IMAGES.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border shadow-sm"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-sm font-medium">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
