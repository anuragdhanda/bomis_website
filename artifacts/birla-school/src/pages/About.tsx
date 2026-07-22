import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Trophy, Bus, MonitorPlay, Coffee } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/attached_assets/generated_images/hero-1.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            About Us
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            Discover the legacy, vision, and people behind Birla Open Minds International School, Bhopal.
          </motion.p>
        </div>
      </section>

      {/* History & Philosophy */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none text-muted-foreground"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Legacy</h2>
            <p className="lead text-xl text-foreground/80 text-center font-medium mb-12">
              Birla Open Minds International School, Bhopal is a collaborative initiative of the Birla Edutech family, committed to bringing high-quality education to the heart of Madhya Pradesh.
            </p>
            <p>
              We believe in creating a happy learning environment where children are eager to learn and explore. Our curriculum is designed to be comprehensive and holistic, focusing on the cognitive, emotional, and physical development of every child. We don't just teach subjects; we nurture independent thinkers, creative problem-solvers, and compassionate global citizens.
            </p>
            <p>
              Located in a sprawling, modern campus, our school integrates traditional Indian values with contemporary global educational practices. Our state-of-the-art infrastructure provides the perfect canvas for our educators to craft engaging, meaningful learning experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl shadow-sm border border-border"
            >
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="w-12 h-1 bg-primary rounded-full"></span> Vision
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To be a centre of excellence in education that nurtures global citizens who are intellectually curious, emotionally resilient, and socially responsible, ready to thrive in a dynamic world.
              </p>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl shadow-sm border border-border"
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
                <span className="w-12 h-1 bg-secondary rounded-full"></span> Mission
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To provide a stimulating learning environment that encourages experiential learning, innovative thinking, and ethical behavior, guided by expert educators and supported by robust infrastructure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Our Leadership</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Chairman */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 items-start bg-card p-8 rounded-2xl border border-border shadow-sm"
            >
              <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src="/attached_assets/generated_images/chairman.jpg" alt="Chairman" className="w-full h-full object-cover" />
                </div>
                <div className="mt-4 text-center md:text-left">
                  <h4 className="font-bold text-lg text-foreground">Mr. Yashovardhan Birla</h4>
                  <p className="text-primary font-medium text-sm">Chairman</p>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="text-4xl text-secondary mb-4 font-serif">"</div>
                <p className="text-muted-foreground italic mb-4">
                  Education is not merely about imparting facts; it is about awakening curiosity, building character, and preparing minds for the challenges of tomorrow. At Birla Open Minds, we are committed to upholding this philosophy in every classroom, every day.
                </p>
              </div>
            </motion.div>

            {/* Principal */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-8 items-start bg-card p-8 rounded-2xl border border-border shadow-sm"
            >
              <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src="/attached_assets/generated_images/principal.jpg" alt="Principal" className="w-full h-full object-cover" />
                </div>
                <div className="mt-4 text-center md:text-left">
                  <h4 className="font-bold text-lg text-foreground">Dr. Meera Menon</h4>
                  <p className="text-primary font-medium text-sm">Principal</p>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="text-4xl text-secondary mb-4 font-serif">"</div>
                <p className="text-muted-foreground italic mb-4">
                  We believe that every child is unique and has the potential to excel. Our role as educators is to discover that spark and fan it into a flame. Welcome to a school where your child's happiness and growth are our paramount focus.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infrastructure Preview */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">World-Class Infrastructure</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A thoughtfully designed campus that supports holistic learning and physical well-being.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: BookOpen, title: "Library Resource Center" },
              { icon: FlaskConical, title: "Science & Tech Labs" },
              { icon: Trophy, title: "Sports Complex" },
              { icon: MonitorPlay, title: "Smart Classrooms" },
              { icon: Bus, title: "Safe Transport" },
              { icon: Coffee, title: "Hygienic Cafeteria" }
            ].map((facility, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border p-6 rounded-xl text-center hover:shadow-md transition-shadow group"
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <facility.icon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-foreground">{facility.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
