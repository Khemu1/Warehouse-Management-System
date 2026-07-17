import { Roles } from "@/types/users";
import {
  email,
  object,
  string,
  type infer as Infer,
  enum as nativeEnum,
} from "zod";

export const userSchema = object({
  name: string().min(2, "Name must be at least 2 characters"),
  email: email("Invalid email address"),
  password: string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: nativeEnum(Roles, {
    error: "Please Choose a valid role ",
  }),
});

export const editUserSchema = object({
  name: string().min(2, "Name must be at least 2 characters"),
  email: email("Invalid email address"),
  password: string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(string().length(0)),
  role: nativeEnum(Roles, {
    error: "Please Choose a valid role ",
  }).optional(),
});

export type UserFormData = Infer<typeof userSchema>;
export type EditUserFormData = Infer<typeof editUserSchema>;
