import type { ReportStatusType } from '../../statuses/report-status';
export interface IReport {
    id: string;
    _id?: string;
    user_id: string;
    name: string;
    start_date: string;
    end_date: string;
    currency: string;
    type: string;
    requested_amount: number;
    approved_amount: number;
    status: ReportStatusType;
    createdAt: string;
    updatedAt: string;
    isVisible: boolean;
}