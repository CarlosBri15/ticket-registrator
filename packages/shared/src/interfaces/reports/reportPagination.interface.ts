export interface ReportPaginationParams {
    page?: number;
    limit?: number;
    userId?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    status?: string | string[];
}
