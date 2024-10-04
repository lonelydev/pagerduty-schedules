import { IOnCallPaymentsCalculator } from "./IOnCallPaymentsCalculator";
import { OnCallUser } from "./OnCallUser";

function wasPersonOnCallOOH(dateToCheck: Date, onCallUntilDate: Date): boolean {
    const onCallDurationInHours = dateDiffInHours(onCallUntilDate, dateToCheck);
    var dateToCheckEvening = new Date(dateToCheck);
    dateToCheckEvening.setHours(18);
    return (dateToCheckEvening > dateToCheck && dateToCheckEvening < onCallUntilDate)
}

export function dateDiffInHours(until: Date, since: Date): number {
    return Math.round(Math.abs(until.getTime()) - Math.abs(since.getTime())) / (1000 * 60 * 60);
}

export class KaluzaOnCallPaymentsCalculator implements IOnCallPaymentsCalculator {
    onCallRates: number[];

    constructor(onCallRates: number[]) {
        this.onCallRates = onCallRates;
    }

    /**
     * The calculator works on the assumption that the request was made with full date time format
     * i.e. since is YYYY-MM-DDT00:00:00+01:00 AND until is YYYY-MM-DDT23:59:59+01:00
     */
    calculateOnCallPayment(onCallUser: OnCallUser): number {
        if (!onCallUser) {
            throw new Error("User undefined!");
        }
        if (!onCallUser.onCallPeriods) {
            throw new Error("No on call periods defined!");
        }
        let onCallDays: number[] = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < onCallUser.onCallPeriods.length; i++) {
            if (onCallUser.onCallPeriods[i].since > onCallUser.onCallPeriods[i].until) {
                throw new Error("Invalid date range!");
            }

            let curDate = onCallUser.onCallPeriods[i].since;
            while (curDate < onCallUser.onCallPeriods[i].until) {
                if (wasPersonOnCallOOH(curDate, onCallUser.onCallPeriods[i].until)) {
                    onCallDays[curDate.getDay()] += 1;
                }
                curDate.setDate(curDate.getDate() + 1);
            }
        }
        let totalPayment = 0;
        for (let i=0; i < onCallDays.length; i++) {
            totalPayment += onCallDays[i] * this.onCallRates[i];
        }
        return totalPayment;
    }

    calculateOnCallPayments(onCallUsers: OnCallUser[]): Record<string, number> {
        let payments: Record<string, number> = {};
        for (let i = 0; i < onCallUsers.length; i++) {
            payments[onCallUsers[i].id] = this.calculateOnCallPayment(onCallUsers[i]);
        }
        return payments;
    }
}
