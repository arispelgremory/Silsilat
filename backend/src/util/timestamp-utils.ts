/**
 * Utility functions for working with Hedera timestamps
 */

/**
 * Converts a Hedera timestamp string to a JavaScript Date object
 * @param hederaTimestamp - Hedera timestamp string (e.g., "1758168065.209884418")
 * @returns JavaScript Date object
 */
export function hederaTimestampToDate(hederaTimestamp: string): Date {
  const timestamp = parseFloat(hederaTimestamp);
  return new Date(timestamp * 1000); // Convert to milliseconds
}

/**
 * Converts a JavaScript Date object to a Hedera timestamp string
 * @param date - JavaScript Date object
 * @returns Hedera timestamp string
 */
export function dateToHederaTimestamp(date: Date): string {
  return (date.getTime() / 1000).toString();
}

/**
 * Adds a specified number of months to a Hedera timestamp
 * @param hederaTimestamp - Hedera timestamp string
 * @param months - Number of months to add (default: 6)
 * @returns Hedera timestamp string with months added
 */
export function addMonthsToHederaTimestamp(hederaTimestamp: string, months: number = 6): string {
  const date = hederaTimestampToDate(hederaTimestamp);
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return dateToHederaTimestamp(newDate);
}

/**
 * Gets the current Hedera timestamp
 * @returns Current Hedera timestamp string
 */
export function getCurrentHederaTimestamp(): string {
  return dateToHederaTimestamp(new Date());
}
