import { useAdmissionDrawer } from "@/context/AdmissionDrawerContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, GraduationCap, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInquiry } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Parent/Guardian name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  studentName: z.string().min(2, "Student name is required"),
  gradeApplying: z.string().min(1, "Please select a grade"),
  message: z.string().min(10, "Please provide some details about your inquiry"),
});

type FormValues = z.infer<typeof formSchema>;

export function AdmissionDrawer() {
  const { isOpen, close } = useAdmissionDrawer();
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", studentName: "", gradeApplying: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    createInquiry.mutate({ data: { ...values, type: "admission" } }, {
      onSuccess: () => {
        setSubmitted(true);
        form.reset();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your inquiry. Please try again." });
      },
    });
  };

  const handleClose = () => {
    close();
    setTimeout(() => setSubmitted(false), 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — blurred transparent */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-xl max-h-[90vh] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#F15A29] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Admission Inquiry</h2>
                    <p className="text-white/75 text-xs">Bright Open Minds Rajound — 2025–26</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center py-10 gap-5"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Inquiry Submitted!</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Thank you for your interest in Bright Open Minds. Our admissions team will call you within 24 hours.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-[#F15A29] text-white font-semibold rounded-lg hover:bg-[#d94e22] transition-colors text-sm"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-muted-foreground text-sm mb-5">
                        Fill out this form and our admissions counselor will contact you shortly.
                      </p>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Parent / Guardian Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="studentName" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Student Name</FormLabel>
                                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="phone" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Phone Number</FormLabel>
                                <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Email Address</FormLabel>
                                <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <FormField control={form.control} name="gradeApplying" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Grade Applying For</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Nursery","KG 1","KG 2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Specific Queries (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any questions about curriculum, transport, boarding, etc."
                                  className="min-h-[80px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <Button
                            type="submit"
                            className="w-full bg-[#F15A29] hover:bg-[#d94e22] text-white font-semibold py-5"
                            disabled={createInquiry.isPending}
                          >
                            {createInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
                          </Button>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
