export type ProcedureCategory = "coding" | "retrofit";
export type JobStatus = "planned" | "in_progress" | "done" | "failed";

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
}

export interface Vehicle {
  id: number;
  client_id: number | null;
  client_name?: string;
  make: string;
  model: string;
  year: number | null;
  vin: string;
  engine: string;
  notes: string;
  created_at: string;
}

export interface Procedure {
  id: number;
  make: string;
  model: string;
  year_from: number | null;
  year_to: number | null;
  category: ProcedureCategory;
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  tools_needed: string;
  risk_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CodingFile {
  id: number;
  vehicle_id: number;
  procedure_id: number | null;
  filename: string;
  stored_path: string;
  description: string;
  created_at: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Job {
  id: number;
  vehicle_id: number;
  procedure_id: number | null;
  procedure_title?: string;
  make?: string;
  model?: string;
  vin?: string;
  technician: string;
  job_date: string;
  status: JobStatus;
  notes: string;
  checklist: string;
  created_at: string;
}
