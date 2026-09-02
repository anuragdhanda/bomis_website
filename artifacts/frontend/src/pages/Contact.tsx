import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInquiry } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  message: z.string().min(10, "Please provide a detailed message"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createInquiry.mutate({
      data: {
        ...values,
        type: "contact",
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "Thank you for reaching out. We will get back to you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "There was an error sending your message. Please try again.",
        });
      }
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            We'd love to hear from you. Get in touch with us for any inquiries or assistance.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            
            {/* Left Col: Contact Info & Map */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col space-y-12"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-8">Get in Touch</h2>
                
                <div className="space-y-6">
                  {/* Address — opens Google Maps */}
                  <a
                    href="https://maps.google.com/?q=Bright+Open+Minds+International+School+Rajound+Haryana+136044"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">Campus Address</h4>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-primary/80 transition-colors">
                        Bright Open Minds<br />
                        HG85+W74, Assandh Kaithal Road,<br />
                        Rajound, Haryana 136044
                      </p>
                      <span className="text-xs text-primary mt-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity">Open in Maps →</span>
                    </div>
                  </a>

                  {/* Phone — tap to call */}
                  <a
                    href="tel:+919653424964"
                    className="flex gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">Phone</h4>
                      <p className="text-muted-foreground group-hover:text-primary transition-colors">+91 96534 24964</p>
                      <span className="text-xs text-primary mt-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity">Tap to call →</span>
                    </div>
                  </a>

                  {/* Emails — tap to compose */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-foreground mb-1">Email</h4>
                      <a
                        href="mailto:info.rajound@brightopenminds.com"
                        className="block text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                      >
                        info.rajound@brightopenminds.com
                      </a>
                      <a
                        href="mailto:admissions.rajound@brightopenminds.com"
                        className="block text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                      >
                        admissions.rajound@brightopenminds.com
                      </a>
                    </div>
                  </div>

                  {/* Visiting Hours — static info */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1">Visiting Hours</h4>
                      <p className="text-muted-foreground">
                        Monday - Saturday: Open till 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden flex-1 min-h-[300px] border border-border shadow-sm">
                <iframe 
                  src="https://maps.google.com/maps?q=Bright+Open+Minds+International+School+Rajound+Haryana&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              </div>
            </motion.div>

            {/* Right Col: Contact Form */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col"
            >
              <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  Whether you have a question about admissions, curriculum, or anything else, our team is ready to answer all your questions.
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col flex-1">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex flex-col flex-1">
                          <FormLabel>Your Message</FormLabel>
                          <FormControl className="flex-1">
                            <Textarea 
                              placeholder="How can we help you?" 
                              className="flex-1 h-full resize-none"
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
                      {createInquiry.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
