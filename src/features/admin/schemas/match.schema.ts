// features/admin/schemas/match.schema.ts
import { z } from "zod";

/**
 * Validation du formulaire création/édition de match (CdC §4.1).
 * Première ligne de défense — la base revérifie de toute façon
 * (policy `kickoff_at > now()` et check `team1 <> team2`).
 */
export const matchFormSchema = z
  .object({
    team1: z
      .string()
      .trim()
      .min(1, "L'équipe 1 est obligatoire"),
    team2: z
      .string()
      .trim()
      .min(1, "L'équipe 2 est obligatoire"),
    kickoffAt: z.date({
      error: (issue) =>
        issue.input === undefined
          ? "La date et l'heure du match sont obligatoires"
          : "Date invalide",
    }),
  })
  .refine((data) => data.team1.toLowerCase() !== data.team2.toLowerCase(), {
    message: "Les deux équipes doivent être différentes",
    path: ["team2"],
  })
  .refine((data) => data.kickoffAt.getTime() > Date.now(), {
    message: "Le coup d'envoi doit être dans le futur",
    path: ["kickoffAt"],
  });

export type MatchFormValues = z.infer<typeof matchFormSchema>;