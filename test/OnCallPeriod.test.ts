import {describe, expect, test} from '@jest/globals';
import { OnCallPeriod } from '../src/OnCallPeriod';

describe('should initialise OnCallPeriod with the right number of weekdays and weekends', () => {
    test('- when the shift starts 1st of month and is until the 12th of the month', () => {
        const onCallPeriod = new OnCallPeriod(new Date('2024-08-01T00:00:00+01:00'), new Date('2024-08-12T10:00:00+01:00'));
        expect(onCallPeriod.since).toStrictEqual(new Date('2024-08-01T00:00:00+01:00'));
        expect(onCallPeriod.until).toStrictEqual(new Date('2024-08-12T10:00:00+01:00'));
    });

    test('- when the shift starts and ends on the same day, just 2 hours in the evening', () => {
        const onCallPeriod = new OnCallPeriod(
            new Date('2024-09-20T16:30:00+01:00'), 
            new Date('2024-09-20T18:30:00+01:00'), 
        );
        expect(onCallPeriod.since).toStrictEqual(new Date('2024-09-20T16:30:00+01:00'));
        expect(onCallPeriod.until).toStrictEqual(new Date('2024-09-20T18:30:00+01:00'));
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(0);
        expect(onCallPeriod.numberOfOohWeekends).toBe(0);
    });

    test('- when the shift starts on Friday 8pm and extends until Monday morning, numberOfOohWeekends must be 3', () => {
        const since = new Date('2024-09-20T20:00:00+01:00');
        const until = new Date('2024-09-23T10:00:00+01:00');
        const onCallPeriod = new OnCallPeriod(
            since, 
            until, 
        );
        expect(onCallPeriod.since).toStrictEqual(since);
        expect(onCallPeriod.until).toStrictEqual(until);
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(0);
        expect(onCallPeriod.numberOfOohWeekends).toBe(3);
    });

    test('- when the shift starts on 2024-08-28T10:00:00+01:00 and extends until 2024-09-02T10:00:00+01:00', () => {
        const since = new Date('2024-08-28T10:00:00+01:00');
        const until = new Date('2024-09-02T10:00:00+01:00');
        const onCallPeriod = new OnCallPeriod(
            since, 
            until, 
        );
        expect(onCallPeriod.since).toStrictEqual(since);
        expect(onCallPeriod.until).toStrictEqual(until);
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(2);
        expect(onCallPeriod.numberOfOohWeekends).toBe(3);
    });
})