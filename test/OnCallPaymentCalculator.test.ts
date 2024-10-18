import { describe, expect, test } from '@jest/globals';
import { OnCallPaymentsCalculator } from "../src/OnCallPaymentsCalculator";
import { OnCallPeriod } from '../src/OnCallPeriod';
import { OnCallUser } from '../src/OnCallUser';
import { convertTimezone } from '../src/DateUtilities';
import { DateTime } from "luxon";

var runtimeEnvTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var runtimeEnvLocale = Intl.DateTimeFormat().resolvedOptions().locale;

describe('understanding luxon', () => {
    test('should be able to use luxon to convert date to local timezone', () => {
        const luxonDate = DateTime.fromISO('2023-10-01T12:00:00+01:00', { zone: 'Europe/London' });
        const timezone = luxonDate.zoneName;
        const localDate = luxonDate.setZone(runtimeEnvTimezone);
        const offset = luxonDate.offset;
        expect(offset).toBe(60);
        expect(timezone).toBe('Europe/London');
        expect(localDate.toISO()).toBe('2023-10-01T12:00:00.000+01:00');
    });
});

describe('should calculate the payment for an on call user', () => {
    test('- when person continues to be on-call from end of Month to 12th of subsequent month', () => {
        const luxonSince = DateTime.fromISO('2024-07-31T23:00:00+01:00', { zone: 'Europe/London' });
        const luxonUntil = DateTime.fromISO('2024-08-12T10:00:00+01:00', { zone: 'Europe/London' });
        const since = luxonSince.toJSDate();
        const until = luxonUntil.toJSDate();

        const onCallUser = new OnCallUser(
            '1',
            'John Doe',
            [
                new OnCallPeriod(since, until)
            ]
        );

        const calculator = new OnCallPaymentsCalculator();
        expect(onCallUser.onCallPeriods).toBeDefined();
        expect(onCallUser.onCallPeriods.length).toBe(1);
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(6);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekends).toBe(6);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(750);
    });

    test('- when person starts to be on-call from start of Month 10am to 12th of that month', () => {
        const luxonSince = DateTime.fromISO('2024-08-01T10:00:00+01:00', { zone: 'Europe/London' });
        const luxonUntil = DateTime.fromISO('2024-08-12T10:00:00+01:00', { zone: 'Europe/London' });
        const since = luxonSince.toJSDate();
        const until = luxonUntil.toJSDate();
        const onCallUser = new OnCallUser(
            '1',
            'John Doe',
            [
                new OnCallPeriod(since, until)
            ]
        );

        const calculator = new OnCallPaymentsCalculator();
        expect(onCallUser.onCallPeriods).toBeDefined();
        expect(onCallUser.onCallPeriods.length).toBe(1);
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(5);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekends).toBe(6);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(700);
    });

    test('- when person starts to be on-call from 28th of August 10am to end of August', () => {

        const since = DateTime.fromISO('2024-08-28T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate();
        const until = DateTime.fromISO('2024-08-31T23:59:59+01:00', { zone: 'Europe/London' }).toJSDate();
        const onCallUser = new OnCallUser(
            '1',
            'John Doe',
            [
                new OnCallPeriod(since, until)
            ]
        );

        const calculator = new OnCallPaymentsCalculator();
        expect(onCallUser.onCallPeriods).toBeDefined();
        expect(onCallUser.onCallPeriods.length).toBe(1);
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(2);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekends).toBe(1);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(175);
    });

    test('- when person starts to be on-call from 28th of Month 10am to 2nd of next month', () => {
        const since = DateTime.fromISO('2024-08-28T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate();
        const until = DateTime.fromISO('2024-09-02T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate();
        const onCallUser = new OnCallUser(
            '1',
            'John Doe',
            [
                new OnCallPeriod(since, until)
            ]
        );

        const calculator = new OnCallPaymentsCalculator();
        expect(onCallUser.onCallPeriods).toBeDefined();
        expect(onCallUser.onCallPeriods.length).toBe(1);
        expect(onCallUser.onCallPeriods[0].since).toEqual(since);
        expect(onCallUser.onCallPeriods[0].until).toEqual(until);
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(2);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekends).toBe(3);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(325);
    });

    test('- when multiple people are on-call from start of Month 10am to end of that month', () => {
        const onCallUsers = [
            new OnCallUser(
                '1PF7DNAV',
                'YW Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-01T00:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-06T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    ),
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-28T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-09-01T00:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            ),
            new OnCallUser(
                'PGO3DTM',
                'SK Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-06T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-15T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                        )
                    ,
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-16T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-21T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            ),
            new OnCallUser(
                'PINI77A',
                'EG Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-15T00:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-16T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            ),
            new OnCallUser(
                'PJXZDBT',
                'CE Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-21T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-28T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            )
        ];

        const calculator = new OnCallPaymentsCalculator();
        expect(calculator.calculateOnCallPayments(onCallUsers)).toStrictEqual({
            "1PF7DNAV": 575,
            "PGO3DTM": 850,
            "PINI77A": 50,
            "PJXZDBT": 425,
        });
    });
});

describe('should be able to audit the payment for an on call user', () => {
    test('- when multiple people are on-call from start of Month 10am to end of that month', () => {
        const onCallUsers = [
            new OnCallUser(
                '1PF7DNAV',
                'YW Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-01T00:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-06T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    ),
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-28T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-09-01T00:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            ),
            new OnCallUser(
                'PGO3DTM',
                'SK Oncall',
                [
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-06T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-15T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    ),
                    new OnCallPeriod(
                        DateTime.fromISO('2024-08-16T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate(),
                        DateTime.fromISO('2024-08-21T10:00:00+01:00', { zone: 'Europe/London' }).toJSDate()
                    )
                ]
            )
        ];

        expect(onCallUsers.length).toBe(2);
        expect(onCallUsers[0].id).toBe('1PF7DNAV');
        expect(onCallUsers[0].getTotalOohWeekDays()).toBe(4);
        const audit = OnCallPaymentsCalculator.getAuditableOnCallPaymentRecords(onCallUsers);
        expect(audit['1PF7DNAV'].OnCallUser.getTotalOohWeekDays()).toBe(4);
        expect(audit['1PF7DNAV'].OnCallUser.getTotalOohWeekendDays()).toBe(5);
        expect(audit['1PF7DNAV'].totalCompensation).toBe(575);
        expect(audit['PGO3DTM'].totalCompensation).toBe(850);
    });
});
