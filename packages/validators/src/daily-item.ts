import { z } from "zod";

export const dailyItemStatusSchema = z.enum(
  ["pending", "done", "skipped", "not_sure"],
  { errorMap: () => ({ message: "Estado inválido" }) }
);

export type DailyItemStatusInput = z.infer<typeof dailyItemStatusSchema>;
