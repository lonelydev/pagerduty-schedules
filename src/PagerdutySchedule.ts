import { FinalSchedule } from "./FinalSchedule.js";

export interface PagerdutySchedule {
    name: string;
    html_url: string;
    final_schedule: FinalSchedule;
}