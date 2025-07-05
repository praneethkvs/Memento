import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Clock, Bell } from "lucide-react";
import { Event } from "@shared/schema";
import { 
  formatNextOccurrence, 
  getDaysUntilNextOccurrence, 
  calculateAge,
  shouldShowReminder 
} from "@/lib/date-utils";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onClick?: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete, onClick }: EventCardProps) {
  const getEventIcon = (type: string) => {
    return type === 'birthday' ? '🎂' : '💝';
  };

  const getEventTypeColor = (type: string) => {
    return type === 'birthday' ? 'bg-coral' : 'bg-teal';
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

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? () => onClick(event) : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
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
              <p className="text-sm text-gray-600 mb-1">{nextOccurrenceDate}</p>
              <p className="text-sm font-medium text-dark-grey mb-2">{getEventDisplayText()}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-soft-yellow" />
                  <span className="text-sm text-gray-600">
                    {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`}
                  </span>
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
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="text-gray-400 hover:text-teal"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
