import type { ITicket } from '../tickets/ticket.interface';
import type { ReportStatusType } from '../../statuses/report-status';
import type { IReportCategoryMix } from './report-category-mix.interface';

export interface IReport {
    id: string;
    user_id: string;
    userName?: string | null;
    userSurname?: string | null;
    name: string;
    start_date: string;
    end_date: string;
    currency: string;
    type: string;
    requested_amount: number;
    approved_amount: number;
    status: ReportStatusType;
    categoryMix?: IReportCategoryMix[];
    tickets?: ITicket[];
    createdAt: string;
    updatedAt: string;
}

