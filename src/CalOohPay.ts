#!/usr/bin/env node
import { api } from '@pagerduty/pdjs';
import * as dotenv from 'dotenv';
import { hideBin } from 'yargs/helpers';
import yargs from "yargs";
import { OnCallUser } from './OnCallUser';
import { OnCallPeriod } from './OnCallPeriod';
import { FinalSchedule } from './FinalSchedule';
import { KaluzaOnCallPaymentsCalculator } from './KaluzaOnCallPaymentsCalculator';
import { ScheduleEntry } from './ScheduleEntry';
import { CommandLineOptions } from './CommandLineOptions.js';

dotenv.config();

interface Environment {
    API_TOKEN: string;
}

function sanitiseEnvVariable(envVars: NodeJS.ProcessEnv): Environment {
    if (!envVars.API_TOKEN) {
        throw new Error("API_TOKEN not defined");
    }
    return {
        API_TOKEN: envVars.API_TOKEN,
    };
}

function toLocalIsoStringWithOffset(date: Date): string {
    var timezoneOffsetInMilliseconds = date.getTimezoneOffset() * 60000;
    var localISOTime = (new Date(date.getTime() - timezoneOffsetInMilliseconds)).toISOString().slice(0, -5);
    let timezoneOffsetInHours = - (timezoneOffsetInMilliseconds / 3600000);
    let localISOTimeWithOffset =
        localISOTime +
        (timezoneOffsetInHours >= 0 ? '+' : '-') +
        (Math.abs(timezoneOffsetInHours) < 10 ? '0' : '') +
        timezoneOffsetInHours + ':00';
    return localISOTimeWithOffset;
}
const sanitisedEnvVars: Environment = sanitiseEnvVariable(process.env);

const yargsInstance = yargs(hideBin(process.argv));

const argv: CommandLineOptions = yargsInstance
    .wrap(yargsInstance.terminalWidth())
    .usage('$0 [options] <args>')
    .option('rota-ids', {
        alias: 'r',
        describe: '1 scheduleId or multiple scheduleIds separated by comma',
        type: 'string',
        demandOption: true,
        example: 'R1234567,R7654321'
    })
    .option('timeZoneId', {
        type: 'string',
        demandOption: false,
        alias: 't',
        description: 'the timezone id of the schedule. Refer https://developer.pagerduty.com/docs/1afe25e9c94cb-types#time-zone for details.'
    })
    .default('t', function defaultTimeZoneId(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    })
    .option('since', {
        type: 'string',
        alias: 's',
        description: 'start of the schedule period (inclusive) in https://en.wikipedia.org/wiki/ISO_8601 format',
        example: '2021-08-01T00:00:00+01:00'
    })
    .default('s', function firstDayOfPreviousMonth(): string {
        let today = new Date();
        return toLocalIsoStringWithOffset(new Date(new Date(today.getFullYear(), (today.getMonth() - 1), 1)));
    }, 'the first day of the previous month')
    .option('until', {
        type: 'string',
        alias: 'u',
        description: 'end of the schedule period (inclusive) in https://en.wikipedia.org/wiki/ISO_8601 format',
        example: '2021-08-01T00:00:00+01:00'
    })
    .default('u', function lastDayOfPreviousMonth(): string {
        let today = new Date();
        return toLocalIsoStringWithOffset(new Date(
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1,
                10)
        ));
    }, 'the first day of the this month')
    .option('key', {
        type: 'string',
        demandOption: false,
        alias: 'k',
        description: 'API_TOKEN to override environment variable API_TOKEN.\n' + 
        'Get your API User token from \n' + 
        'My Profile -> User Settings -> API Access -> Create New API User Token'
    })
    .option('output-file', {
        type: 'string',
        demandOption: false,
        alias: 'o',
        description: 'the path to the file where you want the on-call payments table printed'
    })
    .option('help', {
        type: 'boolean',
        alias: 'h',
        description: 'Show help'
    })
    .example([
        ['caloohpay -r "PQRSTUV,PSTUVQR,PTUVSQR"', 
            'Calculates on-call payments for the comma separated pagerduty scheduleIds. The default timezone is the local timezone. The default period is the previous month.'],
        ['caloohpay -r "PQRSTUV" -s "2021-08-01T00:00:00+01:00" -u "2021-09-01T10:00:00+01:00"', 
            'Calculates on-call payments for the schedules with the given scheduleIds for the month of August 2021.'],
    ])
    .help()
    .check((argv) => {
        if (argv.since && !Date.parse(argv.since)) {
            throw new Error("Invalid date format for since");
        }
        if (argv.until && !Date.parse(argv.until)) {
            throw new Error("Invalid date format for until");
        }
        return true;
    }).argv as CommandLineOptions;

calOohPay(argv);

function getOnCallUserFromScheduleEntry(scheduleEntry: ScheduleEntry): OnCallUser {
    let onCallPeriod = new OnCallPeriod(scheduleEntry.start, scheduleEntry.end);
    let onCallUser = new OnCallUser(
        scheduleEntry.user?.id || "",
        scheduleEntry.user?.summary || "", [onCallPeriod]);
    return onCallUser
}

function extractOnCallUsersFromFinalSchedule(finalSchedule: FinalSchedule): Record<string, OnCallUser> {
    let onCallUsers: Record<string, OnCallUser> = {};
    if (finalSchedule.rendered_schedule_entries) {
        finalSchedule.rendered_schedule_entries.forEach(scheduleEntry => {
            let onCallUser = getOnCallUserFromScheduleEntry(scheduleEntry);
            if (onCallUser.id in onCallUsers) {
                onCallUsers[onCallUser.id].addOnCallPeriods(onCallUser.onCallPeriods);
            } else {
                onCallUsers[onCallUser.id] = onCallUser;
            }
        });
    }
    return onCallUsers;
}

function calOohPay(cliOptions: CommandLineOptions) {
    const pagerDutyApi = api({ token: sanitisedEnvVars.API_TOKEN });
    for (let rotaId of cliOptions.rotaIds.split(',')) {
        pagerDutyApi
            .get(`/schedules/${rotaId}`,
                {
                    data: {
                        overflow: false,
                        since: cliOptions.since,
                        time_zone: cliOptions.timeZoneId,
                        until: cliOptions.until
                    }
                }
            ).then(
                ({ data, resource, response, next }) => {
                    console.log('-'.repeat(process.stdout.columns || 80));
                    console.log("Schedule name: %s", data.schedule.name);
                    console.log("Schedule URL: %s", data.schedule.html_url);
                    let onCallUsers = extractOnCallUsersFromFinalSchedule(data.schedule.final_schedule);
                    let listOfOnCallUsers = Object.values(onCallUsers);

                    let auditableRecords = KaluzaOnCallPaymentsCalculator.getAuditableOnCallPaymentRecords(listOfOnCallUsers);
                    console.log("User, TotalComp, Mon-Thu, Fri-Sun");

                    for (const [userId, onCallCompensation] of Object.entries(auditableRecords)) {
                        console.log("%s, %d, %d, %d",
                            onCallCompensation.OnCallUser.name,
                            onCallCompensation.totalCompensation,
                            onCallCompensation.OnCallUser.getTotalOohWeekDays(),
                            onCallCompensation.OnCallUser.getTotalOohWeekendDays());
                    }
                }
            ).catch(
                (error) => {
                    console.error("Error: %s", error);
                }
            );
    }
}
