import { useState } from "react";
import {
  useListNewsEvents, useCreateNewsEvent, useUpdateNewsEvent, useDeleteNewsEvent,
  NewsEvent, NewsEventInputType,
  getListNewsEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Pencil, Trash2, Plus, Calendar, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  type: z.enum([NewsEventInputType.news, NewsEventInputType.event]),
  imageUrl: z.string().optional(),
  eventDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewsAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading } = useListNewsEvents();
  const createMutation = useCreateNewsEvent();
  const updateMutation = useUpdateNewsEvent();
  const deleteMutation = useDeleteNewsEvent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "", excerpt: "", type: NewsEventInputType.news, imageUrl: "", eventDate: "" },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: "", content: "", excerpt: "", type: NewsEventInputType.news, imageUrl: "", eventDate: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (item: NewsEvent) => {
    setEditingId(item.id);
    form.reset({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || "",
      type: item.type as NewsEventInputType,
      imageUrl: item.imageUrl || "",
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, eventDate: values.eventDate ? new Date(values.eventDate).toISOString() : undefined };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListNewsEventsQueryKey() });
      toast({ title: editingId ? "Updated successfully" : "Created successfully" });
      setIsDialogOpen(false);
    };
    const onError = (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err?.message ?? "Something went wrong" });
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload as any }, { onSuccess, onError });
    } else {
      createMutation.mutate({ data: payload }, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNewsEventsQueryKey() });
          toast({ title: "Deleted successfully" });
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
          <h2 className="text-2xl font-bold text-foreground">News & Events</h2>
          <p className="text-muted-foreground text-sm mt-1">Add, edit and delete news articles and events.</p>
        </div>
        <Button size="lg" onClick={openCreate} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" /> Add New
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Title</th>
                  <th className="px-5 py-4 font-semibold hidden md:table-cell">Date</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      {item.type === "event"
                        ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Event</Badge>
                        : <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">News</Badge>
                      }
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground max-w-xs">
                      <div className="line-clamp-1">{item.title}</div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {item.eventDate
                        ? <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(item.eventDate), "MMM dd, yyyy")}</span>
                        : format(new Date(item.publishedAt), "MMM dd, yyyy")
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4 mr-1.5" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="h-9 px-3" onClick={() => setDeleteTarget(item.id)}>
                          <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!items || items.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center text-muted-foreground">
                      <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      No news or events yet. Click "Add New" to get started.
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
        <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? "Edit Item" : "Add News / Event"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={NewsEventInputType.news}>News</SelectItem>
                      <SelectItem value={NewsEventInputType.event}>Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Enter title…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="excerpt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt <span className="text-muted-foreground font-normal">(short summary)</span></FormLabel>
                  <FormControl><Textarea placeholder="Brief description…" rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Content</FormLabel>
                  <FormControl><Textarea className="min-h-[130px]" placeholder="Full article or event details…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {form.watch("type") === NewsEventInputType.event && (
                <FormField control={form.control} name="eventDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="px-8">
                  {isSaving ? "Saving…" : editingId ? "Update" : "Publish"}
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
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the news/event. This action cannot be undone.</AlertDialogDescription>
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
