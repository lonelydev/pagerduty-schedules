import {describe, expect, test} from '@jest/globals';
import { OnCallPaymentsCalculator } from "../src/OnCallPaymentsCalculator";
import { OnCallPeriod } from '../src/OnCallPeriod';
import { OnCallUser } from '../src/OnCallUser';

describe('should be able to initialise OnCallPeriod', () => {
    test('- when OnCallPeriod is initialised', () => {
        const onCallPeriod = new OnCallPeriod(new Date('2024-08-01T00:00:00+01:00'), new Date('2024-08-12T10:00:00+01:00'));
        expect(onCallPeriod.since).toStrictEqual(new Date('2024-08-01T00:00:00+01:00'));
        expect(onCallPeriod.until).toStrictEqual(new Date('2024-08-12T10:00:00+01:00'));
    });

    test('- same day, 2 hours in the evening on call period', () => {
        const onCallPeriod = new OnCallPeriod(
            new Date('2024-09-20T16:30:00+01:00'), 
            new Date('2024-09-20T18:30:00+01:00'), 
        );
        expect(onCallPeriod.since).toStrictEqual(new Date('2024-09-20T16:30:00+01:00'));
        expect(onCallPeriod.until).toStrictEqual(new Date('2024-09-20T18:30:00+01:00'));
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(0);
        expect(onCallPeriod.numberOfOohWeekendDays).toBe(0);
    });

    test('- from Friday 8pm to Monday morning, numberOfOohWeekendDays must be 3', () => {
        const since = new Date('2024-09-20T20:00:00+01:00');
        const until = new Date('2024-09-23T10:00:00+01:00');
        const onCallPeriod = new OnCallPeriod(
            since, 
            until, 
        );
        expect(onCallPeriod.since).toStrictEqual(since);
        expect(onCallPeriod.until).toStrictEqual(until);
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(0);
        expect(onCallPeriod.numberOfOohWeekendDays).toBe(3);
    });

    test('- from on-call from 28th of Month 10am to 2nd of next month', () => {
        const since = new Date('2024-08-28T10:00:00+01:00');
        const until = new Date('2024-09-02T10:00:00+01:00');
        const onCallPeriod = new OnCallPeriod(
            since, 
            until, 
        );
        expect(onCallPeriod.since).toStrictEqual(since);
        expect(onCallPeriod.until).toStrictEqual(until);
        expect(onCallPeriod.numberOfOOhWeekDays).toBe(2);
        expect(onCallPeriod.numberOfOohWeekendDays).toBe(3);
    });
})

describe('should calculate the payment for an on call user', () => {
    
    test('- when person continues to be on-call from end of Month to 12th of subsequent month', () => {
        const since = new Date('2024-08-01T00:00:00+01:00');
        const until = new Date('2024-08-12T10:00:00+01:00');

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
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(5);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekendDays).toBe(6);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(700);
    });

    test('- when person starts to be on-call from start of Month 10am to 12th of that month', () => {
        const since = new Date('2024-08-01T10:00:00+01:00');
        const until = new Date('2024-08-12T10:00:00+01:00');
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
        expect(onCallUser.onCallPeriods[0].numberOfOOhWeekDays).toBe(5);
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekendDays).toBe(6);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(700);
    });

    test('- when person starts to be on-call from 28th of August 10am to end of August', () => {
        const since = new Date('2024-08-28T10:00:00+01:00');
        const until = new Date('2024-08-31T23:59:59+01:00');
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
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekendDays).toBe(1);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(175);
    });

    test('- when person starts to be on-call from 28th of Month 10am to 2nd of next month', () => {
        const since = new Date('2024-08-28T10:00:00+01:00');
        const until = new Date('2024-09-02T10:00:00+01:00');
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
        expect(onCallUser.onCallPeriods[0].numberOfOohWeekendDays).toBe(3);
        expect(calculator.calculateOnCallPayment(onCallUser)).toBe(325);
    });

    test('- when multiple people are on-call from start of Month 10am to end of that month', () => {
        const onCallUsers = [
            new OnCallUser(
                '1PF7DNAV',
                'YW Oncall',
                [
                    new OnCallPeriod(new Date('2024-08-01T00:00:00+01:00'), new Date('2024-08-06T10:00:00+01:00')),
                    new OnCallPeriod(new Date('2024-08-28T10:00:00+01:00'), new Date('2024-09-01T00:00:00+01:00'))
                ]
            ),
            new OnCallUser(
                'PGO3DTM',
                'SK Oncall',
                [
                    new OnCallPeriod(new Date('2024-08-06T10:00:00+01:00'), 
                            new Date('2024-08-15T10:00:00+01:00')),
                        new OnCallPeriod(new Date('2024-08-16T10:00:00+01:00'), 
                            new Date('2024-08-21T10:00:00+01:00'))
                ]
            ),
            new OnCallUser(
                'PINI77A',
                'EG Oncall',
                [
                    new OnCallPeriod(new Date('2024-08-15T00:00:00+01:00'), 
                        new Date('2024-08-16T10:00:00+01:00'))
                ]
            ),
            new OnCallUser(
                'PJXZDBT',
                'CE Oncall',
                [
                    new OnCallPeriod(new Date('2024-08-21T10:00:00+01:00'), new Date('2024-08-28T10:00:00+01:00'))
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
                    new OnCallPeriod(new Date('2024-08-01T00:00:00+01:00'), new Date('2024-08-06T10:00:00+01:00')),
                    new OnCallPeriod(new Date('2024-08-28T10:00:00+01:00'), new Date('2024-09-01T00:00:00+01:00'))
                ]
            ),
            new OnCallUser(
                'PGO3DTM',
                'SK Oncall',
                [
                    new OnCallPeriod(new Date('2024-08-06T10:00:00+01:00'), 
                            new Date('2024-08-15T10:00:00+01:00')),
                        new OnCallPeriod(new Date('2024-08-16T10:00:00+01:00'), 
                            new Date('2024-08-21T10:00:00+01:00'))
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
