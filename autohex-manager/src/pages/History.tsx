import React, { useEffect, useMemo, useState } from "react";
import type { Job, JobStatus } from "../types";

interface HistoryProps {
  onOpenVehicle: (id: number) => void;
}

export default function History({ onOpenVehicle }: HistoryProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");

  useEffect(() => { window.api.jobs.listAll().then(setJobs); }, []);

  const filtered = useMemo(
    () => jobs.filter((j) => statusFilter === "all" || j.status === statusFilter),
    [jobs, statusFilter]
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Istoric Interventii</h1>
          <p>Toate interventiile de coding si retrofit, pe toate vehiculele.</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} style={{ padding: "0.55rem 0.8rem", border: "1px solid var(--border)", borderRadius: 4 }}>
          <option value="all">Toate statusurile</option>
          <option value="planned">Planificat</option>
          <option value="in_progress">In lucru</option>
          <option value="done">Finalizat</option>
          <option value="failed">Esuat</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">Nicio interventie gasita.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Vehicul</th>
                <th>Procedura</th>
                <th>Tehnician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} onClick={() => onOpenVehicle(job.vehicle_id)} style={{ cursor: "pointer" }}>
                  <td>{new Date(job.job_date).toLocaleDateString("ro-RO")}</td>
                  <td className="row-link">{job.make} {job.model} {job.vin ? `(${job.vin})` : ""}</td>
                  <td>{job.procedure_title ?? "Interventie generala"}</td>
                  <td>{job.technician || "-"}</td>
                  <td><span className={`badge badge-${job.status}`}>{statusLabel(job.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
