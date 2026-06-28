export type Role = "admin" | "user";
export type SubStatus = "trial" | "active" | "expired";
export type Visibility = "private" | "shared";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  subscription_status: SubStatus;
  subscription_expires_at: string | null;
  watermark_tag: string;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
  id: string;
  owner_id: string;
  visibility: Visibility;
  title: string;
  brand: string;
  category: string;
  vehicle: string | null;
  module_ecu: string | null;
  tool: string | null;
  language: string;
  tags: string[];
  content_md: string;
  source_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  brand: string;
  category: string;
  vehicle: string | null;
  module_ecu: string | null;
  tool: string | null;
  language: string;
  tags: string[];
  visibility: Visibility;
  owner_id: string;
  is_favorite: boolean;
  headline: string;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  procedure_id: string;
  owner_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: "image" | "file";
  created_at: string;
}

export interface ProcessingJob {
  id: string;
  owner_id: string;
  kind: string;
  status: "queued" | "processing" | "done" | "error";
  input_path: string;
  output_path: string | null;
  error_msg: string | null;
  created_at: string;
  updated_at: string;
}
