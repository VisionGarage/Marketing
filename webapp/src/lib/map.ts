import type { Procedure, SearchResult } from "./types";

// Adaptează un rând Procedure la forma SearchResult folosită de ProcedureCard.
export function toResult(p: Procedure, isFavorite: boolean): SearchResult {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    category: p.category,
    vehicle: p.vehicle,
    module_ecu: p.module_ecu,
    tool: p.tool,
    language: p.language,
    tags: p.tags ?? [],
    visibility: p.visibility,
    owner_id: p.owner_id,
    is_favorite: isFavorite,
    headline: (p.content_md ?? "").replace(/[#*`>_]/g, "").slice(0, 160),
    rank: 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}
