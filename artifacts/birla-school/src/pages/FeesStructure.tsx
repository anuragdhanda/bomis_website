import { motion } from "framer-motion";
import { IndianRupee, Info, CheckCircle2, Phone } from "lucide-react";
import { Link } from "wouter";

const feeData = [
  {
    category: "Pre-Primary",
    grades: "Nursery · KG 1 · KG 2",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-[#F15A29]",
    rows: [
      { label: "Registration Fee (One-time)", amount: "₹ 5,000" },
      { label: "Admission Fee (One-time)", amount: "₹ 15,000" },
      { label: "Annual Tuition Fee", amount: "₹ 60,000" },
      { label: "Development Fee (Annual)", amount: "₹ 8,000" },
      { label: "Smart Class & Lab Fee (Annual)", amount: "₹ 6,000" },
      { label: "Sports & Activity Fee (Annual)", amount: "₹ 5,000" },
    ],
    total: "₹ 79,000 / year",
  },
  {
    category: "Primary",
    grades: "Grade 1 – Grade 5",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-[#1E3A5F]",
    rows: [
      { label: "Registration Fee (One-time)", amount: "₹ 5,000" },
      { label: "Admission Fee (One-time)", amount: "₹ 20,000" },
      { label: "Annual Tuition Fee", amount: "₹ 75,000" },
      { label: "Development Fee (Annual)", amount: "₹ 10,000" },
      { label: "Smart Class & Lab Fee (Annual)", amount: "₹ 8,000" },
      { label: "Sports & Activity Fee (Annual)", amount: "₹ 6,000" },
    ],
    total: "₹ 99,000 / year",
  },
  {
    category: "Middle School",
    grades: "Grade 6 – Grade 8",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-[#2D7A3A]",
    rows: [
      { label: "Registration Fee (One-time)", amount: "₹ 5,000" },
      { label: "Admission Fee (One-time)", amount: "₹ 22,000" },
      { label: "Annual Tuition Fee", amount: "₹ 90,000" },
      { label: "Development Fee (Annual)", amount: "₹ 12,000" },
      { label: "Smart Class & Lab Fee (Annual)", amount: "₹ 10,000" },
      { label: "Sports & Activity Fee (Annual)", amount: "₹ 7,000" },
    ],
    total: "₹ 1,19,000 / year",
  },
  {
    category: "Secondary",
    grades: "Grade 9 – Grade 10",
    color: "bg-purple-50 border-purple-200",
    headerColor: "bg-[#5B2D8E]",
    rows: [
      { label: "Registration Fee (One-time)", amount: "₹ 5,000" },
      { label: "Admission Fee (One-time)", amount: "₹ 25,000" },
      { label: "Annual Tuition Fee", amount: "₹ 1,10,000" },
      { label: "Development Fee (Annual)", amount: "₹ 14,000" },
      { label: "Smart Class & Lab Fee (Annual)", amount: "₹ 12,000" },
      { label: "Sports & Activity Fee (Annual)", amount: "₹ 8,000" },
    ],
    total: "₹ 1,44,000 / year",
  },
  {
    category: "Senior Secondary",
    grades: "Grade 11 – Grade 12",
    color: "bg-red-50 border-red-200",
    headerColor: "bg-[#B22222]",
    rows: [
      { label: "Registration Fee (One-time)", amount: "₹ 5,000" },
      { label: "Admission Fee (One-time)", amount: "₹ 28,000" },
      { label: "Annual Tuition Fee", amount: "₹ 1,30,000" },
      { label: "Development Fee (Annual)", amount: "₹ 16,000" },
      { label: "Smart Class & Lab Fee (Annual)", amount: "₹ 14,000" },
      { label: "Sports & Activity Fee (Annual)", amount: "₹ 9,000" },
    ],
    total: "₹ 1,69,000 / year",
  },
];

const notes = [
  "Registration and Admission fees are non-refundable and paid once at the time of enrollment.",
  "Annual fees can be paid in two installments — April and October.",
  "Transport charges are separate and depend on the route distance.",
  "Fees are subject to revision each academic year with prior notice.",
  "Fee concessions are available for siblings (10% on tuition) and merit scholarships.",
];

export default function FeesStructure() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F15A29 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 50%)" }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6"
          >
            <IndianRupee className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Fee Structure
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            Transparent and affordable fee structure for Academic Year 2025–26.
          </motion.p>
        </div>
      </section>

      {/* Fee Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {feeData.map((section, idx) => (
              <motion.div
                key={section.category}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${section.color}`}
              >
                {/* Card Header */}
                <div className={`${section.headerColor} px-6 py-5 text-white`}>
                  <h3 className="text-xl font-bold">{section.category}</h3>
                  <p className="text-white/75 text-sm mt-1">{section.grades}</p>
                </div>

                {/* Fee Rows */}
                <div className="px-6 py-4 space-y-3">
                  {section.rows.map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground">{row.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Total Footer */}
                <div className="mx-6 mb-6 mt-2 rounded-xl bg-white/70 border border-border px-5 py-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Annual Total</span>
                  <span className="text-base font-bold text-[#F15A29]">{section.total}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note: excluding one-time fees */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            * Annual Total excludes one-time Registration &amp; Admission fees.
          </motion.p>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Important Notes</h2>
            </div>
            <ul className="space-y-4">
              {notes.map((note, idx) => (
                <motion.li
                  key={idx}
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex gap-3 items-start"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{note}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Our admissions team is happy to clarify fee details or discuss scholarship opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admissions"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply for Admission
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
