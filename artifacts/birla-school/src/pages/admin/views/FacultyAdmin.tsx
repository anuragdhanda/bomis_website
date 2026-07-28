import { useState } from "react";
import {
  useListFaculty, useCreateFacultyMember, useUpdateFacultyMember, useDeleteFacultyMember,
  FacultyMember,
  getListFacultyQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Users, UserCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject / designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  photoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FacultyAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading } = useListFaculty();
  const createMutation = useCreateFacultyMember();
  const updateMutation = useUpdateFacultyMember();
  const deleteMutation = useDeleteFacultyMember();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", subject: "", qualification: "", photoUrl: "" },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", subject: "", qualification: "", photoUrl: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (item: FacultyMember) => {
    setEditingId(item.id);
    form.reset({
      name: item.name,
      subject: item.subject,
      qualification: item.qualification,
      photoUrl: item.photoUrl || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
      toast({ title: editingId ? "Updated successfully" : "Faculty member added" });
      setIsDialogOpen(false);
    };
    const onError = (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err?.message ?? "Something went wrong" });
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values }, { onSuccess, onError });
    } else {
      createMutation.mutate({ data: values }, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
          toast({ title: "Faculty member deleted" });
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.message ?? "Could not delete" });
          setDeleteTarget(null);
        },
      }
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Faculty</h2>
          <p className="text-muted-foreground text-sm mt-1">Add, edit and remove faculty members.</p>
        </div>
        <Button size="lg" onClick={openCreate} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" /> Add Member
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold">Photo</th>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold hidden sm:table-cell">Subject / Designation</th>
                  <th className="px-5 py-4 font-semibold hidden lg:table-cell">Qualifications</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-11 h-11 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {item.photoUrl
                          ? <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          : <UserCircle2 className="h-7 w-7 text-muted-foreground/40" />
                        }
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{item.name}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{item.subject}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{item.qualification}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4 mr-1.5" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="h-9 px-3" onClick={() => setDeleteTarget({ id: item.id, name: item.name })}>
                          <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!items || items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      No faculty members yet. Click "Add Member" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? "Edit Faculty Member" : "Add Faculty Member"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Dr. Ramesh Sharma" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject / Designation</FormLabel>
                  <FormControl><Input placeholder="e.g. Mathematics Teacher" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="qualification" render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualifications</FormLabel>
                  <FormControl><Input placeholder="e.g. M.Sc., B.Ed., Ph.D." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="https://example.com/photo.jpg" {...field} /></FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border border-border bg-muted">
                      <img src={field.value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="px-8">
                  {isSaving ? "Saving…" : editingId ? "Update" : "Add Member"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this faculty member from the portal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
