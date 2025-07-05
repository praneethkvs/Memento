import { differenceInDays, format, isToday, isTomorrow, isYesterday, parseISO, getYear, getMonth, getDate, addYears, isBefore, isAfter } from 'date-fns';

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

// Calculate the next occurrence of a recurring event
export function getNextOccurrence(monthDay: string, originalYear?: number): Date {
  const today = new Date();
  const currentYear = getYear(today);
  const [month, day] = monthDay.split('-').map(Number);
  
  // Create date for this year
  const thisYear = new Date(currentYear, month - 1, day);
  
  // If this year's date hasn't passed, use it
  if (isAfter(thisYear, today) || isToday(thisYear)) {
    return thisYear;
  }
  
  // Otherwise, use next year's date
  return new Date(currentYear + 1, month - 1, day);
}

// Calculate age or anniversary years for the next occurrence
export function calculateAge(originalDate: string, hasYear: boolean): number | null {
  if (!hasYear) return null;
  
  const original = parseISO(originalDate);
  const originalYear = getYear(original);
  const nextOccurrence = getNextOccurrence(format(original, 'MM-dd'), originalYear);
  
  return getYear(nextOccurrence) - originalYear;
}

// Get days until next occurrence
export function getDaysUntilNextOccurrence(monthDay: string): number {
  const nextOccurrence = getNextOccurrence(monthDay);
  const today = new Date();
  return differenceInDays(nextOccurrence, today);
}

// Format next occurrence date for display
export function formatNextOccurrence(monthDay: string): string {
  const nextOccurrence = getNextOccurrence(monthDay);
  return format(nextOccurrence, 'MMMM d, yyyy');
}

// Check if an event should show reminders based on days until next occurrence
export function shouldShowReminder(monthDay: string, reminderDays: string[]): boolean {
  const daysUntil = getDaysUntilNextOccurrence(monthDay);
  return reminderDays.some(days => parseInt(days) === daysUntil) || daysUntil === 0;
}

// Create month-day string from date
export function createMonthDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MM-dd');
}

// Parse date input and determine if year is provided
export function parseDateInput(dateInput: string): { fullDate: string; monthDay: string; hasYear: boolean } {
  // Handle various input formats
  const parts = dateInput.split('-');
  
  if (parts.length === 3) {
    // Full date YYYY-MM-DD
    return {
      fullDate: dateInput,
      monthDay: `${parts[1]}-${parts[2]}`,
      hasYear: true
    };
  } else if (parts.length === 2) {
    // MM-DD format - assume current year
    const currentYear = getYear(new Date());
    return {
      fullDate: `${currentYear}-${parts[0]}-${parts[1]}`,
      monthDay: `${parts[0]}-${parts[1]}`,
      hasYear: false
    };
  }
  
  // Default fallback
  return {
    fullDate: dateInput,
    monthDay: createMonthDay(dateInput),
    hasYear: true
  };
}
