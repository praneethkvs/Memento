// Server-side date utilities for handling recurring events

export function getNextOccurrence(monthDay: string): Date {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [month, day] = monthDay.split('-').map(Number);
  
  // Create date for this year
  const thisYear = new Date(currentYear, month - 1, day);
  
  // If this year's date hasn't passed, use it
  if (thisYear > today || isSameDay(thisYear, today)) {
    return thisYear;
  }
  
  // Otherwise, use next year's date
  return new Date(currentYear + 1, month - 1, day);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}