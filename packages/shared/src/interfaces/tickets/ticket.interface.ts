export interface ITicketItem {
    name: string;
    amount: number;
    currency: string;
    status: string;
}

export interface ITicket {
    id: string;
    report_id: string;
    cgs_bucket_link: string;
    payment_type: string;
    expense_type: string;
    date: Date | string;
    location_name: string;
    location_address: string;
    amount: number;
    currency: string;
    converted_amount: number;
    converted_currency: string;
    status: string;
    llm_recomendation?: string;
    approved_amount: number;
    items: ITicketItem[];
}
