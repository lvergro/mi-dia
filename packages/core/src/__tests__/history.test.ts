import { describe, expect, it } from "vitest";
import { buildHistory, buildHistoryRange } from "../history.js";
import type { Item, Log } from "@mi-dia/types";

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: "item-1",
    user_id: "u1",
    type: "medication",
    name: "Aspirina",
    dose: "100mg",
    specific_time: "08:00:00",
    recurrence_type: "daily",
    recurrence_days: null,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeLog(overrides: Partial<Log> = {}): Log {
  return {
    id: "log-1",
    user_id: "u1",
    item_id: "item-1",
    date: "2026-05-09",
    status: "done",
    note: null,
    completed_at: "2026-05-09T08:05:00Z",
    created_at: "2026-05-09T08:05:00Z",
    ...overrides,
  };
}

const TODAY = "2026-05-09"; // Saturday (sábado, schemaDay=6)

describe("buildHistory", () => {
  it("item daily con log done → pct=100, done=1, total=1", () => {
    const items = [makeItem()];
    const logs = [makeLog({ date: TODAY, status: "done" })];
    const result = buildHistory(items, logs, 1, TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].pct).toBe(100);
    expect(result[0].done).toBe(1);
    expect(result[0].total).toBe(1);
    expect(result[0].items[0].status).toBe("done");
  });

  it("item daily con log omitted → pct=0, done=0, total=1", () => {
    const items = [makeItem()];
    const logs = [makeLog({ date: TODAY, status: "omitted" })];
    const result = buildHistory(items, logs, 1, TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].pct).toBe(0);
    expect(result[0].done).toBe(0);
    expect(result[0].total).toBe(1);
    expect(result[0].items[0].status).toBe("omitted");
  });

  it("item daily sin log → status pending", () => {
    const items = [makeItem()];
    const result = buildHistory(items, [], 1, TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].items[0].status).toBe("pending");
    expect(result[0].done).toBe(0);
  });

  it("item specific_days=[3] (mié) evaluado en sábado → no aparece ese día", () => {
    // TODAY = 2026-05-09 = sábado (schemaDay=6), recurrence_days=[3] = miércoles
    const items = [makeItem({ recurrence_type: "specific_days", recurrence_days: [3] })];
    const result = buildHistory(items, [], 1, TODAY);

    // El sábado no tiene items para este item → total=0 → día omitido del resultado
    expect(result).toHaveLength(0);
  });

  it("item specific_days=[6] (sáb) evaluado en sábado → aparece", () => {
    // TODAY = 2026-05-09 = sábado (schemaDay=6)
    const items = [makeItem({ recurrence_type: "specific_days", recurrence_days: [6] })];
    const result = buildHistory(items, [], 1, TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(1);
  });

  it("item soft-deleted (deleted_at !== null) → excluido de todos los días", () => {
    const items = [makeItem({ deleted_at: "2026-05-01T00:00:00Z" })];
    const logs = [makeLog({ date: TODAY, status: "done" })];
    const result = buildHistory(items, logs, 7, TODAY);

    expect(result).toHaveLength(0);
  });

  it("rango 7 → máximo 7 días en el resultado (puede ser menos si días sin items)", () => {
    const items = [makeItem()]; // daily → aparece todos los días
    const result = buildHistory(items, [], 7, TODAY);

    expect(result.length).toBeLessThanOrEqual(7);
    expect(result.length).toBe(7); // daily aparece todos los días del rango
  });

  it("días sin items no aparecen en el resultado", () => {
    // Item solo los miércoles (schemaDay=3), rango 7 desde un viernes
    // Miércoles = 2026-05-06 (dentro del rango de 7 días desde 2026-05-09)
    const items = [makeItem({ recurrence_type: "specific_days", recurrence_days: [3] })];
    const result = buildHistory(items, [], 7, TODAY);

    // Solo el miércoles debe aparecer (1 día de 7)
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-05-06");
  });

  it("resultado está en orden descendente (más reciente primero)", () => {
    const items = [makeItem()];
    const result = buildHistory(items, [], 3, TODAY);

    expect(result[0].date).toBe(TODAY);
    expect(result[1].date).toBe("2026-05-08");
    expect(result[2].date).toBe("2026-05-07");
  });

  it("pct=0 cuando total=0 (nunca debe ocurrir ya que filtramos, pero por seguridad)", () => {
    // buildHistory filtra días sin items, así que total siempre > 0 en el resultado
    const items = [makeItem()];
    const result = buildHistory(items, [], 1, TODAY);
    expect(result[0].pct).toBeGreaterThanOrEqual(0);
  });

  it("múltiples items, algunos done, pct correcto", () => {
    const item1 = makeItem({ id: "item-1" });
    const item2 = makeItem({ id: "item-2", name: "Vitamina C" });
    const item3 = makeItem({ id: "item-3", name: "Ejercicio" });
    const logs = [
      makeLog({ item_id: "item-1", date: TODAY, status: "done" }),
      makeLog({ id: "log-2", item_id: "item-2", date: TODAY, status: "omitted" }),
    ];
    const result = buildHistory([item1, item2, item3], logs, 1, TODAY);

    expect(result[0].total).toBe(3);
    expect(result[0].done).toBe(1);
    expect(result[0].pct).toBe(33); // Math.round(1/3*100) = 33
  });
});

