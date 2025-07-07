/**
 * Utility functions for time and date formatting
 */

/**
 * Format time to 12-hour format with AM/PM
 * @param timeString - Time string in HH:mm format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTo12Hour(timeString: string): string {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${minutes} ${period}`;
}

/**
 * Format a time range to 12-hour format
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Formatted time range (e.g., "9:00 AM - 10:30 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
}

/**
 * Get day name from date
 * @param date - Date object or date string
 * @returns Day name (e.g., "Monday")
 */
export function getDayName(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Format date for display
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDisplayDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Check if a date is today
 * @param date - Date object or date string
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the future
 * @param date - Date object or date string
 * @returns True if the date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  return dateObj > now;
}
