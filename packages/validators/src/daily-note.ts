import { z } from "zod";

export const dailyNoteSchema = z.object({
  content: z.string().min(1, "El contenido no puede estar vacío"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
});

export type DailyNoteInput = z.infer<typeof dailyNoteSchema>;
