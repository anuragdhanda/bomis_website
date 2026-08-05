import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListFaculty,
  useCreateFacultyMember,
  useUpdateFacultyMember,
  useDeleteFacultyMember,
  getListFacultyQueryKey,
} from "@workspace/api-client-react";
import type { FacultyMember } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Pencil, Trash2, X, ImageOff, BookOpen, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const CLASS_LEVELS = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
] as const;

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  subject: z.string().min(2, "Subject is required"),
  qualification: z.string().min(2, "Qualification is required"),
  photoUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  classLevel: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function TeacherDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: FacultyMember | null;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateFacultyMember();
  const updateMutation = useUpdateFacultyMember();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          subject: editing.subject,
          qualification: editing.qualification,
          photoUrl: editing.photoUrl ?? "",
          classLevel: editing.classLevel ?? "",
          sortOrder: editing.sortOrder ?? 0,
        }
      : { name: "", subject: "", qualification: "", photoUrl: "", classLevel: "", sortOrder: 0 },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      subject: values.subject,
      qualification: values.qualification,
      photoUrl: values.photoUrl || undefined,
      classLevel: values.classLevel || undefined,
      sortOrder: values.sortOrder ?? 0,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
            toast({ title: "Teacher updated successfully" });
            onClose();
          },
          onError: () =>
            toast({ variant: "destructive", title: "Update failed", description: "Could not update teacher." }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
            toast({ title: "Teacher added successfully" });
            form.reset();
            onClose();
          },
          onError: () =>
            toast({ variant: "destructive", title: "Add failed", description: "Could not add teacher." }),
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-secondary">
                <h2 className="text-lg font-bold text-white">
                  {editing ? "Edit Teacher" : "Add New Teacher"}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              <div className="px-6 py-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mr. Rajiv Sharma" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mathematics" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. M.Sc., B.Ed." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="classLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Assignment <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CLASS_LEVELS.map((cls) => (
                                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/photo.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order <span className="text-muted-foreground font-normal">(lower = shown first)</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#F15A29] hover:bg-[#d94e22] text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : editing ? "Save Changes" : "Add Teacher"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

type FilterMode = "all" | "subject" | "class";

function TeacherCard({
  member,
  idx,
  isLoggedIn,
  onEdit,
  onDelete,
}: {
  member: FacultyMember;
  idx: number;
  isLoggedIn: boolean;
  onEdit: (m: FacultyMember) => void;
  onDelete: (m: FacultyMember) => void;
}) {
  return (
    <motion.div
      key={member.id}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 4) * 0.08 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
    >
      {isLoggedIn && (
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      )}

      <div className="aspect-[4/5] overflow-hidden bg-muted relative">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`${member.photoUrl ? "hidden" : ""} w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-secondary/5 text-secondary gap-2`}>
          <span className="text-5xl font-bold">{member.name.charAt(0)}</span>
          <ImageOff className="h-5 w-5 opacity-30" />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-0.5">{member.name}</h3>
        <p className="text-primary font-medium text-sm mb-1">{member.subject}</p>
        {member.classLevel && (
          <span className="inline-block text-xs font-medium bg-secondary/10 text-secondary px-2 py-0.5 rounded-full mb-2">
            {member.classLevel}
          </span>
        )}
        <div className="flex items-start gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{member.qualification}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Faculty() {
  const { data: facultyMembers, isLoading } = useListFaculty();
  const deleteM = useDeleteFacultyMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isLoggedIn } = useAdminAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [activeClass, setActiveClass] = useState<string>("all");

  const openAdd = () => { setEditingMember(null); setDialogOpen(true); };
  const openEdit = (member: FacultyMember) => { setEditingMember(member); setDialogOpen(true); };

  const handleDelete = (member: FacultyMember) => {
    if (!window.confirm(`Delete "${member.name}"?`)) return;
    deleteM.mutate(
      { id: member.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
          toast({ title: `${member.name} removed` });
        },
        onError: () => toast({ variant: "destructive", title: "Delete failed" }),
      }
    );
  };

  // Derive unique subjects and class levels from data
  const { uniqueSubjects, uniqueClasses } = useMemo(() => {
    const members = Array.isArray(facultyMembers) ? facultyMembers : [];
    const subjects = [...new Set(members.map((m) => m.subject).filter(Boolean))].sort();
    // Keep class levels in school order
    const classOrder = CLASS_LEVELS as readonly string[];
    const classes = classOrder.filter((cls) =>
      members.some((m) => m.classLevel === cls)
    );
    return { uniqueSubjects: subjects, uniqueClasses: classes };
  }, [facultyMembers]);

  const filtered = useMemo(() => {
    const members = Array.isArray(facultyMembers) ? facultyMembers : [];
    if (filterMode === "subject" && activeSubject !== "all") {
      return members.filter((m) => m.subject === activeSubject);
    }
    if (filterMode === "class" && activeClass !== "all") {
      return members.filter((m) => m.classLevel === activeClass);
    }
    return members;
  }, [facultyMembers, filterMode, activeSubject, activeClass]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Our Faculty
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Meet the dedicated educators who inspire, guide, and mentor our students every day.
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">

          {/* Admin toolbar */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center justify-between bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Admin Mode</p>
                  <p className="text-xs text-muted-foreground">Click ✏️ to edit, 🗑️ to delete any teacher</p>
                </div>
              </div>
              <Button onClick={openAdd} className="bg-[#F15A29] hover:bg-[#d94e22] text-white gap-2">
                <Plus className="h-4 w-4" />
                Add Teacher
              </Button>
            </motion.div>
          )}

          {/* Filter Mode Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {[
                { key: "all", label: "All Teachers", icon: <LayoutGrid className="h-4 w-4" /> },
                { key: "subject", label: "By Subject", icon: <BookOpen className="h-4 w-4" /> },
                { key: "class", label: "By Class", icon: <GraduationCap className="h-4 w-4" /> },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterMode(key as FilterMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterMode === key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Subject filter chips */}
            <AnimatePresence>
              {filterMode === "subject" && uniqueSubjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveSubject("all")}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      activeSubject === "all"
                        ? "bg-secondary text-white"
                        : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                    }`}
                  >
                    All Subjects
                  </button>
                  {uniqueSubjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setActiveSubject(subj)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        activeSubject === subj
                          ? "bg-secondary text-white"
                          : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Class filter chips */}
            <AnimatePresence>
              {filterMode === "class" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveClass("all")}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      activeClass === "all"
                        ? "bg-[#F15A29] text-white"
                        : "bg-[#F15A29]/10 text-[#F15A29] hover:bg-[#F15A29]/20"
                    }`}
                  >
                    All Classes
                  </button>
                  {CLASS_LEVELS.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setActiveClass(cls)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        activeClass === cls
                          ? "bg-[#F15A29] text-white"
                          : "bg-[#F15A29]/10 text-[#F15A29] hover:bg-[#F15A29]/20"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((member, idx) => (
                <TeacherCard
                  key={member.id}
                  member={member}
                  idx={idx}
                  isLoggedIn={!!isLoggedIn}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-border border-dashed">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                {filterMode !== "all"
                  ? "No teachers found for this filter"
                  : "No Faculty Profiles"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filterMode !== "all"
                  ? "Try selecting a different subject or class."
                  : "Faculty profiles have not been added yet."}
              </p>
              {isLoggedIn && filterMode === "all" && (
                <Button onClick={openAdd} className="bg-[#F15A29] hover:bg-[#d94e22] text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Teacher
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <TeacherDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editingMember}
      />
    </div>
  );
}
