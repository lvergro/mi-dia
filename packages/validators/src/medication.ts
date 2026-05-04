import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  dose: z.string().optional(),
  instructions: z.string().optional(),
  active: z.boolean().default(true),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
