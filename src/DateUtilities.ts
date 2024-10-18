/**
 * Converts a given date to a local ISO string with timezone offset.
 *
 * This function takes a `Date` object and returns a string in the ISO 8601 format
 * with the local timezone offset included. The resulting string will be in the format
 * `YYYY-MM-DDTHH:mm:ss±HH:00`.
 *
 * @param date - The `Date` object to be converted.
 * @returns A string representing the local ISO time with timezone offset.
 */
export function toLocaTzIsoStringWithOffset(date: Date): string {
    var timezoneOffsetInMilliseconds = date.getTimezoneOffset() * 60000;
    var localISOTime = (new Date(date.getTime() - timezoneOffsetInMilliseconds)).toISOString().slice(0, -5);
    let timezoneOffsetInHours = -(timezoneOffsetInMilliseconds / 3600000);
    let localISOTimeWithOffset = localISOTime +
        (timezoneOffsetInHours >= 0 ? '+' : '-') +
        (Math.abs(timezoneOffsetInHours) < 10 ? '0' : '') +
        timezoneOffsetInHours + ':00';
    return localISOTimeWithOffset;
}

/**
 * Converts a given date to a specified timezone.
 *
 * @param date - The date to be converted. Can be a Date object or a string representing a date.
 * @param timeZoneId - The IANA timezone identifier (e.g., "America/New_York", "Europe/London").
 * @returns A new Date object representing the same moment in time in the specified timezone.
 */
export function convertTimezone(date: Date, timeZoneId: string, localeString: string = "en-GB"): Date {
    return new Date(
        (typeof date === "string" ? new Date(date) : date)
        .toLocaleString(localeString, {timeZone: timeZoneId}));   
}

/**
 * Coerces a given date string to a local date with time set to midnight and returns it as an ISO string with timezone offset.
 *
 * @param value - The date string to be coerced.
 * @returns The coerced date as an ISO string with timezone offset.
 */
export function coerceSince(value: string): string {
    let localSinceDate = new Date(value);
    localSinceDate.setHours(0, 0, 0, 0);
    return toLocaTzIsoStringWithOffset(localSinceDate);
}

/**
 * Adjusts the given date string to the end of the day (23:59:59.999) in the local timezone
 * and returns it as an ISO string with timezone offset.
 *
 * @param value - The date string to be adjusted.
 * @returns The adjusted date string in ISO format with timezone offset.
 */
export function coerceUntil(value: string): string {
    let localUntilDate = new Date(value);
    localUntilDate.setHours(23, 59, 59, 999);
    return toLocaTzIsoStringWithOffset(localUntilDate);
}