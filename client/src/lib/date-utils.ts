import { differenceInDays, format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export function formatEventDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMMM d, yyyy');
}

export function getDaysUntilEvent(dateString: string): number {
  const eventDate = parseISO(dateString);
  const today = new Date();
  return differenceInDays(eventDate, today);
}

export function getRelativeTimeText(dateString: string): string {
  const daysUntil = getDaysUntilEvent(dateString);
  const eventDate = parseISO(dateString);
  
  if (isToday(eventDate)) {
    return 'Today';
  } else if (isTomorrow(eventDate)) {
    return 'Tomorrow';
  } else if (isYesterday(eventDate)) {
    return 'Yesterday';
  } else if (daysUntil > 0) {
    return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  } else {
    return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago`;
  }
}

export function formatDateForInput(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy-MM-dd');
}

export function isUpcoming(dateString: string): boolean {
  return getDaysUntilEvent(dateString) >= 0;
}
