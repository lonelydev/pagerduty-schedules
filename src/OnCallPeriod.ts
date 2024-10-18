export class OnCallPeriod {

    readonly since: Date;
    readonly until: Date;

    private _numberOfOohWeekDays: number = 0;
    private _numberOfOohWeekends: number = 0;

    constructor(s: Date, u: Date) {
        this.since = new Date(s);
        this.until = new Date(u);
        this.initializeOohWeekDayAndWeekendDayCount();
    }

    private initializeOohWeekDayAndWeekendDayCount() {
        let curDate = new Date(this.since);
        while (curDate < this.until) {
            if (OnCallPeriod.wasPersonOnCallOOH(curDate, this.until)) {
                if (OnCallPeriod.isWeekDay(curDate.getDay())) {
                    this._numberOfOohWeekDays++;
                } else {
                    this._numberOfOohWeekends++;
                }
            }
            curDate.setDate(curDate.getDate() + 1);
        }
    }

    public get numberOfOOhWeekDays(): number {
        return this._numberOfOohWeekDays;
    }

    public get numberOfOohWeekends(): number {
        return this._numberOfOohWeekends;
    }

    /**
     * Determines if the given day number corresponds to a weekday.
     *
     * @param dayNum - The number representing the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
     * @returns `true` if the day number corresponds to a weekday (Monday to Thursday), otherwise `false`.
     */
    private static isWeekDay(dayNum: number): boolean {
        return dayNum > 0 && dayNum < 5;
    }

    /**
     * Currently works on the assumption that dates don't have anything to do with timezones
     * and anything after 6pm in whichever timezone the date is in is considered evening.
     * @param since start of the shift
     * @param until end of the shift
     * @returns true if the person was on call OOH, false otherwise
     */
    private static wasPersonOnCallOOH(since: Date, until: Date): boolean {
        return (OnCallPeriod.doesShiftSpanEveningTillNextDay(since, until) &&
            OnCallPeriod.isShiftLongerThan6Hours(since, until));
    }

    private static doesShiftSpanEveningTillNextDay(since: Date, until: Date): boolean {
        /**
         * a shift could start during working hours and end after the working hours
         * a shift could start after working hours and end after the working hours
         */
        let endOfWorkingHours = new Date(since);
        endOfWorkingHours.setHours(17, 30);
        return (endOfWorkingHours < until) && 
            OnCallPeriod.doesShiftSpanDays(since, until);
    }

    private static isShiftLongerThan6Hours(date: Date, onCallUntilDate: Date): boolean {
        return (onCallUntilDate.getTime() - date.getTime()) >= 6 * 60 * 60 * 1000;
    }

    private static doesShiftSpanDays(since: Date, until: Date): boolean {
        /**
         * if the dates are not the same, then the shift spans days
         * this is to cover all cases, whether the shift since is end of a month
         * and until is early in the next month.
         */
        return (since.getDate() !== until.getDate());
    }

    toString() {
        console.log("On call period from %s to %s", this.since, this.until);
        console.log("Number of OOH Weekdays (Mon-Thu): %d", this.numberOfOOhWeekDays);
        console.log("Number of OOH Weekends (Fri-Sun): %d", this.numberOfOohWeekends);
    }
}
