import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  surname: z.string().min(2).max(255),
  email: z.string().email(),
  username: z.string().min(3).max(255),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  roleId: z.string().uuid(),
  departmentIds: z.array(z.string().uuid()).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
