import { useAdminAuth } from "@/lib/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, ShieldAlert, Mail, ArrowLeft, CheckCircle2,
  UserPlus, LogIn, RefreshCw, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BASE_API = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Schemas ──────────────────────────────────────────────────────────────────
const emailSchema   = z.object({ email: z.string().email("Enter a valid email address") });
const otpSchema     = z.object({ otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must be numeric") });
const registerSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  email:    z.string().email("Enter a valid email address"),
  adminKey: z.string().min(1, "Admin key is required"),
});

// ─── Resend countdown hook ────────────────────────────────────────────────────
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setRemaining(seconds);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(timer.current!); return 0; }
        return r - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  return { remaining, start };
}

// ─── OTP input — 6 individual boxes ──────────────────────────────────────────
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = value.split("").map((c, i) => (i === idx ? digit : c));
    while (next.length < 6) next.push("");
    const joined = next.join("").slice(0, 6);
    onChange(joined);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[idx] && idx > 0) {
        const next = value.split("");
        next[idx - 1] = "";
        onChange(next.join(""));
        inputs.current[idx - 1]?.focus();
      } else {
        const next = value.split("");
        next[idx] = "";
        onChange(next.join(""));
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all
            border-border bg-background text-foreground
            focus:border-primary focus:ring-2 focus:ring-primary/20
            caret-transparent"
          style={{ height: "52px" }}
        />
      ))}
    </div>
  );
}

// ─── OTP Login Flow ───────────────────────────────────────────────────────────
function OtpLoginFlow() {
  const { login } = useAdminAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [otpError, setOtpError] = useState("");
  const { remaining: resendCooldown, start: startCooldown } = useCountdown(60);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const sendOtp = async (values: z.infer<typeof emailSchema>) => {
    setLoadingSend(true);
    try {
      const res = await fetch(`${BASE_API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
      setPendingEmail(values.email);
      setStep("otp");
      startCooldown();
      toast({ title: "OTP Sent", description: "Check your email for the 6-digit code." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoadingSend(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoadingSend(true);
    otpForm.reset();
    setOtpError("");
    try {
      const res = await fetch(`${BASE_API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to resend OTP");
      startCooldown();
      toast({ title: "OTP Resent", description: "A new code has been sent to your email." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoadingSend(false);
    }
  };

  const verifyOtp = async (values: z.infer<typeof otpSchema>) => {
    setLoadingVerify(true);
    setOtpError("");
    try {
      const res = await fetch(`${BASE_API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: values.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      login(data.token);
      toast({ title: "Login Successful", description: "Welcome to the Admin Portal" });
      setLocation("/admin");
    } catch (err: any) {
      setOtpError(err.message);
      otpForm.reset();
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "email" && (
        <motion.div key="email-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-5">
              <FormField control={emailForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Registered Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="admin@school.com" className="pl-9" autoFocus {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loadingSend}>
                {loadingSend ? (
                  <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Sending…</span>
                ) : (
                  <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Send OTP</span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                A 6-digit code will be sent to your registered email.
              </p>
            </form>
          </Form>
        </motion.div>
      )}

      {step === "otp" && (
        <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <button
            onClick={() => { setStep("email"); setOtpError(""); otpForm.reset(); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Change email
          </button>

          <p className="text-sm text-muted-foreground mb-1">
            Enter the 6-digit code sent to:
          </p>
          <p className="text-sm font-semibold text-foreground mb-5">{pendingEmail}</p>

          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-5">
              <FormField control={otpForm.control} name="otp" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <OtpBoxes value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )} />

              <AnimatePresence>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    {otpError}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loadingVerify || otpForm.watch("otp").length < 6}>
                {loadingVerify ? (
                  <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Verifying…</span>
                ) : (
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Verify & Sign In</span>
                )}
              </Button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Resend available in <span className="font-semibold text-foreground">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loadingSend}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    {loadingSend ? "Resending…" : "Resend OTP"}
                  </button>
                )}
              </div>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", adminKey: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setDone(true);
      toast({ title: "Account Created", description: `Admin "${values.username}" created. You can now sign in via OTP.` });
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
        <h3 className="text-lg font-semibold mb-2">Account Created!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Switch to <strong>Sign In</strong> and use your email to receive an OTP.
        </p>
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
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="admin@school.com" className="pl-9" {...field} />
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">Login OTP will be sent to this email.</p>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="adminKey" render={({ field }) => (
          <FormItem>
            <FormLabel>Admin Secret Key</FormLabel>
            <FormControl><Input type="password" placeholder="Secret key from system admin" {...field} /></FormControl>
            <p className="text-xs text-muted-foreground mt-1">Contact the system administrator for this key.</p>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
          {loading ? "Creating Account…" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Main AdminLogin Page ─────────────────────────────────────────────────────
export default function AdminLogin() {
  const { isLoggedIn } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (isLoggedIn) setLocation("/admin");
  }, [isLoggedIn, setLocation]);

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
          <p className="text-muted-foreground mt-2">Bright Open Minds International School</p>
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

          <TabsContent value="login" className="px-8 pb-6 mt-0 pt-6">
            <OtpLoginFlow />
          </TabsContent>

          <TabsContent value="register" className="px-8 pb-6 mt-0 pt-6">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        <div className="px-8 py-4 bg-muted/50 text-center border-t border-border">
          <a href="/" className="text-sm text-primary hover:underline font-medium">
            ← Return to Main Site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
