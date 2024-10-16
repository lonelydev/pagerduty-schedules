import { convertTimezone, toLocaTzIsoStringWithOffset } from '../src/DateUtilities';
import {describe, expect, test} from '@jest/globals';

describe('DateUtilities.toLocaTzIsoStringWithOffset', () => {
    test('should convert UTC date to local ISO string with timezone offset', () => {
        const date = new Date('2023-10-01T12:00:00Z');
        const result = toLocaTzIsoStringWithOffset(date);
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTzDate = convertTimezone(date, localTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(localTzDate);
        expect(result).toBe(expectedLocalISOTime);
    });

    test('should handle dates with positive timezone offsets', () => {
        const date = new Date('2023-10-01T12:00:00+02:00');
        const result = toLocaTzIsoStringWithOffset(date);
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTzDate = convertTimezone(date, localTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(localTzDate);
        expect(result).toBe(expectedLocalISOTime);
    });

    test('should handle dates with negative timezone offsets', () => {
        const date = new Date('2023-10-01T12:00:00-05:00');
        const result = toLocaTzIsoStringWithOffset(date);
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTzDate = convertTimezone(date, localTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(localTzDate);
        expect(result).toBe(expectedLocalISOTime);
    });
});