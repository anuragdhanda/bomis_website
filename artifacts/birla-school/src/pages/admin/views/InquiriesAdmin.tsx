import { useListInquiries, useUpdateInquiry, useDeleteInquiry } from "@workspace/api-client-react";
import { InquiryUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListInquiriesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Mail, Phone, GraduationCap, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function InquiriesAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: items, isLoading } = useListInquiries();
  const updateMutation = useUpdateInquiry();
  const deleteMutation = useDeleteInquiry();

  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const handleStatusChange = (id: number, newStatus: string) => {
    updateMutation.mutate(
      { id, data: { status: newStatus as InquiryUpdateStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          toast({ title: "Status updated" });
          if (selectedInquiry && selectedInquiry.id === id) {
            setSelectedInquiry({ ...selectedInquiry, status: newStatus });
          }
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
            toast({ title: "Inquiry deleted" });
            setSelectedInquiry(null);
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">New</span>;
      case 'read': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Read</span>;
      case 'replied': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Replied</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Inquiries</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${item.type === 'admission' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Select 
                          defaultValue={item.status} 
                          onValueChange={(val) => handleStatusChange(item.id, val)}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(item)}>
                          View
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!items || items.length === 0) && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No inquiries found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        {selectedInquiry && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="mb-4">
              <div className="flex justify-between items-start pr-8">
                <div>
                  <DialogTitle className="text-xl">{selectedInquiry.type === 'admission' ? 'Admission Inquiry' : 'Contact Message'}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Received on {format(new Date(selectedInquiry.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {getStatusBadge(selectedInquiry.status)}
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">From</p>
                <p className="font-medium">{selectedInquiry.name}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                  <Mail className="h-4 w-4" /> <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-primary">
                    <Phone className="h-4 w-4" /> <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a>
                  </div>
                )}
              </div>

              {selectedInquiry.type === 'admission' && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Student Details</p>
                  <div className="flex items-center gap-2 font-medium">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" /> {selectedInquiry.studentName || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" /> Applying for: <span className="font-bold text-foreground">{selectedInquiry.gradeApplying}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Message</p>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Select 
                defaultValue={selectedInquiry.status} 
                onValueChange={(val) => handleStatusChange(selectedInquiry.id, val)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mark as New</SelectItem>
                  <SelectItem value="read">Mark as Read</SelectItem>
                  <SelectItem value="replied">Mark as Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
