import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Bell, User, Type, Heart, StickyNote, Edit, Copy, MessageCircle } from "lucide-react";
import { Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  formatNextOccurrence, 
  getDaysUntilNextOccurrence, 
  calculateAge,
  formatEventDate
} from "@/lib/date-utils";

interface EventDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit?: (event: Event) => void;
}

interface GeneratedMessage {
  id: number;
  eventId: number;
  userId: string;
  message: string;
  tone: string;
  length: string;
  createdAt: string;
  updatedAt: string;
}

export function EventDetailsModal({ open, onOpenChange, event, onEdit }: EventDetailsModalProps) {
  const { toast } = useToast();
  
  // Fetch existing message for the event
  const { data: existingMessage, isLoading: isLoadingMessage } = useQuery<GeneratedMessage>({
    queryKey: [`/api/events/${event?.id}/message`],
    queryFn: async () => {
      if (!event) return null;
      
      const response = await fetch(`/api/events/${event.id}/message`, {
        credentials: "include",
      });
      
      if (response.status === 404) {
        return null; // No message exists yet
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch message: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!event && open,
    retry: false,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The message has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy the message to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (!event) return null;

  const getEventIcon = (type: string) => {
    if (type === 'birthday') return '🎂';
    if (type === 'anniversary') return '💝';
    return '📅';
  };

  const getEventTypeColor = (type: string) => {
    if (type === 'birthday') return 'bg-coral';
    if (type === 'anniversary') return 'bg-teal';
    return 'bg-purple';
  };

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'family': return 'bg-purple-100 text-purple-800';
      case 'friend': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      case 'partner': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const daysUntil = getDaysUntilNextOccurrence(event.monthDay);
  const age = calculateAge(event.eventDate, event.hasYear);
  const nextOccurrenceDate = formatNextOccurrence(event.monthDay);

  const getEventDisplayText = () => {
    if (daysUntil === 0) {
      if (event.eventType === 'birthday') {
        return age ? `🎉 Turning ${age} today!` : `🎉 Birthday today!`;
      } else if (event.eventType === 'anniversary') {
        return age ? `🎉 ${age}${getOrdinalSuffix(age)} anniversary today!` : `🎉 Anniversary today!`;
      } else {
        return `🎉 Event today!`;
      }
    } else {
      const dayText = daysUntil === 1 ? 'day' : 'days';
      if (event.eventType === 'birthday') {
        return age ? `Turning ${age} in ${daysUntil} ${dayText}` : `Birthday in ${daysUntil} ${dayText}`;
      } else if (event.eventType === 'anniversary') {
        return age ? `${age}${getOrdinalSuffix(age)} anniversary in ${daysUntil} ${dayText}` : `Anniversary in ${daysUntil} ${dayText}`;
      } else {
        return `Event in ${daysUntil} ${dayText}`;
      }
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getEventTypeColor(event.eventType)} bg-opacity-10 rounded-full flex items-center justify-center`}>
              <span className="text-2xl">{getEventIcon(event.eventType)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{event.personName}</h2>
              <p className="text-sm text-gray-600 font-normal">{getEventDisplayText()}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Type and Relation */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={`${getEventTypeColor(event.eventType)} text-white`}>
              {event.eventType}
            </Badge>
            <Badge variant="outline" className={getRelationColor(event.relation)}>
              {event.relation}
            </Badge>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Next Occurrence</p>
                <p className="text-sm text-gray-600">{nextOccurrenceDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Days Until</p>
                <p className="text-sm text-gray-600">
                  {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`}
                </p>
              </div>
            </div>

            {event.hasYear && (
              <div className="flex items-center space-x-3">
                <Type className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Original Date</p>
                  <p className="text-sm text-gray-600">{formatEventDate(event.eventDate)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Reminders</p>
                <p className="text-sm text-gray-600">
                  {event.reminders && event.reminders.length > 0 
                    ? `${event.reminders.join(', ')} days before`
                    : 'No reminders set'
                  }
                </p>
              </div>
            </div>

            {event.notes && (
              <>
                <div className="flex items-start space-x-3">
                  <StickyNote className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-gray-600">{event.notes}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Generated Message Section */}
          {existingMessage && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <h3 className="text-sm font-medium">Generated Message</h3>
                  <Badge variant="outline" className="text-xs">
                    {existingMessage.tone} • {existingMessage.length}
                  </Badge>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">{existingMessage.message}</p>
                  <Button
                    onClick={() => copyToClipboard(existingMessage.message)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          {onEdit && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  onEdit(event);
                  onOpenChange(false);
                }}
                className="text-white hover:bg-teal/90 bg-[#5abff2e6]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}