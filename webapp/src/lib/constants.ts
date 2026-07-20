// Liste de referință pentru formulare și filtre.
// Cele 3 mărci rămân separate vizual și logic.

export const BRANDS = ["BMW", "VAG", "Mercedes", "Altele"] as const;
export type Brand = (typeof BRANDS)[number];

export const CATEGORIES = [
  "Codare",
  "IMMO / Component Protection",
  "Flash ECU/TCU",
  "Airbag / Crash",
  "Ceas / Cluster",
  "Retrofit",
  "Pinout",
  "Manual reparație",
  "Diagnoză",
] as const;

export const TOOLS = [
  "E-Sys",
  "ODIS",
  "VCDS",
  "Vediamo",
  "DTS Monaco",
  "Xentry",
  "SVM",
  "Altele",
] as const;

// Limba CONȚINUTULUI (separată de limba UI). Adăugarea altora = doar extinde lista.
export const CONTENT_LANGUAGES = ["ro", "en", "it", "de", "fr", "es"] as const;

// Culori de brand per marcă pentru accente discrete (mărcile rămân separate vizual).
export const BRAND_ACCENT: Record<string, string> = {
  BMW: "#5b9bd5",
  VAG: "#c0552c",
  Mercedes: "#9aa0a6",
  Altele: "#b8922a",
};
