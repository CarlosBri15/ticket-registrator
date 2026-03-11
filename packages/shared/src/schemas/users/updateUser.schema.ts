import { z } from 'zod';
import { Roles } from '../../user-roles/roles';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long").optional(),
  surname: z.string().min(2, "Surname is too short").max(50, "Surname is too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(1, "Username is required").optional(),
  password: z.string().min(10, "Password must be at least 10 characters").optional(),
  confirmPassword: z.string().min(1, "Confirm password is required").optional(),
  roleId: z.string().optional(),
  departmentIds: z.array(z.string().uuid("Invalid department UUID")).optional(),
})
  .strict()
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
