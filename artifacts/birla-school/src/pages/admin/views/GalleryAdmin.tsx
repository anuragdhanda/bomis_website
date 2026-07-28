import { useState } from "react";
import {
  useListGallery, useCreateGalleryItem, useDeleteGalleryItem,
  GalleryItemInputCategory,
  getListGalleryQueryKey,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  category: z.nativeEnum(GalleryItemInputCategory),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORY_LABELS: Record<GalleryItemInputCategory, string> = {
  [GalleryItemInputCategory.sports]: "Sports",
  [GalleryItemInputCategory.events]: "Events",
  [GalleryItemInputCategory.cultural]: "Cultural",
  [GalleryItemInputCategory.academics]: "Academics",
  [GalleryItemInputCategory.infrastructure]: "Infrastructure",
};

export default function GalleryAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading } = useListGallery();
  const createMutation = useCreateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", imageUrl: "", category: GalleryItemInputCategory.events },
  });

  const openAdd = () => {
    form.reset({ title: "", imageUrl: "", category: GalleryItemInputCategory.events });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          toast({ title: "Image added successfully" });
          setIsDialogOpen(false);
          form.reset();
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.message ?? "Could not add image" });
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          toast({ title: "Image deleted successfully" });
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.message ?? "Could not delete" });
          setDeleteTarget(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gallery</h2>
          <p className="text-muted-foreground text-sm mt-1">Add and delete school gallery images.</p>
        </div>
        <Button size="lg" onClick={openAdd} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" /> Add Image
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400?text=Image"; }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
              <div className="p-3 border-t border-border">
                <p className="font-medium text-sm truncate" title={item.title}>{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {CATEGORY_LABELS[item.category as GalleryItemInputCategory] ?? item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-card rounded-xl border border-dashed border-border">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No images in the gallery yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add Image" to upload your first photo.</p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Gallery Image</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title / Caption</FormLabel>
                  <FormControl><Input placeholder="e.g. Annual Sports Day 2024" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com/photo.jpg" {...field} /></FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="px-8">
                  {createMutation.isPending ? "Adding…" : "Add Image"}
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
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the image from the gallery. This action cannot be undone.</AlertDialogDescription>
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
