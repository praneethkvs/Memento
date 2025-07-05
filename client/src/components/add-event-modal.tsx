import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { z } from "zod";

// Create a form-specific schema that handles eventYear as string
const formSchema = insertEventSchema.extend({
  eventYear: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseDateInput } from "@/lib/date-utils";
import { Calendar, Heart } from "lucide-react";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEventModal({ open, onOpenChange }: AddEventModalProps) {
  const [reminders, setReminders] = useState<Array<{enabled: boolean, days: string}>>([
    { enabled: true, days: '30' },
    { enabled: true, days: '15' },
    { enabled: true, days: '7' },
    { enabled: true, days: '3' },
    { enabled: true, days: '1' }
  ]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personName: '',
      eventType: 'birthday',
      eventDate: '',
      monthDay: '',
      eventYear: '',
      hasYear: true,
      relation: 'friend',
      notes: '',
      reminders: []
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest('POST', '/api/events', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/stats'] });
      toast({
        title: "Success",
        description: "Event added successfully!",
      });
      onOpenChange(false);
      form.reset();
      setReminders([
        { enabled: true, days: '30' },
        { enabled: true, days: '15' },
        { enabled: true, days: '7' },
        { enabled: true, days: '3' },
        { enabled: true, days: '1' }
      ]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add event",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data received:', data);
    
    const enabledReminders = reminders
      .filter(reminder => reminder.enabled)
      .map(reminder => reminder.days);
    
    // Create the month-day format
    const monthDay = data.eventDate; // This will be MM-DD format
    const eventYear = data.eventYear && data.eventYear.trim() !== '' ? parseInt(data.eventYear, 10) : undefined;
    const hasYear = eventYear !== undefined && !isNaN(eventYear);
    
    console.log('eventYear:', eventYear, 'hasYear:', hasYear);
    
    // Create full date - use provided year or current year as placeholder
    const year = eventYear || new Date().getFullYear();
    const fullDate = `${year}-${monthDay}`;
    
    const submitData: InsertEvent = {
      personName: data.personName,
      eventType: data.eventType,
      eventDate: fullDate,
      monthDay: monthDay,
      eventYear: eventYear,
      hasYear: hasYear,
      relation: data.relation,
      notes: data.notes,
      reminders: enabledReminders
    };
    
    console.log('Submit data:', submitData);
    createEventMutation.mutate(submitData);
  };

  const updateReminder = (index: number, field: 'enabled' | 'days', value: boolean | string) => {
    setReminders(prev => prev.map((reminder, i) => 
      i === index ? { ...reminder, [field]: value } : reminder
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new birthday or anniversary reminder with customizable notifications.
          </DialogDescription>
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
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="birthday" id="birthday" />
                        <Label htmlFor="birthday" className="flex items-center space-x-2 cursor-pointer">
                          <Calendar className="w-4 h-4 text-coral" />
                          <span>Birthday</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anniversary" id="anniversary" />
                        <Label htmlFor="anniversary" className="flex items-center space-x-2 cursor-pointer">
                          <Heart className="w-4 h-4 text-teal" />
                          <span>Anniversary</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="flex items-center space-x-2 cursor-pointer">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span>Other</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month & Day</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        placeholder="MM-DD"
                        pattern="[0-9]{2}-[0-9]{2}"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: MM-DD (e.g., 01-15)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="YYYY"
                        min="1900"
                        max="2100"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if unknown
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                className="flex-1 bg-coral hover:bg-coral/90"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Adding...' : 'Add Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
