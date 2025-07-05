import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
  eventName: string;
}

export function DeleteConfirmationModal({ 
  open, 
  onOpenChange, 
  eventId, 
  eventName 
}: DeleteConfirmationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/events/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/stats'] });
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (eventId) {
      deleteEventMutation.mutate(eventId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-dark-grey text-center mb-2">
            Delete Event
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete the event for <strong>{eventName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={deleteEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
