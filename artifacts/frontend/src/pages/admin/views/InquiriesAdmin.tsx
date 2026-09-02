import { useState } from "react";
import {
  useListInquiries, useUpdateInquiry, useDeleteInquiry,
  InquiryUpdateStatus,
  getListInquiriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Mail, Phone, GraduationCap, MessageSquare, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  type: string;
  studentName?: string | null;
  gradeApplying?: string | null;
  createdAt: string;
};

const STATUS_META = {
  new:     { label: "New",     cls: "bg-blue-100 text-blue-700 border-blue-200" },
  read:    { label: "Read",    cls: "bg-amber-100 text-amber-700 border-amber-200" },
  replied: { label: "Replied", cls: "bg-green-100 text-green-700 border-green-200" },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as keyof typeof STATUS_META];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export default function InquiriesAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading } = useListInquiries();
  const updateMutation = useUpdateInquiry();
  const deleteMutation = useDeleteInquiry();

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);

  const handleStatusChange = (item: Inquiry, newStatus: string) => {
    updateMutation.mutate(
      { id: item.id, data: { status: newStatus as InquiryUpdateStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          toast({ title: "Status updated" });
          if (selectedInquiry?.id === item.id) {
            setSelectedInquiry({ ...selectedInquiry, status: newStatus });
          }
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.message ?? "Could not update status" });
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          toast({ title: "Inquiry deleted" });
          if (selectedInquiry?.id === deleteTarget.id) setSelectedInquiry(null);
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.message ?? "Could not delete" });
          setDeleteTarget(null);
        },
      }
    );
  };

  const newCount = items?.filter(i => i.status === "new").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Inquiries</h2>
          {newCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
              {newCount} New
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1">View and manage admission and contact form submissions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold hidden md:table-cell">Date</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map((item) => (
                  <tr key={item.id} className={`hover:bg-muted/40 transition-colors ${item.status === "new" ? "bg-blue-50/40" : ""}`}>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {format(new Date(item.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-5 py-4">
                      {item.type === "admission"
                        ? <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">Admission</Badge>
                        : <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">Contact</Badge>
                      }
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{item.name}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {/* Status changer */}
                        <Select
                          value={item.status}
                          onValueChange={(val) => handleStatusChange(item as Inquiry, val)}
                        >
                          <SelectTrigger className="w-[110px] h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Mark New</SelectItem>
                            <SelectItem value="read">Mark Read</SelectItem>
                            <SelectItem value="replied">Mark Replied</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => setSelectedInquiry(item as Inquiry)}>
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </Button>
                        <Button variant="destructive" size="sm" className="h-9 px-3" onClick={() => setDeleteTarget(item as Inquiry)}>
                          <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!items || items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      No inquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        {selectedInquiry && (
          <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between pr-6">
                <div>
                  <DialogTitle className="text-xl">
                    {selectedInquiry.type === "admission" ? "Admission Inquiry" : "Contact Message"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(selectedInquiry.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <StatusBadge status={selectedInquiry.status} />
              </div>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Contact Details</p>
                  <p className="font-semibold text-foreground text-base">{selectedInquiry.name}</p>
                  <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4 shrink-0" /> {selectedInquiry.email}
                  </a>
                  {selectedInquiry.phone && (
                    <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 mt-1.5 text-sm text-primary hover:underline">
                      <Phone className="h-4 w-4 shrink-0" /> {selectedInquiry.phone}
                    </a>
                  )}
                </div>

                {selectedInquiry.type === "admission" && (
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Student Details</p>
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      {selectedInquiry.studentName || "Not provided"}
                    </div>
                    {selectedInquiry.gradeApplying && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Applying for: <span className="font-bold text-foreground">{selectedInquiry.gradeApplying}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Message</p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => { setSelectedInquiry(null); setDeleteTarget(selectedInquiry); }}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Inquiry
                </Button>
                <div className="flex gap-3">
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(val) => handleStatusChange(selectedInquiry, val)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Mark as New</SelectItem>
                      <SelectItem value="read">Mark as Read</SelectItem>
                      <SelectItem value="replied">Mark as Replied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inquiry from "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this inquiry. This action cannot be undone.
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
