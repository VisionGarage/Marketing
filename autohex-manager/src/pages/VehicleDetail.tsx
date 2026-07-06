import React, { useEffect, useState } from "react";
import type { CodingFile, Job, Procedure, Vehicle, ChecklistItem, JobStatus } from "../types";
import Modal from "../components/Modal";

interface VehicleDetailProps {
  vehicleId: number;
  onBack: () => void;
}

type Tab = "info" | "files" | "jobs";

export default function VehicleDetail({ vehicleId, onBack }: VehicleDetailProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [files, setFiles] = useState<CodingFile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [fileDesc, setFileDesc] = useState("");
  const [fileProcedureId, setFileProcedureId] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  function refreshAll() {
    window.api.vehicles.list().then((all) => setVehicle(all.find((v) => v.id === vehicleId) ?? null));
    window.api.files.listByVehicle(vehicleId).then(setFiles);
    window.api.jobs.listByVehicle(vehicleId).then(setJobs);
    window.api.procedures.list().then(setProcedures);
  }

  useEffect(() => { refreshAll(); }, [vehicleId]);

  async function attachFile() {
    const result = await window.api.files.attach(vehicleId, fileProcedureId ? Number(fileProcedureId) : null, fileDesc);
    if (result) {
      setFileDesc("");
      setFileProcedureId("");
      refreshAll();
    }
  }

  async function removeFile(id: number) {
    if (!confirm("Stergeti acest fisier de coding?")) return;
    await window.api.files.delete(id);
    refreshAll();
  }

  function openNewJob() {
    setEditingJob(null);
    setShowJobForm(true);
  }

  if (!vehicle) return <div className="empty-state">Se incarca...</div>;

  return (
    <div>
      <span className="back-link" onClick={onBack}>&larr; Inapoi la vehicule</span>
      <div className="detail-header">
        <h1>{vehicle.make} {vehicle.model}</h1>
        {vehicle.year && <span className="muted">({vehicle.year})</span>}
      </div>
      <p className="muted mb-1">
        {vehicle.vin ? `VIN: ${vehicle.vin} · ` : ""}{vehicle.client_name ? `Client: ${vehicle.client_name}` : "Fara client asociat"}
      </p>

      <div className="tabs">
        <div className={`tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>Informatii</div>
        <div className={`tab ${tab === "files" ? "active" : ""}`} onClick={() => setTab("files")}>Fisiere Coding ({files.length})</div>
        <div className={`tab ${tab === "jobs" ? "active" : ""}`} onClick={() => setTab("jobs")}>Interventii ({jobs.length})</div>
      </div>

      {tab === "info" && (
        <div className="card card-pad">
          <table>
            <tbody>
              <tr><td className="muted">Motorizare</td><td>{vehicle.engine || "-"}</td></tr>
              <tr><td className="muted">Note</td><td>{vehicle.notes || "-"}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "files" && (
        <div>
          <div className="card mb-1">
            <div className="card-pad">
              <h3 style={{ fontSize: "0.9rem", marginBottom: "0.8rem" }}>Ataseaza fisier de coding</h3>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Procedura asociata (optional)</label>
                  <select value={fileProcedureId} onChange={(e) => setFileProcedureId(e.target.value)}>
                    <option value="">Fara procedura asociata</option>
                    {procedures.map((p) => <option key={p.id} value={p.id}>{p.make} {p.model} - {p.title}</option>)}
                  </select>
                </div>
                <div className="form-field full">
                  <label>Descriere</label>
                  <input value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} placeholder="ex: backup inainte de coding ACC" />
                </div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={attachFile}>Selecteaza si ataseaza fisier</button>
            </div>
          </div>

          <div className="card">
            {files.length === 0 ? (
              <div className="empty-state">Niciun fisier atasat inca.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Fisier</th><th>Descriere</th><th>Data</th><th></th></tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr key={f.id}>
                      <td>{f.filename}</td>
                      <td>{f.description || "-"}</td>
                      <td>{new Date(f.created_at).toLocaleString("ro-RO")}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => window.api.files.openFolder(f.stored_path)}>Deschide folder</button>{" "}
                        <button className="btn btn-danger btn-sm" onClick={() => removeFile(f.id)}>Sterge</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "jobs" && (
        <div>
          <div className="flex-between mb-1">
            <div />
            <button className="btn btn-gold btn-sm" onClick={openNewJob}>+ Interventie noua</button>
          </div>
          <div className="card">
            {jobs.length === 0 ? (
              <div className="empty-state">Nicio interventie inregistrata inca.</div>
            ) : (
              jobs.map((job) => (
                <JobRow key={job.id} job={job} procedures={procedures} onChanged={refreshAll} />
              ))
            )}
          </div>
        </div>
      )}

      {showJobForm && (
        <JobFormModal
          vehicleId={vehicleId}
          procedures={procedures}
          job={editingJob}
          onClose={() => setShowJobForm(false)}
          onSaved={() => { setShowJobForm(false); refreshAll(); }}
        />
      )}
    </div>
  );
}

function JobRow({ job, procedures, onChanged }: { job: Job; procedures: Procedure[]; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const checklist: ChecklistItem[] = JSON.parse(job.checklist || "[]");

  async function toggleItem(idx: number) {
    const updated = [...checklist];
    updated[idx] = { ...updated[idx], done: !updated[idx].done };
    await window.api.jobs.upsert({ ...job, checklist: JSON.stringify(updated) });
    onChanged();
  }

  async function setStatus(status: JobStatus) {
    await window.api.jobs.upsert({ ...job, status });
    onChanged();
  }

  async function remove() {
    if (!confirm("Stergeti aceasta interventie?")) return;
    await window.api.jobs.delete(job.id);
    onChanged();
  }

  const procedure = procedures.find((p) => p.id === job.procedure_id);

  return (
    <div className="card-pad" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex-between" style={{ cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div>
          <strong>{procedure?.title ?? "Interventie generala"}</strong>{" "}
          <span className="muted small">· {new Date(job.job_date).toLocaleDateString("ro-RO")}{job.technician ? ` · ${job.technician}` : ""}</span>
        </div>
        <span className={`badge badge-${job.status}`}>{statusLabel(job.status)}</span>
      </div>
      {expanded && (
        <div className="mt-1">
          {job.notes && <p className="small mb-1">{job.notes}</p>}
          {checklist.length > 0 && (
            <div className="mb-1">
              {checklist.map((item, idx) => (
                <label key={idx} className="checklist-item">
                  <input type="checkbox" checked={item.done} onChange={() => toggleItem(idx)} />
                  {item.label}
                </label>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select value={job.status} onChange={(e) => setStatus(e.target.value as JobStatus)} style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--border)", borderRadius: 4 }}>
              <option value="planned">Planificat</option>
              <option value="in_progress">In lucru</option>
              <option value="done">Finalizat</option>
              <option value="failed">Esuat</option>
            </select>
            <button className="btn btn-danger btn-sm" onClick={remove}>Sterge interventie</button>
          </div>
        </div>
      )}
    </div>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "planned": return "Planificat";
    case "in_progress": return "In lucru";
    case "done": return "Finalizat";
    case "failed": return "Esuat";
    default: return status;
  }
}

function JobFormModal({
  vehicleId, procedures, job, onClose, onSaved
}: {
  vehicleId: number;
  procedures: Procedure[];
  job: Job | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [procedureId, setProcedureId] = useState(job?.procedure_id?.toString() ?? "");
  const [technician, setTechnician] = useState(job?.technician ?? "");
  const [jobDate, setJobDate] = useState(job?.job_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(job?.notes ?? "");

  const selectedProcedure = procedures.find((p) => p.id === Number(procedureId));

  async function save() {
    const checklist: ChecklistItem[] = selectedProcedure
      ? (JSON.parse(selectedProcedure.steps || "[]") as string[]).map((s) => ({ label: s, done: false }))
      : [];
    await window.api.jobs.upsert({
      id: job?.id,
      vehicle_id: vehicleId,
      procedure_id: procedureId ? Number(procedureId) : null,
      technician: technician.trim(),
      job_date: jobDate,
      status: job?.status ?? "planned",
      notes: notes.trim(),
      checklist: JSON.stringify(job ? JSON.parse(job.checklist || "[]") : checklist)
    });
    onSaved();
  }

  return (
    <Modal
      title="Interventie noua"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Anuleaza</button>
          <button className="btn btn-gold btn-sm" onClick={save}>Salveaza</button>
        </>
      }
    >
      <div className="form-field">
        <label>Procedura (optional, genereaza checklist automat)</label>
        <select value={procedureId} onChange={(e) => setProcedureId(e.target.value)}>
          <option value="">Interventie generala</option>
          {procedures.map((p) => <option key={p.id} value={p.id}>{p.make} {p.model} - {p.title}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label>Tehnician</label>
        <input value={technician} onChange={(e) => setTechnician(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Data</label>
        <input type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Note</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
