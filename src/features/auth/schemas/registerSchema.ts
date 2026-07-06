import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Le pseudo doit contenir au moins 3 caracteres")
      .max(20, "Le pseudo doit contenir au maximum 20 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Seules les lettres, les chiffres et l'underscore (_) sont autorises",
      ),
    password: z
      .string()
      .min(4, "Le mot de passe doit contenir au moins 4 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;
