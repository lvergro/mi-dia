import { describe, expect, it } from "vitest";
import {
  calculateAdherence,
  generateDailyChecklist,
  getPendingItems,
  groupItemsByTimeBlock,
} from "../checklist.js";
import type { DailyItem, Routine } from "@mi-dia/types";

const DATE = "2026-05-06";

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
    medication_id: null,
    type: "self_care",
    title: "Ejercicio",
    scheduled_time: null,
    time_block: "morning",
    active: true,
    created_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function makeItem(overrides: Partial<DailyItem> = {}): DailyItem {
  return {
    id: "i1",
    user_id: "u1",
    routine_id: "r1",
    date: DATE,
    type: "self_care",
    title: "Ejercicio",
    scheduled_time: null,
    time_block: "morning",
    status: "pending",
    completed_at: null,
    notes: null,
    created_at: "2026-05-06T00:00:00Z",
    ...overrides,
  };
}

describe("generateDailyChecklist", () => {
  it("returns empty array for empty routines", () => {
    expect(generateDailyChecklist([], DATE)).toEqual([]);
  });

  it("filters out inactive routines", () => {
    const routines = [makeRoutine({ active: false })];
    expect(generateDailyChecklist(routines, DATE)).toEqual([]);
  });

  it("generates item from active routine with correct fields", () => {
    const routine = makeRoutine({ id: "r1", title: "Pastilla", type: "medication", time_block: "afternoon", scheduled_time: "08:00" });
    const result = generateDailyChecklist([routine], DATE);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      user_id: "u1",
      routine_id: "r1",
      date: DATE,
      type: "medication",
      title: "Pastilla",
      scheduled_time: "08:00",
      time_block: "afternoon",
      status: "pending",
      completed_at: null,
      notes: null,
    });
  });

  it("does not duplicate if existingItems contains routine_id", () => {
    const routine = makeRoutine({ id: "r1" });
    const existing = [makeItem({ routine_id: "r1" })];
    expect(generateDailyChecklist([routine], DATE, existing)).toEqual([]);
  });

  it("only skips routines that already exist, generates the rest", () => {
    const r1 = makeRoutine({ id: "r1" });
    const r2 = makeRoutine({ id: "r2", title: "Meditación" });
    const existing = [makeItem({ routine_id: "r1" })];
    const result = generateDailyChecklist([r1, r2], DATE, existing);
    expect(result).toHaveLength(1);
    expect(result[0].routine_id).toBe("r2");
  });

  it("propagates null time_block from routine", () => {
    const routine = makeRoutine({ time_block: null });
    const [item] = generateDailyChecklist([routine], DATE);
    expect(item.time_block).toBeNull();
  });
});

describe("groupItemsByTimeBlock", () => {
  it("returns empty groups for empty input", () => {
    expect(groupItemsByTimeBlock([])).toEqual({ morning: [], afternoon: [], night: [] });
  });

  it("routes items to correct block", () => {
    const m = makeItem({ id: "i1", time_block: "morning" });
    const a = makeItem({ id: "i2", time_block: "afternoon" });
    const n = makeItem({ id: "i3", time_block: "night" });
    const result = groupItemsByTimeBlock([m, a, n]);
    expect(result.morning).toEqual([m]);
    expect(result.afternoon).toEqual([a]);
    expect(result.night).toEqual([n]);
  });

  it("excludes items with null time_block", () => {
    const item = makeItem({ time_block: null });
    const result = groupItemsByTimeBlock([item]);
    expect(result.morning).toEqual([]);
    expect(result.afternoon).toEqual([]);
    expect(result.night).toEqual([]);
  });

  it("groups multiple items in the same block", () => {
    const a = makeItem({ id: "i1", time_block: "night" });
    const b = makeItem({ id: "i2", time_block: "night" });
    expect(groupItemsByTimeBlock([a, b]).night).toHaveLength(2);
  });
});

describe("getPendingItems", () => {
  it("returns empty for empty input", () => {
    expect(getPendingItems([])).toEqual([]);
  });

  it("returns only pending items", () => {
    const pending = makeItem({ id: "i1", status: "pending" });
    const done = makeItem({ id: "i2", status: "done" });
    const skipped = makeItem({ id: "i3", status: "skipped" });
    const not_sure = makeItem({ id: "i4", status: "not_sure" });
    expect(getPendingItems([pending, done, skipped, not_sure])).toEqual([pending]);
  });

  it("returns all items if all are pending", () => {
    const items = [makeItem({ id: "i1" }), makeItem({ id: "i2" })];
    expect(getPendingItems(items)).toHaveLength(2);
  });
});

describe("calculateAdherence", () => {
  it("returns zeros and pct=0 for empty input", () => {
    expect(calculateAdherence([])).toEqual({ total: 0, done: 0, skipped: 0, not_sure: 0, pct: 0 });
  });

  it("returns pct=100 when all items are done", () => {
    const items = [makeItem({ status: "done" }), makeItem({ id: "i2", status: "done" })];
    const result = calculateAdherence(items);
    expect(result.pct).toBe(100);
    expect(result.done).toBe(2);
    expect(result.total).toBe(2);
  });

  it("returns pct=0 when no items are done", () => {
    const items = [makeItem({ status: "skipped" }), makeItem({ id: "i2", status: "not_sure" })];
    expect(calculateAdherence(items).pct).toBe(0);
  });

  it("rounds pct correctly (1 of 3 done = 33%)", () => {
    const items = [
      makeItem({ id: "i1", status: "done" }),
      makeItem({ id: "i2", status: "skipped" }),
      makeItem({ id: "i3", status: "pending" }),
    ];
    expect(calculateAdherence(items).pct).toBe(33);
  });

  it("counts all statuses independently", () => {
    const items = [
      makeItem({ id: "i1", status: "done" }),
      makeItem({ id: "i2", status: "skipped" }),
      makeItem({ id: "i3", status: "not_sure" }),
      makeItem({ id: "i4", status: "pending" }),
    ];
    const result = calculateAdherence(items);
    expect(result).toMatchObject({ total: 4, done: 1, skipped: 1, not_sure: 1 });
  });
});
