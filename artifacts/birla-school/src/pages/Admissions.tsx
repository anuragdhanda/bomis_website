import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInquiry } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, FileText, UserPlus, Calendar, PhoneCall, IndianRupee, Info } from "lucide-react";
import { useToast as useToastHook } from "@/hooks/use-toast";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string().min(2, "Parent/Guardian name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  studentName: z.string().min(2, "Student name is required"),
  gradeApplying: z.string().min(1, "Please select a grade"),
  message: z.string().min(10, "Please provide some details about your inquiry"),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { icon: FileText, title: "1. Online Inquiry", desc: "Fill out the admission inquiry form to register your interest." },
  { icon: PhoneCall, title: "2. Counselor Call", desc: "Our admissions counselor will contact you to discuss details." },
  { icon: Calendar, title: "3. Campus Visit", desc: "Schedule a campus tour and interactive session for the student." },
  { icon: UserPlus, title: "4. Registration", desc: "Submit the formal application form with required documents." },
  { icon: CheckCircle2, title: "5. Enrollment", desc: "Complete fee payment to secure admission." },
];

const feeData = [
  {
    category: "Pre-Primary",
    grades: "Nursery · KG 1 · KG 2",
    headerColor: "bg-[#F15A29]",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
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
    headerColor: "bg-[#1E3A5F]",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
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
    headerColor: "bg-[#2D7A3A]",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
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
    headerColor: "bg-[#5B2D8E]",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
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
    headerColor: "bg-[#B22222]",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
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

const feeNotes = [
  "Registration and Admission fees are non-refundable and paid once at the time of enrollment.",
  "Annual fees can be paid in two installments — April and October.",
  "Transport charges are separate and depend on the route distance.",
  "Fees are subject to revision each academic year with prior notice.",
  "Fee concessions are available for siblings (10% on tuition) and merit scholarships.",
];

export default function Admissions() {
  const [activeTab, setActiveTab] = useState<"process" | "fees">("process");
  const { toast } = useToastHook();
  const createInquiry = useCreateInquiry();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", studentName: "", gradeApplying: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    createInquiry.mutate({ data: { ...values, type: "admission" } }, {
      onSuccess: () => {
        toast({ title: "Inquiry Submitted", description: "Thank you for your interest. Our admissions team will contact you soon." });
        form.reset();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your inquiry. Please try again." });
      },
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Admissions & Fee Structure
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            Join the Birla Open Minds community. Your child's journey to excellence starts here.
          </motion.p>

          {/* Tabs inside header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 inline-flex bg-white/10 backdrop-blur rounded-xl p-1 gap-1"
          >
            <button
              onClick={() => setActiveTab("process")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "process"
                  ? "bg-white text-secondary shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Admission Process
            </button>
            <button
              onClick={() => setActiveTab("fees")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "fees"
                  ? "bg-white text-secondary shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <IndianRupee className="h-4 w-4" />
              Fee Structure
            </button>
          </motion.div>
        </div>
      </section>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "process" ? (
          <motion.div
            key="process"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <section className="py-20 bg-background">
              <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* Left: Process + Age table */}
                  <div>
                    <div className="mb-12">
                      <h2 className="text-3xl font-bold text-foreground mb-6">Admission Process</h2>
                      <p className="text-muted-foreground mb-8">
                        We believe in a transparent and smooth admission process. Admissions are granted on a first-come, first-served basis, subject to availability of seats and eligibility criteria.
                      </p>
                      <div className="space-y-6">
                        {steps.map((step, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-4 items-start"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <step.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-foreground">{step.title}</h4>
                              <p className="text-muted-foreground text-sm">{step.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-6">Age Eligibility</h3>
                      <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-foreground uppercase">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Grade</th>
                              <th className="px-6 py-4 font-semibold">Age Criteria (as on March 31st)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {[["Nursery","3 Years"],["KG 1","4 Years"],["KG 2","5 Years"],["Grade 1","6 Years"]].map(([grade, age]) => (
                              <tr key={grade} className="bg-card">
                                <td className="px-6 py-4 font-medium">{grade}</td>
                                <td className="px-6 py-4 text-muted-foreground">{age}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: Inquiry Form */}
                  <div>
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-md sticky top-28">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Admission Inquiry</h3>
                      <p className="text-muted-foreground mb-8 text-sm">
                        Fill out this form to request a call back from our admissions team.
                      </p>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parent/Guardian Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="studentName" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Student Name</FormLabel>
                                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="gradeApplying" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade Applying For</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Nursery","KG 1","KG 2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 11"].map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Any specific queries?</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Please let us know if you have any specific questions about curriculum, transport, etc." className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <Button type="submit" className="w-full text-lg py-6" disabled={createInquiry.isPending}>
                            {createInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="fees"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
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
                      transition={{ delay: idx * 0.08 }}
                      className={`rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${section.bgColor} ${section.borderColor}`}
                    >
                      <div className={`${section.headerColor} px-6 py-5 text-white`}>
                        <h3 className="text-xl font-bold">{section.category}</h3>
                        <p className="text-white/75 text-sm mt-1">{section.grades}</p>
                      </div>
                      <div className="px-6 py-4 space-y-3">
                        {section.rows.map((row) => (
                          <div key={row.label} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-semibold text-foreground">{row.amount}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mx-6 mb-6 mt-2 rounded-xl bg-white/70 border border-border px-5 py-4 flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground">Annual Total</span>
                        <span className="text-base font-bold text-[#F15A29]">{section.total}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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

            {/* Notes */}
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
                    {feeNotes.map((note, idx) => (
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
                    <button
                      onClick={() => setActiveTab("process")}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Apply for Admission
                    </button>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Contact Us
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
