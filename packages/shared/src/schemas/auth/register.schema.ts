import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  surname: z.string().min(2, "Surname is too short").max(50, "Surname is too long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  roleId: z.string().uuid("Invalid role UUID").min(1, "Role is required"),
  departmentIds: z.array(z.string().uuid("Invalid department UUID")).min(1, "At least one department is required"),
})
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;