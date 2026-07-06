import { ipcMain, dialog, shell, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { getDb } from "./db";

export function registerIpcHandlers(filesDir: string) {
  const db = getDb();

  // ---- Clients ----
  ipcMain.handle("clients:list", () => {
    return db.prepare("SELECT * FROM clients ORDER BY name COLLATE NOCASE").all();
  });

  ipcMain.handle("clients:upsert", (_e, client) => {
    if (client.id) {
      db.prepare(
        "UPDATE clients SET name=@name, phone=@phone, email=@email, notes=@notes WHERE id=@id"
      ).run(client);
      return client.id;
    }
    const info = db
      .prepare("INSERT INTO clients (name, phone, email, notes) VALUES (@name, @phone, @email, @notes)")
      .run(client);
    return info.lastInsertRowid;
  });

  ipcMain.handle("clients:delete", (_e, id: number) => {
    db.prepare("DELETE FROM clients WHERE id=?").run(id);
  });

  // ---- Vehicles ----
  ipcMain.handle("vehicles:list", () => {
    return db
      .prepare(
        `SELECT v.*, c.name as client_name FROM vehicles v
         LEFT JOIN clients c ON c.id = v.client_id
         ORDER BY v.created_at DESC`
      )
      .all();
  });

  ipcMain.handle("vehicles:upsert", (_e, vehicle) => {
    if (vehicle.id) {
      db.prepare(
        `UPDATE vehicles SET client_id=@client_id, make=@make, model=@model, year=@year,
         vin=@vin, engine=@engine, notes=@notes WHERE id=@id`
      ).run(vehicle);
      return vehicle.id;
    }
    const info = db
      .prepare(
        `INSERT INTO vehicles (client_id, make, model, year, vin, engine, notes)
         VALUES (@client_id, @make, @model, @year, @vin, @engine, @notes)`
      )
      .run(vehicle);
    return info.lastInsertRowid;
  });

  ipcMain.handle("vehicles:delete", (_e, id: number) => {
    db.prepare("DELETE FROM vehicles WHERE id=?").run(id);
  });

  // ---- Procedures ----
  ipcMain.handle("procedures:list", () => {
    return db.prepare("SELECT * FROM procedures ORDER BY make, model, title").all();
  });

  ipcMain.handle("procedures:upsert", (_e, proc) => {
    const now = new Date().toISOString();
    if (proc.id) {
      db.prepare(
        `UPDATE procedures SET make=@make, model=@model, year_from=@year_from, year_to=@year_to,
         category=@category, title=@title, description=@description, preconditions=@preconditions,
         steps=@steps, tools_needed=@tools_needed, risk_notes=@risk_notes, updated_at=@updated_at
         WHERE id=@id`
      ).run({ ...proc, updated_at: now });
      return proc.id;
    }
    const info = db
      .prepare(
        `INSERT INTO procedures (make, model, year_from, year_to, category, title, description,
         preconditions, steps, tools_needed, risk_notes)
         VALUES (@make, @model, @year_from, @year_to, @category, @title, @description,
         @preconditions, @steps, @tools_needed, @risk_notes)`
      )
      .run(proc);
    return info.lastInsertRowid;
  });

  ipcMain.handle("procedures:delete", (_e, id: number) => {
    db.prepare("DELETE FROM procedures WHERE id=?").run(id);
  });

  // ---- Coding files ----
  ipcMain.handle("files:listByVehicle", (_e, vehicleId: number) => {
    return db
      .prepare("SELECT * FROM coding_files WHERE vehicle_id=? ORDER BY created_at DESC")
      .all(vehicleId);
  });

  ipcMain.handle("files:attach", async (_e, vehicleId: number, procedureId: number | null, description: string) => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? undefined as any, {
      properties: ["openFile"],
      title: "Selecteaza fisier de coding"
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const sourcePath = result.filePaths[0];
    const originalName = path.basename(sourcePath);
    const vehicleDir = path.join(filesDir, String(vehicleId));
    fs.mkdirSync(vehicleDir, { recursive: true });
    const storedName = `${Date.now()}-${originalName}`;
    const destPath = path.join(vehicleDir, storedName);
    fs.copyFileSync(sourcePath, destPath);

    const info = db
      .prepare(
        `INSERT INTO coding_files (vehicle_id, procedure_id, filename, stored_path, description)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(vehicleId, procedureId, originalName, destPath, description ?? "");

    return db.prepare("SELECT * FROM coding_files WHERE id=?").get(info.lastInsertRowid);
  });

  ipcMain.handle("files:openFolder", (_e, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("files:delete", (_e, id: number) => {
    const file = db.prepare("SELECT * FROM coding_files WHERE id=?").get(id) as any;
    if (file) {
      try {
        fs.unlinkSync(file.stored_path);
      } catch {
        // file may already be missing on disk; DB record removal still proceeds
      }
    }
    db.prepare("DELETE FROM coding_files WHERE id=?").run(id);
  });

  // ---- Jobs / history ----
  ipcMain.handle("jobs:listByVehicle", (_e, vehicleId: number) => {
    return db.prepare("SELECT * FROM jobs WHERE vehicle_id=? ORDER BY job_date DESC").all(vehicleId);
  });

  ipcMain.handle("jobs:listAll", () => {
    return db
      .prepare(
        `SELECT j.*, v.make, v.model, v.vin, p.title as procedure_title
         FROM jobs j
         LEFT JOIN vehicles v ON v.id = j.vehicle_id
         LEFT JOIN procedures p ON p.id = j.procedure_id
         ORDER BY j.job_date DESC`
      )
      .all();
  });

  ipcMain.handle("jobs:upsert", (_e, job) => {
    if (job.id) {
      db.prepare(
        `UPDATE jobs SET vehicle_id=@vehicle_id, procedure_id=@procedure_id, technician=@technician,
         job_date=@job_date, status=@status, notes=@notes, checklist=@checklist WHERE id=@id`
      ).run(job);
      return job.id;
    }
    const info = db
      .prepare(
        `INSERT INTO jobs (vehicle_id, procedure_id, technician, job_date, status, notes, checklist)
         VALUES (@vehicle_id, @procedure_id, @technician, @job_date, @status, @notes, @checklist)`
      )
      .run(job);
    return info.lastInsertRowid;
  });

  ipcMain.handle("jobs:delete", (_e, id: number) => {
    db.prepare("DELETE FROM jobs WHERE id=?").run(id);
  });
}
