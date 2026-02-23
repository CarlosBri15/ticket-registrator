import { z } from 'zod';
import { Roles} from "../../user-roles/roles";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  surname: z.string().min(2, "Surname is too short").max(50, "Surname is too long"),
  email: z.string().min(1, "Email is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  role: z.nativeEnum(Roles),
  departmentId: z.string().regex(objectIdRegex, "Invalid department ID"),
})
.strict()
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;