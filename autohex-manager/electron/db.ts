import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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
  make: string;
  model: string;
  year: number | null;
  vin: string;
  engine: string;
  notes: string;
  created_at: string;
}

export type ProcedureCategory = "coding" | "retrofit";

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
  steps: string; // JSON string array
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

export type JobStatus = "planned" | "in_progress" | "done" | "failed";

export interface Job {
  id: number;
  vehicle_id: number;
  procedure_id: number | null;
  technician: string;
  job_date: string;
  status: JobStatus;
  notes: string;
  checklist: string; // JSON string array of { label, done }
  created_at: string;
}

let db: Database.Database;

export function initDb(userDataPath: string): Database.Database {
  const dbPath = path.join(userDataPath, "coding-manager.sqlite3");
  fs.mkdirSync(userDataPath, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      vin TEXT DEFAULT '',
      engine TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS procedures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year_from INTEGER,
      year_to INTEGER,
      category TEXT NOT NULL CHECK (category IN ('coding','retrofit')),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      preconditions TEXT DEFAULT '',
      steps TEXT NOT NULL DEFAULT '[]',
      tools_needed TEXT DEFAULT '',
      risk_notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coding_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      procedure_id INTEGER REFERENCES procedures(id) ON DELETE SET NULL,
      filename TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      procedure_id INTEGER REFERENCES procedures(id) ON DELETE SET NULL,
      technician TEXT DEFAULT '',
      job_date TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','done','failed')),
      notes TEXT DEFAULT '',
      checklist TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_client ON vehicles(client_id);
    CREATE INDEX IF NOT EXISTS idx_procedures_make_model ON procedures(make, model);
    CREATE INDEX IF NOT EXISTS idx_coding_files_vehicle ON coding_files(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_vehicle ON jobs(vehicle_id);
  `);

  seedIfEmpty();
  return db;
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM procedures").get() as { c: number };
  if (count.c > 0) return;

  const insertProcedure = db.prepare(`
    INSERT INTO procedures (make, model, year_from, year_to, category, title, description, preconditions, steps, tools_needed, risk_notes)
    VALUES (@make, @model, @year_from, @year_to, @category, @title, @description, @preconditions, @steps, @tools_needed, @risk_notes)
  `);

  const seedData = [
    {
      make: "Volkswagen",
      model: "Golf 7",
      year_from: 2013,
      year_to: 2020,
      category: "retrofit",
      title: "Activare far cornering (dynamic light assist)",
      description: "Activarea functiei de virare a farurilor pentru vehicule echipate din fabrica cu faruri compatibile dar fara optiunea codata.",
      preconditions: "Vehiculul are hardware-ul de far compatibil montat; bateria la peste 12.5V; fara coduri de eroare active in modulul de lumini.",
      steps: JSON.stringify([
        "Conectare la mufa OBD si identificare modul Lumini (09 - Central Electrics / Lumini).",
        "Backup complet al codarii existente inainte de orice modificare.",
        "Activare byte de optiune pentru 'Cornering Light' in lista lunga de codare.",
        "Verificare si adaptare unghi in modulul de directie daca este necesar.",
        "Test functional: pornire motor, virare volan la unghi mare, verificare miscare far.",
        "Salvare raport final si arhivare fisier de coding."
      ]),
      tools_needed: "Interfata diagnoza compatibila VAG, acces la lista lunga de codare",
      risk_notes: "Coding gresit poate genera erori in modulul de lumini; pastrati intotdeauna backup inainte de modificare."
    },
    {
      make: "BMW",
      model: "Seria 3 F30",
      year_from: 2012,
      year_to: 2019,
      category: "coding",
      title: "Activare Adaptive Cruise Control (daca hardware prezent)",
      description: "Codare software pentru activarea ACC pe unitati echipate cu radarul aferent din fabrica, dar cu optiunea dezactivata din software.",
      preconditions: "Radar ACC fizic montat; FA (vehicle order) verificat pentru compatibilitate hardware.",
      steps: JSON.stringify([
        "Citire FA (Fahrzeugauftrag) si verificare optiuni disponibile.",
        "Backup complet al modulelor DME/DSC/FRM inainte de coding.",
        "Adaugare optiune in FA local pentru activare ACC.",
        "Codare completa a vehiculului (FDL / coding online sau offline).",
        "Test drive scurt pentru verificare functionare radar si afisaj bord.",
        "Documentare in fisa clientului si arhivare fisier FA modificat."
      ]),
      tools_needed: "Acces software de coding BMW, fisier FA original, backup complet ECU-uri implicate",
      risk_notes: "Necesita FA corect adaptat; coding incorect poate bloca alte functii ale vehiculului."
    },
    {
      make: "Skoda",
      model: "Octavia 3",
      year_from: 2013,
      year_to: 2020,
      category: "coding",
      title: "Activare inchidere geamuri / oglinzi la blocare cheie",
      description: "Codare confort pentru inchiderea automata a geamurilor si retragerea oglinzilor la incuierea vehiculului cu telecomanda.",
      preconditions: "Geamuri electrice cu functie one-touch pe toate usile; fara erori active in modulul Confort.",
      steps: JSON.stringify([
        "Backup coding modul Confort (Comfort/Convenience module).",
        "Activare byte 'inchidere geamuri la incuiere' si 'pliere oglinzi'.",
        "Setare timp de intarziere dupa preferinta clientului.",
        "Test complet: incuiere/descuiere cu telecomanda, verificare geamuri si oglinzi.",
        "Explicare functie noua clientului si arhivare fisier coding."
      ]),
      tools_needed: "Interfata diagnoza VAG",
      risk_notes: "Risc minim; se recomanda totusi backup inainte de orice coding."
    }
  ];

  const insertMany = db.transaction((rows: typeof seedData) => {
    for (const row of rows) insertProcedure.run(row);
  });
  insertMany(seedData);
}

export function getDb(): Database.Database {
  if (!db) throw new Error("Database not initialized");
  return db;
}
