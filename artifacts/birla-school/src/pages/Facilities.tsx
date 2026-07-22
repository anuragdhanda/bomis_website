import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Trophy, Bus, MonitorPlay, Coffee } from "lucide-react";

const FACILITIES = [
  {
    title: "Library Resource Center",
    icon: BookOpen,
    image: "/attached_assets/generated_images/library.jpg",
    description: "Our expansive library is a haven for readers and researchers. Stocked with thousands of physical books, digital resources, periodicals, and academic journals, it provides a quiet, inspiring environment for students to expand their horizons beyond the classroom."
  },
  {
    title: "Science & Tech Labs",
    icon: FlaskConical,
    image: "/attached_assets/generated_images/science-lab.jpg",
    description: "Equipped with the latest apparatus and safety gear, our Physics, Chemistry, and Biology labs encourage hands-on scientific exploration. Dedicated tech labs ensure students are proficient in modern computing and coding from an early age."
  },
  {
    title: "Sports Complex",
    icon: Trophy,
    image: "/attached_assets/generated_images/sports.jpg",
    description: "Physical education is integral to our curriculum. Our sprawling sports complex includes a full-size football field, basketball courts, a swimming pool, and an indoor games arena, fostering teamwork, discipline, and physical fitness."
  },
  {
    title: "Safe Transport",
    icon: Bus,
    image: "/attached_assets/generated_images/transport.jpg",
    description: "We offer a fleet of modern, GPS-enabled air-conditioned buses covering all major routes in Bhopal. Each bus is staffed with a trained driver and a female attendant, ensuring the utmost safety and comfort for your child's commute."
  },
  {
    title: "Smart Classrooms",
    icon: MonitorPlay,
    image: "/attached_assets/generated_images/smart-classes.jpg",
    description: "Learning comes alive in our smart classrooms. Equipped with interactive flat panels, digital content repositories, and ergonomic furniture, these spaces are designed to make learning highly engaging, visual, and interactive."
  },
  {
    title: "Hygienic Cafeteria",
    icon: Coffee,
    image: "/attached_assets/generated_images/cafeteria.jpg",
    description: "Our modern cafeteria serves nutritious, balanced, and delicious meals prepared under strict hygiene standards. The menu is regularly updated in consultation with nutritionists to ensure students get the energy they need for a productive day."
  }
];

export default function Facilities() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/attached_assets/generated_images/smart-classes.jpg')] bg-cover bg-center opacity-20 mix-blend-multiply" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Campus Facilities
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Explore our state-of-the-art infrastructure designed to provide a safe, engaging, and comprehensive learning environment.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {FACILITIES.map((facility, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 2) * 0.1 }}
                className="group flex flex-col sm:flex-row gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full sm:w-1/2 shrink-0 h-48 sm:h-auto rounded-xl overflow-hidden relative">
                  <img 
                    src={facility.image} 
                    alt={facility.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="w-full sm:w-1/2 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    <facility.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{facility.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {facility.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
