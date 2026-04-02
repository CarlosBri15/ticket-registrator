export interface IReceiptExtraction {
  establishment?: string;
  address?: {
    street?: string;
    number?: string;
    zip_code?: string;
    city?: string;
    formatted_address?: string;
  };
  date?: string;
  time?: string;
  payment_method?: string;
  card_last_4?: string;
  items?: Array<{
    description: string;
    price: number;
    expense_type?: string;
  }>;
  total?: number;
  converted_amount?: number;
  converted_currency?: string;
  cgs_bucket_link_justification?: string;
  flag?: boolean;
  llm_comment?: string | null;
}
