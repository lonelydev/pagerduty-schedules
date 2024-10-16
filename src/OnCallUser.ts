import { OnCallPeriod } from "./OnCallPeriod";

export class OnCallUser {
    public id: string;
    public name: string;
    private _onCallPeriods: Array<OnCallPeriod> = [];

    constructor(id: string, name: string, periods: OnCallPeriod[]) {
        this.id = id;
        this.name = name;
        this._onCallPeriods = periods;
    }

    public get onCallPeriods(): OnCallPeriod[] {
        return this._onCallPeriods;
    }
    public addOnCallPeriod(period: OnCallPeriod): void {
        this._onCallPeriods.push(period);
    }

    public addOnCallPeriods(periods: OnCallPeriod[]): void {
        this._onCallPeriods = this._onCallPeriods.concat(periods);
    }

    toString() {
        console.log("(%s) %s was on call during: ", this.id, this.name);
        this._onCallPeriods.forEach(ocp => console.log(ocp.toString()));
    }

    public getTotalOohWeekDays(): number {
        return this._onCallPeriods.reduce((acc, ocp) => acc + ocp.numberOfOOhWeekDays, 0);
    }

    public getTotalOohWeekendDays(): number {
        return this._onCallPeriods.reduce((acc, ocp) => acc + ocp.numberOfOohWeekends, 0);
    }
}
