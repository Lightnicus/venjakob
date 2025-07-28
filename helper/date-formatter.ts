/**
 * Formats a date string or Date object to German date format (DD.MM.YYYY)
 * @param date - Date string or Date object
 * @returns Formatted German date string
 */
export const formatGermanDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('de-DE');
};

/**
 * Formats a date string or Date object to German date format with time (DD.MM.YYYY HH:MM)
 * @param date - Date string or Date object
 * @returns Formatted German date and time string
 */
export const formatGermanDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 