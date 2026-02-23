import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  surname: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(10).optional(),
  confirmPassword: z.string().optional(),
  role: z.string().optional(),
  departmentId: z.string().optional(),
}).strict()
.refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UpdateUserSchema= z.infer<typeof updateUserSchema>;