import { convertTimezone, toLocaTzIsoStringWithOffset } from '../src/DateUtilities';
import {describe, expect, test} from '@jest/globals';

describe('DateUtilities.toLocaTzIsoStringWithOffset', () => {
    const environmentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    test('should convert UTC date to local ISO string with timezone offset', () => {
        const dateFromISOStringZ = new Date('2023-10-01T12:00:00Z');
        const localizedTzIsoStringWithOffset = toLocaTzIsoStringWithOffset(dateFromISOStringZ);
        const testDateConvertedToEnvTz = convertTimezone(dateFromISOStringZ, environmentTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(testDateConvertedToEnvTz);
        expect(localizedTzIsoStringWithOffset).toBe(expectedLocalISOTime);
    });

    test('should handle dates with positive timezone offsets', () => {
        const date = new Date('2023-10-01T12:00:00+02:00');
        const result = toLocaTzIsoStringWithOffset(date);
        const localTzDate = convertTimezone(date, environmentTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(localTzDate);
        expect(result).toBe(expectedLocalISOTime);
    });

    test('should handle dates with negative timezone offsets', () => {
        const date = new Date('2023-10-01T12:00:00-05:00');
        const result = toLocaTzIsoStringWithOffset(date);
        const localTzDate = convertTimezone(date, environmentTimezone, "en-US");
        const expectedLocalISOTime = toLocaTzIsoStringWithOffset(localTzDate);
        expect(result).toBe(expectedLocalISOTime);
    });
});