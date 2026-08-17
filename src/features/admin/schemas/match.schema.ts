// features/admin/schemas/match.schema.ts (remplace le fichier existant)
import { z } from "zod";

/**
 * Parse une date au format DD/MM/YYYY et retourne un objet Date.
 * Valide : jour 1-31, mois 1-12, année 4 chiffres.
 */
function parseDateDDMMYYYY(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const d = new Date(`${year}-${month}-${day}T00:00:00`);

  // Vérifie que la date est valide (pas 32/13/2000, etc.)
  if (d.getFullYear() !== parseInt(year)) return null;
  if (d.getMonth() + 1 !== parseInt(month)) return null;
  if (d.getDate() !== parseInt(day)) return null;

  return d;
}

/**
 * Parse une heure au format HH:mm et retourne { hours, minutes }.
 */
function parseHHmm(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}

/**
 * Schéma validation formulaire création/édition match.
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
    // Format : DD/MM/YYYY
    dateStr: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format attendu : DD/MM/YYYY")
      .transform((val) => parseDateDDMMYYYY(val))
      .refine((date) => date !== null, "Date invalide"),
    // Format : HH:mm
    timeStr: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format attendu : HH:mm")
      .transform((val) => parseHHmm(val))
      .refine((time) => time !== null, "Heure invalide"),
  })
  .refine((data) => data.team1.toLowerCase() !== data.team2.toLowerCase(), {
    message: "Les deux équipes doivent être différentes",
    path: ["team2"],
  })
  .transform((data) => {
    // Fusionne date + heure en un seul objet Date
    const date = data.dateStr as Date;
    const time = data.timeStr as { hours: number; minutes: number };
    date.setHours(time.hours, time.minutes, 0, 0);

    return {
      team1: data.team1,
      team2: data.team2,
      kickoffAt: date,
    };
  })
  .refine((data) => data.kickoffAt.getTime() > Date.now(), {
    message: "Le coup d'envoi doit être dans le futur",
    path: ["dateStr"],
  });

export type MatchFormValues = z.infer<typeof matchFormSchema>;

/**
 * Format Date → DD/MM/YYYY pour l'input
 */
export function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format Date → HH:mm pour l'input
 */
export function formatTimeToHHmm(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}