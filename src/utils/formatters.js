/**
 * Utility functions for formatting values
 */
import { format, formatDistance } from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Format number as currency
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: pt-BR)
 * @param {number} minimumFractionDigits - Minimum fraction digits
 * @param {number} maximumFractionDigits - Maximum fraction digits
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (
  value, 
  currency = 'USD', 
  locale = 'pt-BR',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Format number with specified precision
 * @param {number} value - The number to format
 * @param {number} precision - Decimal places to show
 * @param {boolean} showPlus - Whether to show plus sign for positive numbers
 * @returns {string} Formatted number
 */
export const formatNumber = (value, precision = 2, showPlus = false) => {
  if (value === null || value === undefined) return '-';
  
  const formatted = Number(value).toFixed(precision);
  return value > 0 && showPlus ? `+${formatted}` : formatted;
};

/**
 * Format percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} precision - Decimal places to show
 * @param {boolean} showPlus - Whether to show plus sign for positive numbers
 * @returns {string} Formatted percentage value with % sign
 */
export const formatPercentage = (value, precision = 2, showPlus = true) => {
  if (value === null || value === undefined) return '-';
  
  const formatted = Number(value).toFixed(precision);
  return (value > 0 && showPlus ? '+' : '') + formatted + '%';
};

/**
 * Format date and time
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - Format string (default: dd/MM/yyyy HH:mm:ss)
 * @param {Object} options - Additional options
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (
  date,
  formatStr = 'dd/MM/yyyy HH:mm:ss',
  options = { locale: pt }
) => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
      
    return format(dateObj, formatStr, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - The date to format
 * @param {Date|string|number} baseDate - The base date to compare to (default: now)
 * @param {Object} options - Additional options
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (
  date,
  baseDate = new Date(),
  options = { locale: pt, addSuffix: true }
) => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    const baseDateObj = typeof baseDate === 'string' || typeof baseDate === 'number'
      ? new Date(baseDate)
      : baseDate;
      
    return formatDistance(dateObj, baseDateObj, options);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return String(date);
  }
};

/**
 * Format a crypto amount with appropriate precision
 * @param {number} amount - The amount to format
 * @param {string} symbol - Crypto symbol
 * @returns {string} Formatted crypto amount
 */
export const formatCryptoAmount = (amount, symbol) => {
  if (amount === null || amount === undefined) return '-';
  
  // Use different precision based on the typical value range of the asset
  const precisionMap = {
    'BTC': 8,
    'ETH': 6,
    'BNB': 4,
    'USDT': 2,
    'USDC': 2,
    'BUSD': 2,
  };
  
  // Default precision: use 8 decimal places for small numbers, 2 for large
  const defaultPrecision = amount < 1 ? 8 : 2;
  
  // Get precision for this symbol or use default
  const precision = precisionMap[symbol] !== undefined
    ? precisionMap[symbol]
    : defaultPrecision;
  
  return Number(amount).toFixed(precision);
};
