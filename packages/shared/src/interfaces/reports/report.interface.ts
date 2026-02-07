import type { ReportStatusType } from '../../statuses/report-status';
export interface IReport {
    id: string;
    _id?: string;
    user_id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    currency: string;
    type: string;
    requested_amount: number;
    approved_amount: number;
    status: ReportStatusType;
}