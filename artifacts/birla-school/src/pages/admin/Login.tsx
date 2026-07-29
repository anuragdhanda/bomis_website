import { useAdminAuth } from "@/lib/store";
import { useAdminLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldAlert, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, UserPlus, LogIn, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Login schema ────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ─── Register schema ──────────────────────────────────────────────────────────
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid Gmail address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  adminKey: z.string().min(1, "Admin key is required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Forgot-password schemas ──────────────────────────────────────────────────
const step1Schema = z.object({ username: z.string().min(1, "Username is required") });
const step2Schema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── ForgotPasswordDialog ─────────────────────────────────────────────────────
function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [pendingUsername, setPendingUsername] = useState("");
  const [loadingStep1, setLoadingStep1] = useState(false);
  const [loadingStep2, setLoadingStep2] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { username: "" },
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const handleClose = () => {
    setStep(1);
    setPendingUsername("");
    step1Form.reset();
    step2Form.reset();
    onClose();
  };

  const onStep1Submit = async (values: z.infer<typeof step1Schema>) => {
    setLoadingStep1(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send OTP");
      }
      setPendingUsername(values.username);
      setStep(2);
      toast({ title: "OTP Sent", description: "Check the admin email for your OTP." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoadingStep1(false);
    }
  };

  const onStep2Submit = async (values: z.infer<typeof step2Schema>) => {
    setLoadingStep2(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: pendingUsername,
          otp: values.otp,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      setStep("done");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoadingStep2(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Forgot Password
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your admin username and we'll send an OTP to the registered email.
              </p>
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                  <FormField control={step1Form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input placeholder="adminbomis" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loadingStep1}>
                    {loadingStep1 ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit OTP sent to the admin email, then set a new password.
              </p>
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                  <FormField control={step2Form.control} name="otp" render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTP (6 digits)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" maxLength={6} inputMode="numeric" className="tracking-[0.4em] text-center font-mono text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={step2Form.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showNewPw ? "text" : "password"} placeholder="••••••••" {...field} />
                          <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={step2Form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPw ? "text" : "password"} placeholder="••••••••" {...field} />
                          <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loadingStep2}>
                    {loadingStep2 ? "Resetting…" : "Reset Password"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Password Reset!</h3>
              <p className="text-sm text-muted-foreground mb-6">Your password has been updated. You can now log in with your new password.</p>
              <Button onClick={handleClose} className="w-full">Back to Login</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────
function RegisterForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", adminKey: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          adminKey: values.adminKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setDone(true);
      toast({ title: "Account Created", description: `Admin "${values.username}" created successfully. You can now sign in.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Account Created!</h3>
        <p className="text-sm text-muted-foreground mb-6">Your admin account has been created. Switch to the Sign In tab to log in.</p>
        <Button variant="outline" className="w-full" onClick={() => { setDone(false); form.reset(); }}>
          Create Another Account
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input placeholder="newadmin" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Gmail Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="yourname@gmail.com" className="pl-9" {...field} />
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">OTP for password reset will be sent here.</p>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" {...field} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" {...field} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="adminKey" render={({ field }) => (
          <FormItem>
            <FormLabel>Admin Key</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showKey ? "text" : "password"} placeholder="Secret admin key" {...field} />
                <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">Contact the system administrator for the admin key.</p>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? "Creating Account…" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Main AdminLogin Page ─────────────────────────────────────────────────────
export default function AdminLogin() {
  const { isLoggedIn, login } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (isLoggedIn) setLocation("/admin");
  }, [isLoggedIn, setLocation]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token);
          toast({ title: "Login Successful", description: "Welcome to the Admin Portal" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials. Please try again." });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border bg-secondary/5 text-center">
          <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Admin Portal</h2>
          <p className="text-muted-foreground mt-2">Birla Open Minds International School</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <div className="px-8 pt-6">
            <TabsList className="w-full h-11">
              <TabsTrigger value="login" className="flex-1 gap-2 text-sm font-medium">
                <LogIn className="h-4 w-4" /> Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 gap-2 text-sm font-medium">
                <UserPlus className="h-4 w-4" /> Create Account
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sign In Tab */}
          <TabsContent value="login" className="px-8 pb-4 mt-0 pt-5">
            {loginMutation.isError && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">Invalid username or password.</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="adminbomis" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1.5">
                      <FormLabel className="mb-0">Password</FormLabel>
                      <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-primary hover:underline font-medium">
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Authenticating…" : "Sign In"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Create Account Tab */}
          <TabsContent value="register" className="px-8 pb-4 mt-0 pt-5">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        <div className="px-8 py-4 bg-muted/50 text-center border-t border-border">
          <a href="/" className="text-sm text-primary hover:underline font-medium">
            &larr; Return to Main Site
          </a>
        </div>
      </motion.div>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
