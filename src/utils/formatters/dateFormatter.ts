import {
  format,
  formatDistance,
  formatRelative,
  isValid,
  parseISO,
} from 'date-fns';

export const formatDate = (
  date: string | Date | number,
  pattern = 'PPP'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(dateObj) ? format(dateObj, pattern) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date | number): string => {
  return formatDate(date, 'PPpp');
};

export const formatTime = (date: string | Date | number): string => {
  return formatDate(date, 'p');
};

export const formatRelativeTime = (date: string | Date | number): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(dateObj)
      ? formatDistance(dateObj, new Date(), { addSuffix: true })
      : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeDate = (date: string | Date | number): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(dateObj)
      ? formatRelative(dateObj, new Date())
      : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

export const formatISO = (date: Date): string => {
  return date.toISOString();
};

export const isToday = (date: string | Date | number): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: string | Date | number): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
};
