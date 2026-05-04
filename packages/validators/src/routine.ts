import { z } from "zod";

export const routineSchema = z.object({
  medication_id: z.string().uuid("ID de medicamento inválido"),
  time_block: z.enum(["morning", "afternoon", "night"], {
    errorMap: () => ({ message: "Bloque horario inválido" }),
  }),
  active: z.boolean().default(true),
});

export type RoutineInput = z.infer<typeof routineSchema>;
