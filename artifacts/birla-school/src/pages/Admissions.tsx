import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInquiry } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, FileText, UserPlus, Calendar, PhoneCall } from "lucide-react";
import { useToast as useToastHook } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Parent/Guardian name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  studentName: z.string().min(2, "Student name is required"),
  gradeApplying: z.string().min(1, "Please select a grade"),
  message: z.string().min(10, "Please provide some details about your inquiry"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Admissions() {
  const { toast } = useToastHook();
  const createInquiry = useCreateInquiry();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      studentName: "",
      gradeApplying: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createInquiry.mutate({
      data: {
        ...values,
        type: "admission",
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Inquiry Submitted",
          description: "Thank you for your interest. Our admissions team will contact you soon.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "There was an error submitting your inquiry. Please try again.",
        });
      }
    });
  };

  const steps = [
    { icon: FileText, title: "1. Online Inquiry", desc: "Fill out the admission inquiry form to register your interest." },
    { icon: PhoneCall, title: "2. Counselor Call", desc: "Our admissions counselor will contact you to discuss details." },
    { icon: Calendar, title: "3. Campus Visit", desc: "Schedule a campus tour and interactive session for the student." },
    { icon: UserPlus, title: "4. Registration", desc: "Submit the formal application form with required documents." },
    { icon: CheckCircle2, title: "5. Enrollment", desc: "Complete fee payment to secure admission." }
  ];

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
            Admissions
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            Join the Birla Open Minds community. Your child's journey to excellence starts here.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Col: Info & Process */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Admission Process</h2>
                <p className="text-muted-foreground mb-8">
                  We believe in a transparent and smooth admission process. Admissions are granted on a first-come, first-served basis, subject to the availability of seats and eligibility criteria.
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
                      <tr className="bg-card">
                        <td className="px-6 py-4 font-medium">Nursery</td>
                        <td className="px-6 py-4 text-muted-foreground">3 Years</td>
                      </tr>
                      <tr className="bg-card">
                        <td className="px-6 py-4 font-medium">KG 1</td>
                        <td className="px-6 py-4 text-muted-foreground">4 Years</td>
                      </tr>
                      <tr className="bg-card">
                        <td className="px-6 py-4 font-medium">KG 2</td>
                        <td className="px-6 py-4 text-muted-foreground">5 Years</td>
                      </tr>
                      <tr className="bg-card">
                        <td className="px-6 py-4 font-medium">Grade 1</td>
                        <td className="px-6 py-4 text-muted-foreground">6 Years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Form */}
            <div>
              <div className="bg-card border border-border rounded-2xl p-8 shadow-md sticky top-28">
                <h3 className="text-2xl font-bold text-foreground mb-2">Admission Inquiry</h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  Fill out this form to request a call back from our admissions team.
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent/Guardian Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 98765 43210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="gradeApplying"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Applying For</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Nursery">Nursery</SelectItem>
                              <SelectItem value="KG 1">KG 1</SelectItem>
                              <SelectItem value="KG 2">KG 2</SelectItem>
                              <SelectItem value="Grade 1">Grade 1</SelectItem>
                              <SelectItem value="Grade 2">Grade 2</SelectItem>
                              <SelectItem value="Grade 3">Grade 3</SelectItem>
                              <SelectItem value="Grade 4">Grade 4</SelectItem>
                              <SelectItem value="Grade 5">Grade 5</SelectItem>
                              <SelectItem value="Grade 6">Grade 6</SelectItem>
                              <SelectItem value="Grade 7">Grade 7</SelectItem>
                              <SelectItem value="Grade 8">Grade 8</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Any specific queries?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please let us know if you have any specific questions about curriculum, transport, etc." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6"
                      disabled={createInquiry.isPending}
                    >
                      {createInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
