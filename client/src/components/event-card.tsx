import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Trash2, Calendar, Clock, Bell, Sparkles } from "lucide-react";
import { Event } from "@shared/schema";
import { 
  formatNextOccurrence, 
  getDaysUntilNextOccurrence, 
  calculateAge,
  shouldShowReminder 
} from "@/lib/date-utils";
import { MessageGeneratorModal } from "./message-generator-modal";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onClick?: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete, onClick }: EventCardProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const getEventIcon = (type: string) => {
    if (type === 'birthday') return '🎂';
    if (type === 'anniversary') return '💝';
    return '📅';
  };

  const getUrgencyStyles = (daysUntil: number) => {
    if (daysUntil === 0) {
      // Today - bright red border and light red background
      return {
        cardClass: "border-red-500 bg-red-50 dark:bg-red-950/20 border-2",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      };
    } else if (daysUntil <= 7) {
      // This week - orange border and light orange background
      return {
        cardClass: "border-orange-400 bg-orange-50 dark:bg-orange-950/20 border-2",
        badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      };
    } else if (daysUntil <= 30) {
      // This month - blue border and light blue background
      return {
        cardClass: "border-blue-400 bg-blue-50 dark:bg-blue-950/20 border-l-4",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      };
    } else {
      // Normal - default styling
      return {
        cardClass: "border-gray-200 dark:border-gray-700",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      };
    }
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

  // Calculate dynamic event information
  const daysUntil = getDaysUntilNextOccurrence(event.monthDay);
  const age = calculateAge(event.eventDate, event.hasYear);
  const nextOccurrenceDate = formatNextOccurrence(event.monthDay);
  const isRemindersActive = shouldShowReminder(event.monthDay, event.reminders || []);

  // Create display text with age/anniversary years
  const getEventDisplayText = () => {
    if (daysUntil === 0) {
      if (event.eventType === 'birthday') {
        return age ? `🎉 ${event.personName}'s birthday today! (turning ${age})` : `🎉 ${event.personName}'s birthday today!`;
      } else {
        return age ? `🎉 ${event.personName}'s ${age}${getOrdinalSuffix(age)} anniversary today!` : `🎉 ${event.personName}'s anniversary today!`;
      }
    } else {
      const dayText = daysUntil === 1 ? 'day' : 'days';
      if (event.eventType === 'birthday') {
        return age ? `${event.personName}'s birthday in ${daysUntil} ${dayText} (turning ${age})` : `${event.personName}'s birthday in ${daysUntil} ${dayText}`;
      } else {
        return age ? `${event.personName}'s ${age}${getOrdinalSuffix(age)} anniversary in ${daysUntil} ${dayText}` : `${event.personName}'s anniversary in ${daysUntil} ${dayText}`;
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

  // Get urgency-based styles
  const urgencyStyles = getUrgencyStyles(daysUntil);

  return (
    <>
      <Card 
        className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} relative ${urgencyStyles.cardClass}`}
        onClick={onClick ? () => onClick(event) : undefined}
      >
        <CardContent className="p-6 pr-16">
          <div className="flex items-start space-x-4 ml-[-11px] mr-[-11px]">
            <div className={`w-12 h-12 ${getEventTypeColor(event.eventType)} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-xl">{getEventIcon(event.eventType)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-dark-grey">{event.personName}</h3>
                <Badge variant="secondary" className={`${getEventTypeColor(event.eventType)} text-white`}>
                  {event.eventType}
                </Badge>
                <Badge variant="outline" className={getRelationColor(event.relation)}>
                  {event.relation}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{nextOccurrenceDate}</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Badge variant="secondary" className={urgencyStyles.badgeClass}>
                    {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Bell className={`w-4 h-4 ${isRemindersActive ? 'text-coral' : 'text-teal'}`} />
                  <span className="text-sm text-gray-600">
                    {event.reminders?.length || 0} reminder{event.reminders?.length === 1 ? '' : 's'} set
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons positioned absolutely at top-right */}
          <TooltipProvider>
            <div className="absolute top-4 right-4 flex flex-col space-y-1 ml-[-8px] mr-[-8px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMessageModal(true);
                    }}
                    className="text-gray-400 hover:text-purple-500 p-2 h-8 w-8"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Generate Personalized Message</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                    className="text-gray-400 hover:text-teal p-2 h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Edit Event</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-2 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Delete Event</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
      <MessageGeneratorModal
        open={showMessageModal}
        onOpenChange={setShowMessageModal}
        event={event}
      />
    </>
  );
}
