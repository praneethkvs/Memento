import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from "date-fns";
import { Event } from "@shared/schema";
import { getNextOccurrence } from "@/lib/date-utils";

interface MiniCalendarProps {
  events: Event[];
  currentDate?: Date;
}

export function MiniCalendar({ events, currentDate = new Date() }: MiniCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasEvent = (date: Date) => {
    return events.some(event => {
      const nextOccurrence = getNextOccurrence(event.monthDay);
      return isSameDay(nextOccurrence, date);
    });
  };

  const getEventType = (date: Date) => {
    const event = events.find(event => {
      const nextOccurrence = getNextOccurrence(event.monthDay);
      return isSameDay(nextOccurrence, date);
    });
    return event?.eventType;
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((day, index) => (
              <div key={`header-${index}`} className="text-xs text-gray-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((date, index) => {
              const hasEventOnDay = hasEvent(date);
              const eventType = getEventType(date);
              const isCurrentDay = isToday(date);
              
              return (
                <div
                  key={`day-${format(date, 'yyyy-MM-dd')}`}
                  className={`
                    text-sm py-2 rounded-full w-8 h-8 flex items-center justify-center
                    ${isCurrentDay 
                      ? 'bg-coral text-white' 
                      : hasEventOnDay 
                        ? eventType === 'birthday' 
                          ? 'bg-coral bg-opacity-10 text-coral' 
                          : 'bg-teal bg-opacity-10 text-teal'
                        : 'text-dark-grey'
                    }
                  `}
                >
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
