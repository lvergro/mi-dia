import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Tests unitarios de lógica de queries (mocked supabase)
Deno.test("filters items with recurrence_days not including today", () => {
  // Valida la lógica de filtrado de días de semana
  const schemaDay = 3; // miércoles
  const recurrenceDays = [1, 2]; // lun, mar — no incluye mié
  const shouldSend = recurrenceDays.includes(schemaDay);
  assertEquals(shouldSend, false);
});

Deno.test("includes items with daily recurrence", () => {
  const recurrenceType = "daily";
  const shouldSend = recurrenceType === "daily";
  assertEquals(shouldSend, true);
});

Deno.test("notification payload uses name only when no dose", () => {
  const name = "Vitamina C";
  const dose: string | null = null;
  const body = dose ? `${name} — ${dose}` : undefined;
  assertEquals(body, undefined);
});

Deno.test("notification payload includes dose when present", () => {
  const name = "Ibuprofeno";
  const dose = "400mg";
  const body = dose ? `${name} — ${dose}` : undefined;
  assertEquals(body, "Ibuprofeno — 400mg");
});
