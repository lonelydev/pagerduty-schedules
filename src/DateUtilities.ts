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