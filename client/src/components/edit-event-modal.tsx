import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertEventSchema, type InsertEvent, type Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateForInput, parseDateInput } from "@/lib/date-utils";
import { Calendar, Heart } from "lucide-react";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function EditEventModal({ open, onOpenChange, event }: EditEventModalProps) {
  const [reminders, setReminders] = useState<Array<{enabled: boolean, days: string}>>([
    { enabled: false, days: '30' },
    { enabled: false, days: '15' },
    { enabled: false, days: '7' },
    { enabled: false, days: '3' },
    { enabled: false, days: '1' }
  ]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      personName: '',
      eventType: 'birthday',
      eventDate: '',
      monthDay: '',
      hasYear: true,
      relation: 'friend',
      notes: '',
      reminders: []
    }
  });

  useEffect(() => {
    if (event) {
      form.reset({
        personName: event.personName,
        eventType: event.eventType as 'birthday' | 'anniversary',
        eventDate: formatDateForInput(event.eventDate),
        monthDay: event.monthDay,
        hasYear: event.hasYear,
        relation: event.relation as 'family' | 'friend' | 'colleague' | 'partner' | 'other',
        notes: event.notes || '',
        reminders: event.reminders || []
      });

      // Update reminders state
      const eventReminders = event.reminders || [];
      setReminders([
        { enabled: eventReminders.includes('30'), days: '30' },
        { enabled: eventReminders.includes('15'), days: '15' },
        { enabled: eventReminders.includes('7'), days: '7' },
        { enabled: eventReminders.includes('3'), days: '3' },
        { enabled: eventReminders.includes('1'), days: '1' }
      ]);
    }
  }, [event, form]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      if (!event) throw new Error('No event to update');
      const response = await apiRequest('PUT', `/api/events/${event.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/stats'] });
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertEvent) => {
    const enabledReminders = reminders
      .filter(reminder => reminder.enabled)
      .map(reminder => reminder.days);
    
    // Parse the date input to extract monthDay and hasYear
    const dateInfo = parseDateInput(data.eventDate);
    
    updateEventMutation.mutate({
      ...data,
      eventDate: dateInfo.fullDate,
      monthDay: dateInfo.monthDay,
      hasYear: dateInfo.hasYear,
      reminders: enabledReminders
    });
  };

  const updateReminder = (index: number, field: 'enabled' | 'days', value: boolean | string) => {
    setReminders(prev => prev.map((reminder, i) => 
      i === index ? { ...reminder, [field]: value } : reminder
    ));
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person/People</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name(s)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="birthday" id="edit-birthday" />
                        <Label htmlFor="edit-birthday" className="flex items-center space-x-2 cursor-pointer">
                          <Calendar className="w-4 h-4 text-coral" />
                          <span>Birthday</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anniversary" id="edit-anniversary" />
                        <Label htmlFor="edit-anniversary" className="flex items-center space-x-2 cursor-pointer">
                          <Heart className="w-4 h-4 text-teal" />
                          <span>Anniversary</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special notes, gift ideas, or preferences..."
                      className="resize-none"
                      rows={3}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Reminders</Label>
              {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => updateReminder(index, 'enabled', checked as boolean)}
                  />
                  <Select
                    value={reminder.days}
                    onValueChange={(value) => updateReminder(index, 'days', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="15">2 weeks before</SelectItem>
                      <SelectItem value="30">1 month before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-success hover:bg-success/90"
                disabled={updateEventMutation.isPending}
              >
                {updateEventMutation.isPending ? 'Updating...' : 'Update Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
