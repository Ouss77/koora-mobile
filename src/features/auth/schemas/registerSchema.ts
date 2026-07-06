import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Le pseudo doit contenir au moins 3 caractères")
      .max(20, "Le pseudo doit contenir au maximum 20 caractères")
      .regex(/^[a-zA-Z0-9_]+$/, "Seuls les lettres, chiffres et underscore (_) sont autorisés"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;