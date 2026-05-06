export type TimeBlock = "morning" | "afternoon" | "night";

export type DailyItemStatus = "pending" | "done" | "skipped" | "not_sure";

export type RoutineType = "medication" | "procedure" | "self_care";

export interface User {
  id: string;
  email: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dose: string | null;
  instructions: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type MedicationInsert = Omit<Medication, "id" | "created_at" | "updated_at">;
export type MedicationUpdate = Partial<Omit<Medication, "id" | "user_id" | "created_at" | "updated_at">>;

export interface Routine {
  id: string;
  user_id: string;
  medication_id: string | null;
  type: RoutineType;
  title: string;
  scheduled_time: string | null;
  time_block: TimeBlock | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type RoutineInsert = Omit<Routine, "id" | "created_at" | "updated_at">;

export interface DailyItem {
  id: string;
  user_id: string;
  routine_id: string | null;
  date: string;
  title: string;
  type: RoutineType;
  scheduled_time: string | null;
  status: DailyItemStatus;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DailyItemInsert = Omit<DailyItem, "id" | "created_at" | "updated_at">;

export interface DailyNote {
  id: string;
  user_id: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export type DailyNoteInsert = Omit<DailyNote, "id" | "created_at" | "updated_at">;
