import { format, isValid } from 'date-fns';

/**
 * Formats a date with error handling
 * @param {Date|number|string} date - The date to format
 * @param {string} formatStr - The format string
 * @param {string} fallback - Value to return if date is invalid
 * @returns {string} The formatted date or fallback value
 */
export const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm:ss', fallback = 'Invalid date') => {
  try {
    const dateObj = new Date(date);
    return isValid(dateObj) ? format(dateObj, formatStr) : fallback;
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};