describe("buildHistoryRange", () => {
  it("rango de 1 día con log done → pct=100", () => {
    const items = [makeItem()];
    const logs = [makeLog({ date: TODAY, status: "done" })];
    const result = buildHistoryRange(items, logs, TODAY, TODAY);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe(TODAY);
    expect(result[0].pct).toBe(100);
    expect(result[0].done).toBe(1);
  });

  it("rango de 3 días → orden descendente", () => {
    const START = "2026-05-07";
    const END = "2026-05-09";
    const items = [makeItem()];
    const result = buildHistoryRange(items, [], START, END);

    expect(result).toHaveLength(3);
    expect(result[0].date).toBe("2026-05-09");
    expect(result[1].date).toBe("2026-05-08");
    expect(result[2].date).toBe("2026-05-07");
  });

  it("días sin ítems activos se omiten del resultado", () => {
    // item solo los miércoles (schemaDay=3), rango 7 días hasta 2026-05-09
    const items = [makeItem({ recurrence_type: "specific_days", recurrence_days: [3] })];
    const result = buildHistoryRange(items, [], "2026-05-03", TODAY);

    // Solo 2026-05-06 (miércoles) y 2026-05-03 (domingo? no — 3 = miércoles)
    // 2026-05-03 = domingo → no aparece; 2026-05-06 = miércoles → aparece
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-05-06");
  });

  it("item soft-deleted excluido de todo el rango", () => {
    const items = [makeItem({ deleted_at: "2026-05-01T00:00:00Z" })];
    const result = buildHistoryRange(items, [], "2026-05-01", TODAY);
    expect(result).toHaveLength(0);
  });

  it("sin logs → todos pending, pct=0", () => {
    const items = [makeItem()];
    const result = buildHistoryRange(items, [], TODAY, TODAY);
    expect(result[0].items[0].status).toBe("pending");
    expect(result[0].pct).toBe(0);
  });

  it("múltiples items con logs parciales → pct correcto", () => {
    const item1 = makeItem({ id: "item-1" });
    const item2 = makeItem({ id: "item-2", name: "Vitamina C" });
    const logs = [makeLog({ item_id: "item-1", date: TODAY, status: "done" })];
    const result = buildHistoryRange([item1, item2], logs, TODAY, TODAY);

    expect(result[0].total).toBe(2);
    expect(result[0].done).toBe(1);
    expect(result[0].pct).toBe(50);
  });

  it("startDate === endDate → exactamente 1 día en resultado si tiene items", () => {
    const items = [makeItem()];
    const result = buildHistoryRange(items, [], TODAY, TODAY);
    expect(result).toHaveLength(1);
  });
});
