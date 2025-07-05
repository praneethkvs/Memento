import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Clock, Bell } from "lucide-react";
import { Event } from "@shared/schema";
import { formatEventDate, getRelativeTimeText } from "@/lib/date-utils";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              <p className="text-sm text-gray-600 mb-1">{formatEventDate(event.eventDate)}</p>
              {event.notes && (
                <p className="text-sm text-gray-500 mb-3">{event.notes}</p>
              )}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-soft-yellow" />
                  <span className="text-sm text-gray-600">{getRelativeTimeText(event.eventDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bell className="w-4 h-4 text-teal" />
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
              onClick={() => onEdit(event)}
              className="text-gray-400 hover:text-teal"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
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
