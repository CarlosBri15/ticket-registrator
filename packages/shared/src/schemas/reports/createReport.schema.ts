import { z } from 'zod';

export const createReportSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    start_date: z.date(),
    end_date: z.date(),
    currency: z.string().min(1, 'Currency is required'),
    type: z.string().optional(),
})

export type CreateReportSchema = z.infer<typeof createReportSchema>