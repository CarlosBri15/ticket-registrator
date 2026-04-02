import { z } from 'zod';

const adminEntrySchema = z.object({
    name: z.string().min(2, "Name is too short"),
    surname: z.string().min(2, "Surname is too short"),
    email: z.string().email("Invalid email format"),
}).strict();

export const onboardOrganizationSchema = z.object({
    company: z.object({
        name: z.string().min(2, "Company name is too short"),
    }),
    admins: z.array(adminEntrySchema).min(1, "At least one admin is required"),
}).strict();

export type OnboardOrganizationSchema = z.infer<typeof onboardOrganizationSchema>;
